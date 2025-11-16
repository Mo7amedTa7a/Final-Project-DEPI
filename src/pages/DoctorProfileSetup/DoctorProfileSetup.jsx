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
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";

export default function DoctorProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profilePicture: null,
    specialty: "",
    experience: "",
    education: "",
    phoneNumber: "",
    address: "",
    bio: "",
    consultationFee: "",
    conditionsTreated: [],
    servicesOffered: [],
    clinicImages: [],
    clinics: [],
    schedule: {
      Monday: { enabled: false, startTime: "", endTime: "" },
      Tuesday: { enabled: false, startTime: "", endTime: "" },
      Wednesday: { enabled: false, startTime: "", endTime: "" },
      Thursday: { enabled: false, startTime: "", endTime: "" },
      Friday: { enabled: false, startTime: "", endTime: "" },
      Saturday: { enabled: false, startTime: "", endTime: "" },
      Sunday: { enabled: false, startTime: "", endTime: "" },
    },
  });

  const [successToast, setSuccessToast] = useState(false);
  const [error, setError] = useState("");

  // Load existing data if available
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    if (currentUser.doctorProfile) {
      setFormData({
        profilePicture: currentUser.doctorProfile.profilePicture || null,
        specialty: currentUser.doctorProfile.specialty || "",
        experience: currentUser.doctorProfile.experience || "",
        education: currentUser.doctorProfile.education || "",
        phoneNumber: currentUser.doctorProfile.phoneNumber || "",
        address: currentUser.doctorProfile.address || "",
        bio: currentUser.doctorProfile.bio || "",
        consultationFee: currentUser.doctorProfile.consultationFee || "",
        conditionsTreated: currentUser.doctorProfile.conditionsTreated || [],
        servicesOffered: currentUser.doctorProfile.servicesOffered || [],
        clinicImages: currentUser.doctorProfile.clinicImages || [],
        clinics: currentUser.doctorProfile.clinics || [],
        schedule: currentUser.doctorProfile.schedule || {
          Monday: { enabled: false, startTime: "", endTime: "" },
          Tuesday: { enabled: false, startTime: "", endTime: "" },
          Wednesday: { enabled: false, startTime: "", endTime: "" },
          Thursday: { enabled: false, startTime: "", endTime: "" },
          Friday: { enabled: false, startTime: "", endTime: "" },
          Saturday: { enabled: false, startTime: "", endTime: "" },
          Sunday: { enabled: false, startTime: "", endTime: "" },
        },
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
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

  const handleConditionAdd = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newCondition = e.target.value.trim();
      if (!formData.conditionsTreated.includes(newCondition)) {
        setFormData((prev) => ({
          ...prev,
          conditionsTreated: [...prev.conditionsTreated, newCondition],
        }));
        e.target.value = "";
      }
    }
  };

  const handleServiceAdd = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newService = e.target.value.trim();
      if (!formData.servicesOffered.includes(newService)) {
        setFormData((prev) => ({
          ...prev,
          servicesOffered: [...prev.servicesOffered, newService],
        }));
        e.target.value = "";
      }
    }
  };

  const handleRemoveCondition = (condition) => {
    setFormData((prev) => ({
      ...prev,
      conditionsTreated: prev.conditionsTreated.filter((c) => c !== condition),
    }));
  };

  const handleRemoveService = (service) => {
    setFormData((prev) => ({
      ...prev,
      servicesOffered: prev.servicesOffered.filter((s) => s !== service),
    }));
  };

  // Function to compress image
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
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

  const handleClinicImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    const compressedImages = [];

    for (const file of files) {
      try {
        const compressed = await compressImage(file, 600, 600, 0.6);
        compressedImages.push(compressed);
      } catch (error) {
        console.error("Error compressing image:", error);
        // Fallback: try to compress with lower quality
        try {
          const compressed = await compressImage(file, 400, 400, 0.5);
          compressedImages.push(compressed);
        } catch (err) {
          console.error("Failed to compress image, skipping:", err);
        }
      }
    }

    if (compressedImages.length > 0) {
      setFormData((prev) => ({
        ...prev,
        clinicImages: [...prev.clinicImages, ...compressedImages],
      }));
    }
  };

  const handleRemoveClinicImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      clinicImages: prev.clinicImages.filter((_, i) => i !== index),
    }));
  };

  const handleAddClinic = () => {
    setFormData((prev) => ({
      ...prev,
      clinics: [
        ...prev.clinics,
        {
          id: Date.now(),
          name: "",
          address: "",
          consultationFee: prev.consultationFee || "",
        },
      ],
    }));
  };

  const handleClinicChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      clinics: prev.clinics.map((clinic) =>
        clinic.id === id ? { ...clinic, [field]: value } : clinic
      ),
    }));
  };

  const handleRemoveClinic = (id) => {
    setFormData((prev) => ({
      ...prev,
      clinics: prev.clinics.filter((clinic) => clinic.id !== id),
    }));
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // التحقق من الحقول المطلوبة
    if (
      !formData.specialty ||
      !formData.experience ||
      !formData.education ||
      !formData.phoneNumber ||
      !formData.address ||
      !formData.bio ||
      !formData.consultationFee
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      // الحصول على بيانات المستخدم الحالي
      const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
      const users = JSON.parse(localStorage.getItem("Users") || "[]");

      // إضافة بيانات الملف الشخصي للطبيب
      const updatedUser = {
        ...currentUser,
        doctorProfile: {
          profilePicture: formData.profilePicture,
          fullName: currentUser.name,
          email: currentUser.email,
          specialty: formData.specialty,
          experience: formData.experience,
          education: formData.education,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          bio: formData.bio,
          consultationFee: formData.consultationFee,
          conditionsTreated: formData.conditionsTreated,
          servicesOffered: formData.servicesOffered,
          clinicImages: formData.clinicImages,
          clinics: formData.clinics,
          schedule: formData.schedule,
        },
      };

      // تحديث المستخدم الحالي
      localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));

      // تحديث المستخدم في array المستخدمين
      const updatedUsers = users.map((user) =>
        user.email === updatedUser.email ? updatedUser : user
      );
      localStorage.setItem("Users", JSON.stringify(updatedUsers));
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        setError("Storage limit exceeded. Please reduce the number or size of images.");
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
      navigate("/");
      window.location.reload();
    }, 1500);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Set Up Your Doctor Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please fill in your professional details to complete your profile.
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
          </Box>

          {/* Professional Information */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
            Professional Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <FormControl fullWidth required>
              <InputLabel>Specialty</InputLabel>
              <Select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                label="Specialty"
              >
                <MenuItem value="Cardiologist">Cardiologist</MenuItem>
                <MenuItem value="Dermatologist">Dermatologist</MenuItem>
                <MenuItem value="Pediatrician">Pediatrician</MenuItem>
                <MenuItem value="Neurologist">Neurologist</MenuItem>
                <MenuItem value="Orthopedic Surgeon">Orthopedic Surgeon</MenuItem>
                <MenuItem value="General Practitioner">General Practitioner</MenuItem>
                <MenuItem value="Gynecologist">Gynecologist</MenuItem>
                <MenuItem value="Psychiatrist">Psychiatrist</MenuItem>
                <MenuItem value="Endocrinologist">Endocrinologist</MenuItem>
                <MenuItem value="Gastroenterologist">Gastroenterologist</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Years of Experience"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g., 15 years"
              required
              inputProps={{ min: 0, max: 50 }}
            />

            <TextField
              fullWidth
              label="Education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="e.g., MD, Harvard Medical School"
              required
            />

            <TextField
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Brief description about yourself and your practice..."
              required
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
              placeholder="(123) 456-7890"
              required
            />

            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street, City, State, ZIP"
              required
            />
          </Box>

          {/* Consultation Fee */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
            Consultation Fee
          </Typography>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Consultation Fee (USD)"
              name="consultationFee"
              type="number"
              value={formData.consultationFee}
              onChange={handleChange}
              placeholder="150"
              required
              inputProps={{ min: 0 }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Box>

          {/* Conditions Treated */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, mt: 3 }}>
            Conditions Treated (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Press Enter to add a condition
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Add condition (e.g., Chest Pain)"
              onKeyPress={handleConditionAdd}
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {formData.conditionsTreated.map((condition) => (
                <Chip
                  key={condition}
                  label={condition}
                  onDelete={() => handleRemoveCondition(condition)}
                  sx={{ backgroundColor: "#E3F2FD", color: "#1E88E5" }}
                />
              ))}
            </Box>
          </Box>

          {/* Services Offered */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, mt: 3 }}>
            Services Offered (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Press Enter to add a service
          </Typography>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Add service (e.g., ECG/EKG)"
              onKeyPress={handleServiceAdd}
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {formData.servicesOffered.map((service) => (
                <Chip
                  key={service}
                  label={service}
                  onDelete={() => handleRemoveService(service)}
                  sx={{ backgroundColor: "#F5F5F5", color: "#1C1C1C" }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Clinic Images */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Clinic Photos (Optional)
          </Typography>
          <Box sx={{ mb: 3 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="clinic-images-upload"
              type="file"
              multiple
              onChange={handleClinicImagesUpload}
            />
            <label htmlFor="clinic-images-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<CameraAltIcon />}
                sx={{ textTransform: "none", mb: 2 }}
              >
                Upload Clinic Photos
              </Button>
            </label>
            {formData.clinicImages.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {formData.clinicImages.map((image, index) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={image}
                        alt={`Clinic ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: "1px solid #E0E0E0",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveClinicImage(index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 1)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Clinics/Branches */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Clinics/Branches (Optional)
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddClinic}
              sx={{ textTransform: "none" }}
            >
              Add Clinic
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add multiple clinic locations if you have branches
          </Typography>

          {formData.clinics.map((clinic) => (
            <Card key={clinic.id} sx={{ mb: 2, border: "1px solid #E0E0E0" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Clinic {formData.clinics.indexOf(clinic) + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveClinic(clinic.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Clinic Name"
                      value={clinic.name}
                      onChange={(e) => handleClinicChange(clinic.id, "name", e.target.value)}
                      placeholder="e.g., Main Clinic"
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={clinic.address}
                      onChange={(e) => handleClinicChange(clinic.id, "address", e.target.value)}
                      multiline
                      rows={2}
                      placeholder="123 Main Street, City, State, ZIP"
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Consultation Fee (USD)"
                      type="number"
                      value={clinic.consultationFee}
                      onChange={(e) => handleClinicChange(clinic.id, "consultationFee", e.target.value)}
                      placeholder="150"
                      inputProps={{ min: 0 }}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Divider sx={{ my: 4 }} />

          {/* Schedule */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Weekly Schedule
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Set your available hours for each day of the week
          </Typography>

          {Object.keys(formData.schedule).map((day) => (
            <Card key={day} sx={{ mb: 2, border: "1px solid #E0E0E0" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.schedule[day].enabled}
                        onChange={(e) =>
                          handleScheduleChange(day, "enabled", e.target.checked)
                        }
                      />
                    }
                    label={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {day}
                      </Typography>
                    }
                  />
                </Box>
                {formData.schedule[day].enabled && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        value={formData.schedule[day].startTime}
                        onChange={(e) =>
                          handleScheduleChange(day, "startTime", e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        value={formData.schedule[day].endTime}
                        onChange={(e) =>
                          handleScheduleChange(day, "endTime", e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        required
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          ))}

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

