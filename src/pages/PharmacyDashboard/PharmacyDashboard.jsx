import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDataManager, useCurrentUser } from "../../hooks/useDataManager";
import { useOrders } from "../../hooks/useData";
import FirestoreService from "../../services/FirestoreService";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  CardMedia,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  InputAdornment,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const PharmacyDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [pharmacyProfile, setPharmacyProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successToast, setSuccessToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "In Stock",
    image: null,
  });

  const { currentUser, loading } = useCurrentUser();

  // Check if user is logged in and load pharmacy data
  useEffect(() => {
    // Wait for loading to complete before checking
    if (!loading) {
      if (!currentUser || !currentUser.email) {
        navigate("/login", { replace: true });
        return;
      }
      if (currentUser.pharmacyProfile) {
        setPharmacyProfile(currentUser.pharmacyProfile);
        setProducts(currentUser.pharmacyProfile.products || []);
      }
    }
  }, [currentUser, loading, navigate]);

  // Load latest pharmacy data from Firebase
  useEffect(() => {
    const loadPharmacyFromFirebase = async () => {
      if (!currentUser || !currentUser.email || loading) return;
      
      try {
        const user = await FirestoreService.getUserByEmail(currentUser.email);
        if (user && user.pharmacyProfile) {
          const firebaseProducts = user.pharmacyProfile.products || [];
          
          // Merge Firebase products with localStorage products (prioritize Firebase)
          const localProducts = currentUser.pharmacyProfile?.products || [];
          const mergedProducts = [...firebaseProducts];
          
          // Add local products that don't exist in Firebase (by ID)
          const firebaseIds = new Set(firebaseProducts.map(p => p.id));
          localProducts.forEach(localProduct => {
            if (!firebaseIds.has(localProduct.id)) {
              mergedProducts.push(localProduct);
            }
          });
          
          if (mergedProducts.length > 0 || firebaseProducts.length !== localProducts.length) {
            setProducts(mergedProducts);
            setPharmacyProfile(user.pharmacyProfile);
            
            // Update localStorage with latest data
            const updatedUser = {
              ...currentUser,
              pharmacyProfile: {
                ...currentUser.pharmacyProfile,
                products: mergedProducts,
              },
            };
            localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        console.error("Error loading pharmacy from Firebase:", error);
      }
    };
    
    loadPharmacyFromFirebase();
  }, [currentUser?.email, loading]);

  // Get orders from Firebase and localStorage
  const { orders: firebaseOrders, isLoading: ordersLoading } = useOrders({});
  const { data: localOrders } = useDataManager("Orders", []);
  const { data: transactions } = useDataManager("WalletTransactions", []);
  
  // Combine Firebase and localStorage orders, removing duplicates
  const orders = useMemo(() => {
    const allOrders = [...firebaseOrders];
    const firebaseIds = new Set(firebaseOrders.map(o => o.id));
    
    // Add local orders that don't exist in Firebase
    localOrders.forEach(localOrder => {
      if (!firebaseIds.has(localOrder.id)) {
        allOrders.push(localOrder);
      }
    });
    
    return allOrders;
  }, [firebaseOrders, localOrders]);

  // Calculate statistics dynamically
  const calculateStats = useMemo(() => {
    // Calculate items low on stock
    const lowStockItems = products.filter((p) => p.stock === "Low Stock").length;
    
    // Get pharmacy ID (try multiple formats - pharmacy.id is usually the email)
    const pharmacyId = currentUser?.email; // Primary identifier is email
    const pharmacyName = pharmacyProfile?.pharmacyName || pharmacyProfile?.name;
    
    // Filter orders for this pharmacy
    const pharmacyOrders = orders.filter((order) => {
      // Check if order has pharmacyId directly (should be email)
      if (order.pharmacyId) {
        const orderPharmacyId = String(order.pharmacyId).toLowerCase();
        const currentPharmacyId = String(pharmacyId).toLowerCase();
        const orderPharmacyName = String(order.pharmacyName || "").toLowerCase();
        const currentPharmacyName = String(pharmacyName || "").toLowerCase();
        
        return orderPharmacyId === currentPharmacyId ||
               orderPharmacyName === currentPharmacyName ||
               orderPharmacyId === currentPharmacyName ||
               orderPharmacyName === currentPharmacyId;
      }
      // Check if any item in the order belongs to this pharmacy
      if (order.items && Array.isArray(order.items)) {
        return order.items.some(item => {
          const itemPharmacyId = String(item.pharmacyId || "").toLowerCase();
          const itemPharmacyName = String(item.pharmacyName || "").toLowerCase();
          const currentPharmacyId = String(pharmacyId).toLowerCase();
          const currentPharmacyName = String(pharmacyName || "").toLowerCase();
          
          return itemPharmacyId === currentPharmacyId ||
                 itemPharmacyName === currentPharmacyName ||
                 itemPharmacyId === currentPharmacyName ||
                 itemPharmacyName === currentPharmacyId;
        });
      }
      return false;
    });
    
    // Calculate new orders (status: "pending")
    const newOrders = pharmacyOrders.filter(
      (order) => {
        const status = String(order.status || "").toLowerCase();
        return status === "pending" || status === "معلق";
      }
    ).length;
    
    // Calculate pending fulfillment (status: "shipped" - orders that are being processed)
    const pendingFulfillment = pharmacyOrders.filter(
      (order) => {
        const status = String(order.status || "").toLowerCase();
        return status === "shipped" || status === "تم الشحن";
      }
    ).length;
    
    // Calculate total revenue from orders (today's completed/delivered orders)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    
    // Get today's orders that are completed or delivered
    const todayOrders = pharmacyOrders.filter((order) => {
      const orderDate = order.date || order.createdAt || order.dateCreated;
      if (!orderDate) return false;
      
      let orderDateStr = "";
      try {
        if (orderDate.toDate) {
          orderDateStr = orderDate.toDate().toISOString().split("T")[0];
        } else if (typeof orderDate === "string") {
          orderDateStr = orderDate.split("T")[0];
        } else {
          orderDateStr = new Date(orderDate).toISOString().split("T")[0];
        }
      } catch (e) {
        return false;
      }
      
      const status = String(order.status || "").toLowerCase();
      const isCompleted = status === "completed" || status === "delivered" || status === "مكتمل" || status === "تم التوصيل";
      
      return orderDateStr === todayStr && isCompleted;
    });
    
    // Calculate total revenue from today's completed orders
    const totalRevenue = todayOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.total) || parseFloat(order.totalPrice) || 0);
    }, 0);
    
    // Also check transactions as fallback
    const todayTransactions = transactions.filter(
      (t) => {
        const tPharmacyId = String(t.pharmacyId || "").toLowerCase();
        const currentPharmacyId = String(pharmacyId || "").toLowerCase();
        const tDate = t.date || t.createdAt || t.dateCreated;
        
        if (!tDate) return false;
        
        let tDateStr = "";
        try {
          if (tDate.toDate) {
            tDateStr = tDate.toDate().toISOString().split("T")[0];
          } else if (typeof tDate === "string") {
            tDateStr = tDate.split("T")[0];
          } else {
            tDateStr = new Date(tDate).toISOString().split("T")[0];
          }
        } catch (e) {
          return false;
        }
        
        return tPharmacyId === currentPharmacyId && 
               t.type === "income" && 
               tDateStr === todayStr;
      }
    );
    
    const revenueFromTransactions = todayTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const finalRevenue = totalRevenue > 0 ? totalRevenue : revenueFromTransactions;
    
    // Calculate percentage changes (compare with previous period)
    // For now, using simple calculations based on actual values
    const newOrdersChange = newOrders > 0 ? Math.min(newOrders * 10, 100) : 0;
    const pendingChange = pendingFulfillment > 0 ? Math.min(pendingFulfillment * 5, 100) : 0;
    const lowStockChange = lowStockItems > 0 ? -Math.min(lowStockItems * 2, 50) : 0;
    const revenueChange = finalRevenue > 0 ? Math.min(Math.round((finalRevenue / 100) * 10), 100) : 0;
    
    return {
      newOrders,
      pendingFulfillment,
      lowStockItems,
      totalRevenue: finalRevenue,
      newOrdersChange,
      pendingChange,
      lowStockChange,
      revenueChange,
    };
  }, [products, orders, transactions, pharmacyProfile, currentUser]);

  // Function to compress image
  const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
      };
    });
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.8);
        setNewProduct((prev) => ({ ...prev, image: compressed }));
      } catch (error) {
        console.error("Error compressing image:", error);
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewProduct((prev) => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setNewProduct({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock,
        image: product.image,
      });
    } else {
      setEditingProduct(null);
      setNewProduct({
        name: "",
        price: "",
        stock: "In Stock",
        image: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      price: "",
      stock: "In Stock",
      image: null,
    });
    setErrorMessage("");
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      setErrorMessage("Please fill in all product fields");
      setErrorToast(true);
      return;
    }

    if (!currentUser || !currentUser.email) {
      setErrorMessage("Please login first");
      setErrorToast(true);
      navigate("/login");
      return;
    }

    const users = JSON.parse(localStorage.getItem("Users") || "[]");

    let updatedProducts;
    if (editingProduct) {
      // Update existing product
      updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: newProduct.name,
              price: parseFloat(newProduct.price),
              stock: newProduct.stock,
              stockColor: newProduct.stock === "In Stock" ? "success" : newProduct.stock === "Low Stock" ? "warning" : "error",
              image: newProduct.image,
            }
          : p
      );
    } else {
      // Add new product
      const product = {
        id: Date.now(),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: newProduct.stock,
        stockColor: newProduct.stock === "In Stock" ? "success" : newProduct.stock === "Low Stock" ? "warning" : "error",
        image: newProduct.image,
      };
      updatedProducts = [...products, product];
    }

    setProducts(updatedProducts);

    // Update pharmacy profile
    const updatedPharmacyProfile = {
      ...currentUser.pharmacyProfile,
      products: updatedProducts,
    };

    const updatedUser = {
      ...currentUser,
      pharmacyProfile: updatedPharmacyProfile,
    };

    try {
      // Save to localStorage first
      localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));

      // Update in users array
      const updatedUsers = users.map((user) =>
        user.email === updatedUser.email ? updatedUser : user
      );
      localStorage.setItem("Users", JSON.stringify(updatedUsers));

      // Save to Firebase
      try {
        await FirestoreService.updateUser(currentUser.email, {
          pharmacyProfile: updatedPharmacyProfile,
        });
      } catch (firebaseError) {
        console.error("❌ Error saving product to Firebase:", firebaseError);
        // Don't fail the whole operation if Firebase fails - localStorage is already saved
      }

      setSuccessToast(true);
      handleCloseDialog();
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        setErrorMessage("Storage limit exceeded. Please reduce the size of the image.");
        setErrorToast(true);
      } else {
        setErrorMessage("An error occurred while saving. Please try again.");
        setErrorToast(true);
      }
      console.error("Error saving product:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!currentUser || !currentUser.email) {
      navigate("/login");
      return;
    }

    const users = JSON.parse(localStorage.getItem("Users") || "[]");

    const updatedProducts = products.filter((p) => p.id !== productId);
    setProducts(updatedProducts);

    // Update pharmacy profile
    const updatedPharmacyProfile = {
      ...currentUser.pharmacyProfile,
      products: updatedProducts,
    };

    const updatedUser = {
      ...currentUser,
      pharmacyProfile: updatedPharmacyProfile,
    };

    try {
      // Save to localStorage first
      localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));

      // Update in users array
      const updatedUsers = users.map((user) =>
        user.email === updatedUser.email ? updatedUser : user
      );
      localStorage.setItem("Users", JSON.stringify(updatedUsers));

      // Save to Firebase
      try {
        await FirestoreService.updateUser(currentUser.email, {
          pharmacyProfile: updatedPharmacyProfile,
        });
      } catch (firebaseError) {
        console.error("❌ Error deleting product from Firebase:", firebaseError);
        // Don't fail the whole operation if Firebase fails - localStorage is already saved
      }

      setSuccessToast(true);
    } catch (error) {
      setErrorMessage("An error occurred while deleting. Please try again.");
      setErrorToast(true);
      console.error("Error deleting product:", error);
    }
  };

  if (!pharmacyProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6">Please set up your pharmacy profile first.</Typography>
      </Container>
    );
  }

  const stats = calculateStats;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Pharmacy Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your products and inventory
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* New Orders Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              p: 3,
              height: "100%",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              New Orders
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              {stats.newOrders}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ArrowUpwardIcon
                sx={{
                  fontSize: 16,
                  color: theme.palette.success.main,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.success.main,
                  fontWeight: 600,
                }}
              >
                +{stats.newOrdersChange}%
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Pending Fulfillment Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              p: 3,
              height: "100%",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Pending Fulfillment
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              {stats.pendingFulfillment}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ArrowUpwardIcon
                sx={{
                  fontSize: 16,
                  color: theme.palette.success.main,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.success.main,
                  fontWeight: 600,
                }}
              >
                +{stats.pendingChange}%
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Items Low on Stock Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              p: 3,
              height: "100%",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Items Low on Stock
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              {stats.lowStockItems}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ArrowDownwardIcon
                sx={{
                  fontSize: 16,
                  color: theme.palette.error.main,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.error.main,
                  fontWeight: 600,
                }}
              >
                {stats.lowStockChange}%
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Total Revenue Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              p: 3,
              height: "100%",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Total Revenue (Today)
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              ${stats.totalRevenue.toLocaleString()}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ArrowUpwardIcon
                sx={{
                  fontSize: 16,
                  color: theme.palette.success.main,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.success.main,
                  fontWeight: 600,
                }}
              >
                +{stats.revenueChange}%
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Products Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Products ({products.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Product
            </Button>
          </Box>

          {products.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No products added yet.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Your First Product
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image}
                      alt={product.name}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="h5" color="primary.main" sx={{ mb: 2 }}>
                        ${product.price}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Chip
                          label={product.stock}
                          color={product.stockColor}
                          size="small"
                        />
                        <Box>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth disableScrollLock>
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Paracetamol 500mg"
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="e.g., 8.99"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={newProduct.stock}
                label="Stock Status"
                onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: e.target.value }))}
                MenuProps={{ disableScrollLock: true }}
              >
                <MenuItem value="In Stock">In Stock</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {newProduct.image ? (
                <Box
                  component="img"
                  src={newProduct.image}
                  alt="Product"
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 2,
                    mb: 2,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    border: "2px dashed",
                    borderColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    mb: 2,
                    backgroundColor: "grey.100",
                  }}
                >
                  <CameraAltIcon sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
              )}
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="product-image-upload-dialog"
                type="file"
                onChange={handleProductImageUpload}
              />
              <label htmlFor="product-image-upload-dialog">
                <Button component="span" variant="outlined" size="small" sx={{ textTransform: "none" }}>
                  Upload Product Image
                </Button>
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {editingProduct ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Toast */}
      <Snackbar
        open={successToast}
        autoHideDuration={2000}
        onClose={() => setSuccessToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessToast(false)} severity="success" sx={{ width: "100%" }}>
          {editingProduct ? "Product updated successfully!" : "Product added successfully!"}
        </Alert>
      </Snackbar>

      {/* Error Toast */}
      <Snackbar
        open={errorToast}
        autoHideDuration={3000}
        onClose={() => setErrorToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setErrorToast(false)} severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PharmacyDashboard;

