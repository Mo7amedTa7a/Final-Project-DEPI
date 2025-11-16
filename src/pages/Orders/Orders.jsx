import React, { useState } from "react";
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
} from "@mui/material";
import Grid from '@mui/material/Grid';
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { mockOrders } from "../../Data/OrdersData";

const Orders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [updateStatusAnchor, setUpdateStatusAnchor] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Load orders from data file
  const [orders] = useState(mockOrders);

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "error";
      case "Preparing":
        return "warning";
      case "Ready for Pickup":
        return "info";
      case "Completed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "New":
        return "#ffebee";
      case "Preparing":
        return "#fff3e0";
      case "Ready for Pickup":
        return "#e3f2fd";
      case "Completed":
        return "#e8f5e9";
      default:
        return "#f5f5f5";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "New":
        return "#c62828";
      case "Preparing":
        return "#ef6c00";
      case "Ready for Pickup":
        return "#1565c0";
      case "Completed":
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

  const handleStatusChange = (newStatus) => {
    // Here you would update the order status in your data store
    if (selectedOrder) {
      console.log(`Updating order ${selectedOrder.id} to ${newStatus}`);
      // Update order status logic here
    }
    handleUpdateStatusClose();
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
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Export Orders
          </Button>
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
              startAdornment={<FilterListIcon sx={{ mr: 1, color: "text.secondary" }} />}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="Preparing">Preparing</MenuItem>
              <MenuItem value="Ready for Pickup">Ready for Pickup</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
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
                          Patient
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
                          {order.patient}
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
                          label={order.status}
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
                          <IconButton size="small" color="primary">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EmailIcon />
                          </IconButton>
                          <Button
                            variant="contained"
                            size="small"
                            endIcon={<KeyboardArrowDownIcon />}
                            onClick={(e) => handleUpdateStatusClick(e, order)}
                            sx={{ textTransform: "none", minWidth: 140 }}
                          >
                            Update Status
                          </Button>
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
                    {order.patient}
                  </Typography>
                  <Chip
                    label={order.status}
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
                  <IconButton size="small" color="primary" sx={{ border: `1px solid ${theme.palette.primary.main}` }}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary" sx={{ border: `1px solid ${theme.palette.primary.main}` }}>
                    <EmailIcon fontSize="small" />
                  </IconButton>
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
      >
        <MenuItem onClick={() => handleStatusChange("New")}>New</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Preparing")}>Preparing</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Ready for Pickup")}>Ready for Pickup</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Completed")}>Completed</MenuItem>
      </Menu>
    </Container>
  );
};

export default Orders;

