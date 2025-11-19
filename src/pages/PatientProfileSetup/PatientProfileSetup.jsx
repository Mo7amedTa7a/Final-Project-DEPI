import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router";
import FirestoreService from "../../services/FirestoreService";

export default function PatientProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profilePicture: null,
    gender: "",
    age: "",
    phoneNumber: "",
    address: "",
    chronicConditions: "",
  });

  const [successToast, setSuccessToast] = useState(false);
  const [error, setError] = useState("");

  // Load existing data if available
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    if (currentUser.patientProfile) {
      setFormData({
        profilePicture: currentUser.patientProfile.profilePicture || null,
        gender: currentUser.patientProfile.gender || "",
        age: currentUser.patientProfile.age || "",
        phoneNumber: currentUser.patientProfile.phoneNumber || "",
        address: currentUser.patientProfile.address || "",
        chronicConditions: currentUser.patientProfile.chronicConditions || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من الحقول المطلوبة
    if (!formData.gender || !formData.age) {
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

      // إضافة بيانات الملف الشخصي للمستخدم
      const patientProfile = {
        profilePicture: formData.profilePicture,
        fullName: currentUser.name,
        gender: formData.gender,
        age: formData.age,
        phoneNumber: formData.phoneNumber,
        email: currentUser.email,
        address: formData.address,
        chronicConditions: formData.chronicConditions,
      };

      // تحديث المستخدم في Firebase
      const updatedUser = await FirestoreService.updateUser(currentUser.email, {
        patientProfile: patientProfile,
      });

      // تحديث المستخدم الحالي في localStorage
      localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));

      setSuccessToast(true);
      setError("");

      // الانتقال للصفحة الرئيسية بعد الحفظ
      setTimeout(() => {
        navigate("/account");
      }, 1500);
    } catch (error) {
      console.error("Error saving patient profile:", error);
      setError("حدث خطأ أثناء حفظ الملف الشخصي. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Set Up Your Patient Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please fill in your details to complete your profile.
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
              Upload a Profile Picture
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This helps your doctor recognize you.
            </Typography>
          </Box>

          {/* Basic Information */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
            Basic Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age."
              required
              inputProps={{ min: 0, max: 120 }}
            />
          </Box>

          {/* Contact Details */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
            Contact Details
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="(123) 456-7880"
            />

            <TextField
              fullWidth
              label="Full Address"
              name="address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street, Anytown, USA 12345"
            />
          </Box>

          {/* Medical History */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, mt: 3 }}>
            Medical History (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This information helps your doctor provide more personalized care.
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                Chronic Conditions
              </Typography>
              <IconButton size="small" sx={{ p: 0 }}>
                <InfoIcon fontSize="small" color="action" />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              name="chronicConditions"
              multiline
              rows={3}
              value={formData.chronicConditions}
              onChange={handleChange}
              placeholder="e.g., Asthma, Diabetes, Hypertension."
            />
          </Box>

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

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", display: "block" }}>
            By saving your profile, you agree to our{" "}
            <Button variant="text" size="small" sx={{ textTransform: "none", p: 0, minWidth: "auto" }}>
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="text" size="small" sx={{ textTransform: "none", p: 0, minWidth: "auto" }}>
              Privacy Policy
            </Button>
            .
          </Typography>
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

