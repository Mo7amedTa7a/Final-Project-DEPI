import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    loadPharmacyData();
  }, []);

  const loadPharmacyData = () => {
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    if (currentUser.pharmacyProfile) {
      setPharmacyProfile(currentUser.pharmacyProfile);
      setProducts(currentUser.pharmacyProfile.products || []);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    // Calculate items low on stock
    const lowStockItems = products.filter((p) => p.stock === "Low Stock").length;
    
    // For now, we'll use mock data for orders and revenue
    // In a real app, these would come from an orders system
    const newOrders = 12; // Mock data
    const pendingFulfillment = 8; // Mock data
    const totalRevenue = 1250; // Mock data
    
    // Calculate percentage changes (mock data for now)
    const newOrdersChange = 5;
    const pendingChange = 2;
    const lowStockChange = -1;
    const revenueChange = 8;
    
    return {
      newOrders,
      pendingFulfillment,
      lowStockItems,
      totalRevenue,
      newOrdersChange,
      pendingChange,
      lowStockChange,
      revenueChange,
    };
  };

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

  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      setErrorMessage("Please fill in all product fields");
      setErrorToast(true);
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
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
      localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));

      // Update in users array
      const updatedUsers = users.map((user) =>
        user.email === updatedUser.email ? updatedUser : user
      );
      localStorage.setItem("Users", JSON.stringify(updatedUsers));

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

  const handleDeleteProduct = (productId) => {
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
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
      localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));

      // Update in users array
      const updatedUsers = users.map((user) =>
        user.email === updatedUser.email ? updatedUser : user
      );
      localStorage.setItem("Users", JSON.stringify(updatedUsers));

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

  const stats = calculateStats();

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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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

