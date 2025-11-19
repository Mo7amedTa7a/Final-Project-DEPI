import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Snackbar,
  Alert,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";
import FirestoreService from "../../services/FirestoreService";

export default function PharmacyProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profilePicture: null,
    pharmacyName: "",
    shortName: "",
    phoneNumber: "",
    email: "",
    address: "",
    location: "",
    hours: "",
    description: "",
    products: [],
  });

  const [successToast, setSuccessToast] = useState(false);
  const [error, setError] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "In Stock",
    image: null,
  });

  // Load existing data if available
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    if (currentUser.pharmacyProfile) {
      setFormData({
        profilePicture: currentUser.pharmacyProfile.profilePicture || null,
        pharmacyName: currentUser.pharmacyProfile.pharmacyName || "",
        shortName: currentUser.pharmacyProfile.shortName || "",
        phoneNumber: currentUser.pharmacyProfile.phoneNumber || "",
        email: currentUser.pharmacyProfile.email || currentUser.email || "",
        address: currentUser.pharmacyProfile.address || "",
        location: currentUser.pharmacyProfile.location || "",
        hours: currentUser.pharmacyProfile.hours || "",
        description: currentUser.pharmacyProfile.description || "",
        products: currentUser.pharmacyProfile.products || [],
      });
    } else {
      // Set default email from user data
      const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
      if (currentUser.email) {
        setFormData((prev) => ({ ...prev, email: currentUser.email }));
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
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

          // Calculate new dimensions
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

          // Convert to base64 with compression
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.8);
        setFormData((prev) => ({ ...prev, profilePicture: compressed }));
      } catch (error) {
        console.error("Error compressing image:", error);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
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

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      setError("Please fill in all product fields");
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: newProduct.stock,
      stockColor: newProduct.stock === "In Stock" ? "success" : newProduct.stock === "Low Stock" ? "warning" : "error",
      image: newProduct.image,
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, product],
    }));

    setNewProduct({
      name: "",
      price: "",
      stock: "In Stock",
      image: null,
    });
    setShowAddProduct(false);
    setError("");
  };

  const handleRemoveProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من الحقول المطلوبة
    if (
      !formData.pharmacyName ||
      !formData.shortName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.address ||
      !formData.location ||
      !formData.hours
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      // الحصول على بيانات المستخدم الحالي
      const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
      
      if (!currentUser.email) {
        setError("User not found. Please login again.");
        return;
      }

      // إضافة بيانات الملف الشخصي للصيدلية
      const pharmacyProfile = {
        profilePicture: formData.profilePicture,
        pharmacyName: formData.pharmacyName,
        shortName: formData.shortName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        location: formData.location,
        hours: formData.hours,
        description: formData.description,
        products: formData.products || [],
      };

      // تحديث المستخدم في Firebase
      const updatedUser = await FirestoreService.updateUser(currentUser.email, {
        pharmacyProfile: pharmacyProfile,
      });

      // تحديث المستخدم الحالي في localStorage
      localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        setError("Storage limit exceeded. Please reduce the size of the image.");
        return;
      }
      setError("An error occurred while saving. Please try again.");
      console.error("Error saving profile:", error);
      return;
    }

    setSuccessToast(true);
    setError("");

    // الانتقال للصفحة الرئيسية بعد الحفظ
    setTimeout(() => {
      navigate("/account");
      window.location.reload();
    }, 1500);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Set Up Your Pharmacy Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please fill in your pharmacy details to complete your profile.
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Profile Picture Upload */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
            <Box
              sx={{
                position: "relative",
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: "2px dashed",
                borderColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                overflow: "hidden",
                backgroundColor: "grey.100",
              }}
            >
              {formData.profilePicture ? (
                <Avatar
                  src={formData.profilePicture}
                  sx={{ width: "100%", height: "100%" }}
                />
              ) : (
                <CameraAltIcon sx={{ fontSize: 40, color: "primary.main" }} />
              )}
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="profile-picture-upload"
                type="file"
                onChange={handleImageUpload}
              />
            </Box>
            <label htmlFor="profile-picture-upload">
              <Button
                component="span"
                variant="outlined"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Upload Photo
              </Button>
            </label>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Upload Pharmacy Logo
            </Typography>
          </Box>

          {/* Pharmacy Information */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
            Pharmacy Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Pharmacy Name"
              name="pharmacyName"
              value={formData.pharmacyName}
              onChange={handleChange}
              placeholder="e.g., City Health Pharmacy"
              required
            />

            <TextField
              fullWidth
              label="Short Name"
              name="shortName"
              value={formData.shortName}
              onChange={handleChange}
              placeholder="e.g., CITY HEALTH"
              required
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description about your pharmacy..."
            />
          </Box>

          {/* Contact Details */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
            Contact Details
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@pharmacy.com"
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Wellness Ave, Meditown"
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Oak Brook, IL"
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Operating Hours"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                placeholder="e.g., Mon-Fri 9:00 AM - 7:00 PM"
                required
              />
            </Grid>
          </Grid>

          {/* Products Section (Optional) */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 4 }}>
            Products (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You can add products now or add them later from your dashboard.
          </Typography>

          {!showAddProduct ? (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowAddProduct(true)}
              sx={{ mb: 3 }}
            >
              Add Product
            </Button>
          ) : (
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Add New Product
              </Typography>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Paracetamol 500mg"
                  />
                </Grid>
                <Grid size={12} sm={6}>
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
                </Grid>
                <Grid size={12} sm={6}>
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
                </Grid>
                <Grid size={12}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
                    {newProduct.image ? (
                      <Box
                        component="img"
                        src={newProduct.image}
                        alt="Product"
                        sx={{
                          width: 150,
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 2,
                          mb: 1,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 150,
                          height: 150,
                          border: "2px dashed",
                          borderColor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: "grey.100",
                        }}
                      >
                        <CameraAltIcon sx={{ fontSize: 40, color: "primary.main" }} />
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="product-image-upload"
                      type="file"
                      onChange={handleProductImageUpload}
                    />
                    <label htmlFor="product-image-upload">
                      <Button component="span" variant="outlined" size="small" sx={{ textTransform: "none" }}>
                        Upload Product Image
                      </Button>
                    </label>
                  </Box>
                </Grid>
                <Grid size={12}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleAddProduct}
                      startIcon={<AddIcon />}
                    >
                      Add Product
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowAddProduct(false);
                        setNewProduct({
                          name: "",
                          price: "",
                          stock: "In Stock",
                          image: null,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Display Added Products */}
          {formData.products.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Added Products ({formData.products.length})
              </Typography>
              <Grid container spacing={2}>
                {formData.products.map((product) => (
                  <Grid size={12} sm={6} md={4} key={product.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.image}
                        alt={product.name}
                        sx={{ objectFit: "cover" }}
                      />
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="h6" color="primary.main" sx={{ my: 1 }}>
                          ${product.price}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Chip
                            label={product.stock}
                            color={product.stockColor}
                            size="small"
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveProduct(product.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2, mb: 2, py: 1.5 }}
          >
            Save Profile
          </Button>
        </form>

        <Snackbar
          open={successToast}
          autoHideDuration={2000}
          onClose={() => setSuccessToast(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setSuccessToast(false)} severity="success" sx={{ width: "100%" }}>
            تم حفظ الملف الشخصي بنجاح!
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

