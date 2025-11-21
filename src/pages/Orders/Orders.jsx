import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useDataManager, useCurrentUser } from "../../hooks/useDataManager";
import { useOrders } from "../../hooks/useData";
import FirestoreService from "../../services/FirestoreService";
import { useSearchParams } from "react-router-dom";
const Orders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser } = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get orders from Firebase and localStorage (useOrders already combines them)
  const { orders: allOrders } = useOrders({});
  
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [updateStatusAnchor, setUpdateStatusAnchor] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Check for success message from checkout
  useEffect(() => {
    const success = searchParams.get("success");
    const type = searchParams.get("type");
    if (success === "true") {
      if (type === "order") {
        setSnackbar({
          open: true,
          message: "Order placed successfully! Payment has been processed.",
          severity: "success",
        });
      }
      // Clean URL
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  }, []);

  // Filter orders based on user role and remove duplicates
  const orders = useMemo(() => {
    if (!currentUser) return [];
    
    let filtered = allOrders;
    
    if (currentUser.role === "Pharmacy") {
      // Filter orders for current pharmacy
      const pharmacyId = currentUser.email;
      const pharmacyName = currentUser.pharmacyProfile?.pharmacyName || currentUser.pharmacyProfile?.name;
      
      filtered = allOrders.filter((order) => {
        const orderPharmacyId = String(order.pharmacyId || "").toLowerCase();
        const orderPharmacyName = String(order.pharmacyName || "").toLowerCase();
        const currentPharmacyId = String(pharmacyId).toLowerCase();
        const currentPharmacyName = String(pharmacyName || "").toLowerCase();
        
        return orderPharmacyId === currentPharmacyId ||
               orderPharmacyName === currentPharmacyName ||
               orderPharmacyId === currentPharmacyName ||
               orderPharmacyName === currentPharmacyId ||
               (order.items && Array.isArray(order.items) && order.items.some(item => {
                 const itemPharmacyId = String(item.pharmacyId || "").toLowerCase();
                 const itemPharmacyName = String(item.pharmacyName || "").toLowerCase();
                 return itemPharmacyId === currentPharmacyId ||
                        itemPharmacyName === currentPharmacyName ||
                        itemPharmacyId === currentPharmacyName ||
                        itemPharmacyName === currentPharmacyId;
               }));
      });
    } else if (currentUser.role === "Patient") {
      // Filter orders for current patient
      const patientId = currentUser.email;
      filtered = allOrders.filter((order) => {
        const orderPatientId = String(order.patientId || "").toLowerCase();
        return orderPatientId === String(patientId).toLowerCase();
      });
    }
    
    // Remove duplicates by ID using Map
    // Also create a composite key to catch duplicates with same data but different IDs
    const uniqueOrdersMap = new Map();
    const seenIds = new Set();
    const seenCompositeKeys = new Set();
    
    filtered.forEach((order) => {
      const orderId = String(order.id || "").trim();
      
      // Skip if no ID or already seen
      if (!orderId || seenIds.has(orderId)) {
        return;
      }
      
      // Create composite key from order data to catch duplicates
      const compositeKey = `${String(order.patientId || "").toLowerCase()}-${String(order.pharmacyId || "").toLowerCase()}-${String(order.date || "")}-${String(order.total || 0)}`;
      
      // Skip if we've seen this composite key (same order with different ID)
      if (seenCompositeKeys.has(compositeKey)) {
        return;
      }
      
      // Add to map and mark as seen
      uniqueOrdersMap.set(orderId, order);
      seenIds.add(orderId);
      seenCompositeKeys.add(compositeKey);
    });
    
    // Convert to array and map to display format
    return Array.from(uniqueOrdersMap.values()).map((order) => ({
      id: order.id,
      orderId: order.id,
      patient: order.patientName || "Unknown Patient",
      patientId: order.patientId,
      items: order.items || [],
      totalPrice: order.total || order.totalPrice || 0,
      status: order.status || "pending",
      date: formatDate(order.date),
      rawDate: order.date,
      pharmacyId: order.pharmacyId,
      pharmacyName: order.pharmacyName || order.items?.[0]?.pharmacyName,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    }));
  }, [allOrders, currentUser, formatDate]);

  const getStatusLabel = (status) => {
    const statusLower = String(status || "").toLowerCase();
    switch (statusLower) {
      case "pending":
      case "معلق":
        return "Pending";
      case "shipped":
      case "تم الشحن":
        return "Shipped";
      case "delivered":
      case "تم التوصيل":
        return "Delivered";
      case "completed":
      case "مكتمل":
        return "Completed";
      default:
        return status || "Pending";
    }
  };

  const getStatusColor = (status) => {
    const statusLower = String(status || "").toLowerCase();
    switch (statusLower) {
      case "pending":
      case "معلق":
        return "warning";
      case "shipped":
      case "تم الشحن":
        return "info";
      case "delivered":
      case "تم التوصيل":
        return "info";
      case "completed":
      case "مكتمل":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusBgColor = (status) => {
    const statusLower = String(status || "").toLowerCase();
    switch (statusLower) {
      case "pending":
      case "معلق":
        return "#fff3e0";
      case "shipped":
      case "تم الشحن":
        return "#e1f5fe";
      case "delivered":
      case "تم التوصيل":
        return "#e3f2fd";
      case "completed":
      case "مكتمل":
        return "#e8f5e9";
      default:
        return "#f5f5f5";
    }
  };

  const getStatusTextColor = (status) => {
    const statusLower = String(status || "").toLowerCase();
    switch (statusLower) {
      case "pending":
      case "معلق":
        return "#ef6c00";
      case "shipped":
      case "تم الشحن":
        return "#0277bd";
      case "delivered":
      case "تم التوصيل":
        return "#1565c0";
      case "completed":
      case "مكتمل":
        return "#2e7d32";
      default:
        return "#424242";
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleUpdateStatusClick = (event, order) => {
    setUpdateStatusAnchor(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleUpdateStatusClose = () => {
    setUpdateStatusAnchor(null);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (selectedOrder) {
      try {
        // Try to find the order in Firebase first to get the correct document ID
        const allFirebaseOrders = await FirestoreService.getOrders({});
        
        let firebaseOrder = allFirebaseOrders.find(o => {
          const orderId = String(o.id || "");
          const selectedId = String(selectedOrder.id || "");
          return orderId === selectedId || orderId === String(selectedOrder.orderId || "");
        });
        
        // If not found by ID, try to find by patientId and pharmacyId and date
        if (!firebaseOrder && selectedOrder.patientId && selectedOrder.pharmacyId) {
          firebaseOrder = allFirebaseOrders.find(o => {
            const orderPatientId = String(o.patientId || "").toLowerCase();
            const orderPharmacyId = String(o.pharmacyId || "").toLowerCase();
            const selectedPatientId = String(selectedOrder.patientId).toLowerCase();
            const selectedPharmacyId = String(selectedOrder.pharmacyId).toLowerCase();
            
            return orderPatientId === selectedPatientId && orderPharmacyId === selectedPharmacyId;
          });
        }
        
        if (firebaseOrder && firebaseOrder.id) {
          // Order exists in Firebase, update it
          // The id from getOrders should be the document ID
          const orderIdString = String(firebaseOrder.id);
          
          // Try to update - if it fails because document doesn't exist, 
          // it means the order data has an id field that doesn't match the document ID
          try {
            await FirestoreService.updateOrder(orderIdString, { 
              status: newStatus,
            });
          } catch (updateError) {
            // If document doesn't exist, try to find the actual document ID
            if (updateError.message && updateError.message.includes("does not exist")) {
              // Try to find the document by querying with patientId and pharmacyId
              const { collection, query, where, getDocs } = await import("firebase/firestore");
              const { db } = await import("../../firebase/config");
              
              if (firebaseOrder.patientId && firebaseOrder.pharmacyId) {
                const ordersRef = collection(db, "orders");
                const q = query(
                  ordersRef,
                  where("patientId", "==", firebaseOrder.patientId),
                  where("pharmacyId", "==", firebaseOrder.pharmacyId)
                );
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                  // Found the document, use its actual ID
                  const actualDoc = querySnapshot.docs[0];
                  const actualDocId = actualDoc.id;
                  
                  await FirestoreService.updateOrder(actualDocId, { 
                    status: newStatus,
                  });
                } else {
                  throw new Error("Order document not found in Firebase by query");
                }
              } else {
                throw updateError;
              }
            } else {
              throw updateError;
            }
          }
        }
        
        // Always update in localStorage for backward compatibility
        // Only update if order exists in localStorage to avoid duplicates
        const orders = JSON.parse(localStorage.getItem("Orders") || "[]");
        const orderExists = orders.some(order => 
          order.id === selectedOrder.id || 
          String(order.id) === String(selectedOrder.id)
        );
        
        if (orderExists) {
          const updatedOrders = orders.map(order => 
            order.id === selectedOrder.id || String(order.id) === String(selectedOrder.id)
              ? { ...order, status: newStatus }
              : order
          );
          localStorage.setItem("Orders", JSON.stringify(updatedOrders));
          window.dispatchEvent(new Event("storage"));
        }
        
        // Create notification for patient when order status is updated
        const orderToNotify = firebaseOrder || selectedOrder;
        if (orderToNotify && orderToNotify.patientId && currentUser?.role === "Pharmacy") {
          const statusMessages = {
            pending: "Your order is pending",
            shipped: "Your order has been shipped",
            delivered: "Your order has been delivered",
            completed: "Your order has been completed",
          };
          
          const statusTitles = {
            pending: "Order Status Updated",
            shipped: "Order Shipped",
            delivered: "Order Delivered",
            completed: "Order Completed",
          };
          
          const statusLabel = getStatusLabel(newStatus);
          const pharmacyName = orderToNotify.pharmacyName || currentUser?.pharmacyProfile?.pharmacyName || "Pharmacy";
          
          const patientNotification = {
            type: "order",
            title: statusTitles[newStatus.toLowerCase()] || "Order Status Updated",
            message: `${pharmacyName}: ${statusMessages[newStatus.toLowerCase()] || `Your order status has been updated to ${statusLabel}`}`,
            patientId: orderToNotify.patientId,
            orderId: orderToNotify.id || orderToNotify.orderId,
            read: false,
          };
          
          // Save notification to Firebase
          try {
            await FirestoreService.addNotification(patientNotification);
          } catch (error) {
            console.error("❌ Error sending notification to patient:", error);
          }
          
          // Also save to localStorage for backward compatibility
          try {
            const notifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
            notifications.push({ 
              ...patientNotification, 
              id: Date.now() + Math.random(), 
              date: new Date().toISOString() 
            });
            localStorage.setItem("Notifications", JSON.stringify(notifications));
            window.dispatchEvent(new Event("storage"));
          } catch (error) {
            console.error("❌ Error saving notification to localStorage:", error);
          }
        }
        
        setSnackbar({ 
          open: true, 
          message: firebaseOrder 
            ? "Order status updated successfully" 
            : "Order status updated in local storage (order not found in Firebase)",
          severity: "success" 
        });
      } catch (error) {
        console.error("Error updating order status:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          stack: error.stack,
        });
        
        // Even if Firebase update fails, update localStorage
        try {
          const orders = JSON.parse(localStorage.getItem("Orders") || "[]");
          const updatedOrders = orders.map(order => 
            order.id === selectedOrder.id ? { ...order, status: newStatus } : order
          );
          localStorage.setItem("Orders", JSON.stringify(updatedOrders));
          window.dispatchEvent(new Event("storage"));
        } catch (localError) {
          console.error("Error updating localStorage:", localError);
        }
        
        setSnackbar({ 
          open: true, 
          message: `Failed to update order status in Firebase: ${error.message || "Unknown error"}. Updated in local storage.`,
          severity: "warning" 
        });
      }
    }
    handleUpdateStatusClose();
  };

  const handleViewDetails = (order) => {
    setSelectedOrderDetails(order);
    setOrderDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrderDetails(null);
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "All" && order.status !== statusFilter) {
      return false;
    }
    // Add date filtering logic here if needed
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue, bValue;
    if (sortColumn === "patient") {
      aValue = a.patient.toLowerCase();
      bValue = b.patient.toLowerCase();
    } else if (sortColumn === "date") {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    } else {
      return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 1, fontSize: { xs: "1.5rem", sm: "2rem" } }}
            >
              Orders
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Manage and track all incoming patient orders.
            </Typography>
          </Box>
        </Box>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            flexWrap: "wrap",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 150 },
              flex: { xs: 1, sm: 0 },
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              MenuProps={{ disableScrollLock: true }}
              startAdornment={<FilterListIcon sx={{ mr: 1, color: "text.secondary" }} />}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 150 },
              flex: { xs: 1, sm: 0 },
            }}
          >
            <InputLabel>Date</InputLabel>
            <Select
              value={dateFilter}
              label="Date"
              onChange={(e) => setDateFilter(e.target.value)}
              MenuProps={{ disableScrollLock: true }}
              startAdornment={<CalendarTodayIcon sx={{ mr: 1, color: "text.secondary" }} />}
            >
              <MenuItem value="All Time">All Time</MenuItem>
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="This Week">This Week</MenuItem>
              <MenuItem value="This Month">This Month</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Orders - Desktop Table View */}
      {!isMobile && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => handleSort("patient")}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {currentUser?.role === "Pharmacy" ? "Patient" : "Pharmacy"}
                        </Typography>
                        {sortColumn === "patient" ? (
                          sortDirection === "asc" ? (
                            <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                          )
                        ) : (
                          <Box sx={{ width: 16 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Items
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Total Price
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => handleSort("date")}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Date
                        </Typography>
                        {sortColumn === "date" ? (
                          sortDirection === "asc" ? (
                            <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                          )
                        ) : (
                          <Box sx={{ width: 16 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {currentUser?.role === "Pharmacy" ? order.patient : (order.pharmacyName || "Unknown Pharmacy")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {order.items.map((item, index) => (
                            <Typography key={index} variant="body2" color="text.secondary">
                              {item.name} ({item.quantity})
                              {index < order.items.length - 1 && ", "}
                            </Typography>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600}>
                          ${order.totalPrice.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(order.status)}
                          size="small"
                          sx={{
                            backgroundColor: getStatusBgColor(order.status),
                            color: getStatusTextColor(order.status),
                            fontWeight: 500,
                            borderRadius: "16px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {order.date}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewDetails(order)}
                            title="View Details"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          {currentUser?.role === "Pharmacy" && (
                            <Button
                              variant="contained"
                              size="small"
                              endIcon={<KeyboardArrowDownIcon />}
                              onClick={(e) => handleUpdateStatusClick(e, order)}
                              sx={{ textTransform: "none", minWidth: 140 }}
                            >
                              Update Status
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Orders - Mobile Card View */}
      {isMobile && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sortedOrders.map((order) => (
            <Card key={order.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ p: 2 }}>
                {/* Patient Name and Status */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: "1rem" }}>
                    {currentUser?.role === "Pharmacy" ? order.patient : (order.pharmacyName || "Unknown Pharmacy")}
                  </Typography>
                  <Chip
                    label={getStatusLabel(order.status)}
                    size="small"
                    sx={{
                      backgroundColor: getStatusBgColor(order.status),
                      color: getStatusTextColor(order.status),
                      fontWeight: 500,
                      borderRadius: "16px",
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Items */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                    Items:
                  </Typography>
                  {order.items.map((item, index) => (
                    <Typography key={index} variant="body2" color="text.primary" sx={{ ml: 1 }}>
                      • {item.name} ({item.quantity})
                    </Typography>
                  ))}
                </Box>

                {/* Total Price and Date */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                      Total Price:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: "1.1rem" }}>
                      ${order.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                      Date:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.date}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    sx={{ border: `1px solid ${theme.palette.primary.main}` }}
                    onClick={() => handleViewDetails(order)}
                    title="View Details"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  {currentUser?.role === "Pharmacy" && (
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<KeyboardArrowDownIcon />}
                      onClick={(e) => handleUpdateStatusClick(e, order)}
                      sx={{
                        textTransform: "none",
                        flex: 1,
                        minWidth: 0,
                        fontSize: "0.75rem",
                      }}
                    >
                      Update Status
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Update Status Menu */}
      <Menu
        anchorEl={updateStatusAnchor}
        open={Boolean(updateStatusAnchor)}
        onClose={handleUpdateStatusClose}
        disableScrollLock
      >
        <MenuItem onClick={() => handleStatusChange("pending")}>Pending</MenuItem>
        <MenuItem onClick={() => handleStatusChange("shipped")}>Shipped</MenuItem>
        <MenuItem onClick={() => handleStatusChange("delivered")}>Delivered</MenuItem>
        <MenuItem onClick={() => handleStatusChange("completed")}>Completed</MenuItem>
      </Menu>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        disableScrollLock
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            borderBottom: "1px solid #E0E0E0",
            backgroundColor: "#F9FAFB",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ReceiptIcon sx={{ color: "#1E88E5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1C1C1C" }}>
              Order Details
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDetails}
            sx={{
              color: "#757575",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {selectedOrderDetails && (
            <Box>
              {/* Order Information Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: "1px solid #E0E0E0",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <ReceiptIcon sx={{ fontSize: 18, color: "#757575" }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#757575",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Order ID
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={600} sx={{ color: "#1C1C1C", fontSize: "0.95rem" }}>
                        {selectedOrderDetails.orderId || selectedOrderDetails.id}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: "1px solid #E0E0E0",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#757575",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Status
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(selectedOrderDetails.status)}
                        size="medium"
                        sx={{
                          backgroundColor: getStatusBgColor(selectedOrderDetails.status),
                          color: getStatusTextColor(selectedOrderDetails.status),
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          height: 32,
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                {currentUser?.role === "Pharmacy" ? (
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        border: "1px solid #E0E0E0",
                        height: "100%",
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: "#757575" }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#757575",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            Patient Name
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={500} sx={{ color: "#1C1C1C", fontSize: "0.95rem" }}>
                          {selectedOrderDetails.patient}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : (
                  selectedOrderDetails.pharmacyName && (
                    <Grid item xs={12} sm={6}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          border: "1px solid #E0E0E0",
                          height: "100%",
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <LocalPharmacyIcon sx={{ fontSize: 18, color: "#757575" }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#757575",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Pharmacy
                            </Typography>
                          </Box>
                          <Typography variant="body1" fontWeight={500} sx={{ color: "#1C1C1C", fontSize: "0.95rem" }}>
                            {selectedOrderDetails.pharmacyName}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                )}
                <Grid item xs={12} sm={6}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: "1px solid #E0E0E0",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 18, color: "#757575" }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#757575",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={500} sx={{ color: "#1C1C1C", fontSize: "0.95rem" }}>
                        {selectedOrderDetails.date}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {selectedOrderDetails.paymentMethod && (
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        border: "1px solid #E0E0E0",
                        height: "100%",
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <PaymentIcon sx={{ fontSize: 18, color: "#757575" }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#757575",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            Payment Method
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={500} sx={{ color: "#1C1C1C", fontSize: "0.95rem" }}>
                          {selectedOrderDetails.paymentMethod}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              {/* Items Section */}
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E0E0E0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 2, color: "#1C1C1C", display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <ShoppingCartIcon sx={{ fontSize: 20, color: "#1E88E5" }} />
                    Order Items
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {selectedOrderDetails.items.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#FAFAFA",
                          border: "1px solid #E0E0E0",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={600} sx={{ color: "#1C1C1C", mb: 0.5 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#757575", fontSize: "0.875rem" }}>
                            Quantity: {item.quantity} × ${item.price?.toFixed(2) || 0}
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#1E88E5", fontSize: "1rem" }}>
                          ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Delivery Progress */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E0E0E0",
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#1C1C1C",
                      mb: 3,
                      fontSize: "1.1rem",
                    }}
                  >
                    Delivery Progress for #{selectedOrderDetails.orderId || selectedOrderDetails.id}
                  </Typography>
                  
                  {/* Progress Bar */}
                  <Box sx={{ position: "relative", mb: 4 }}>
                    {/* Progress Line Background */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 20,
                        left: 0,
                        right: 0,
                        height: 3,
                        backgroundColor: "#E0E0E0",
                        zIndex: 0,
                      }}
                    />
                    
                    {/* Completed Progress Line - Ordered is always complete (33.33%) */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 20,
                        left: 0,
                        height: 3,
                        backgroundColor: "#1E88E5",
                        zIndex: 1,
                        width: selectedOrderDetails.status?.toLowerCase() === "delivered" ? "100%" : 
                               selectedOrderDetails.status?.toLowerCase() === "shipped" ? "66.66%" : "33.33%",
                        transition: "width 0.3s ease",
                      }}
                    />
                    
                    {/* Stages */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
                      {/* Ordered Stage */}
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: "#1E88E5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            mb: 1,
                            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.3)",
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#1C1C1C",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          Ordered
                        </Typography>
                      </Box>
                      
                      {/* Shipped Stage */}
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: selectedOrderDetails.status?.toLowerCase() === "delivered" || selectedOrderDetails.status?.toLowerCase() === "shipped" 
                              ? "#1E88E5" 
                              : "#E0E0E0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: selectedOrderDetails.status?.toLowerCase() === "delivered" || selectedOrderDetails.status?.toLowerCase() === "shipped" 
                              ? "white" 
                              : "#9E9E9E",
                            mb: 1,
                            boxShadow: selectedOrderDetails.status?.toLowerCase() === "delivered" || selectedOrderDetails.status?.toLowerCase() === "shipped"
                              ? "0 2px 8px rgba(30, 136, 229, 0.3)"
                              : "none",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {selectedOrderDetails.status?.toLowerCase() === "delivered" || selectedOrderDetails.status?.toLowerCase() === "shipped" ? (
                            <CheckCircleIcon sx={{ fontSize: 24 }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ fontSize: 24 }} />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#1C1C1C",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          Shipped
                        </Typography>
                      </Box>
                      
                      {/* Delivered Stage */}
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: selectedOrderDetails.status?.toLowerCase() === "delivered" 
                              ? "#1E88E5" 
                              : "#E0E0E0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: selectedOrderDetails.status?.toLowerCase() === "delivered" 
                              ? "white" 
                              : "#9E9E9E",
                            mb: 1,
                            boxShadow: selectedOrderDetails.status?.toLowerCase() === "delivered"
                              ? "0 2px 8px rgba(30, 136, 229, 0.3)"
                              : "none",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {selectedOrderDetails.status?.toLowerCase() === "delivered" ? (
                            <CheckCircleIcon sx={{ fontSize: 24 }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ fontSize: 24 }} />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: selectedOrderDetails.status?.toLowerCase() === "delivered" ? "#1C1C1C" : "#9E9E9E",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          Delivered
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Total Price */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "2px solid #1E88E5",
                  backgroundColor: "#E3F2FD",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "#1C1C1C" }}>
                      Total Price:
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: "#1E88E5" }}>
                      ${selectedOrderDetails.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, borderTop: "1px solid #E0E0E0" }}>
          <Button
            onClick={handleCloseDetails}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1,
              backgroundColor: "#1E88E5",
              "&:hover": {
                backgroundColor: "#005CB2",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Orders;

