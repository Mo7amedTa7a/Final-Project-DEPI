import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Medication as MedicationIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import PrescriptionConfirmation from "./PrescriptionConfirmation";
import FirestoreService from "../../../services/FirestoreService";

const PrescriptionModal = ({ open, onClose, patientData }) => {
  const [formData, setFormData] = useState({
    patientName: patientData?.name || "",
    medication: "",
    dosage: "",
    dosageUnit: "mg",
    frequency: "Once a day",
    duration: "",
    durationUnit: "Day(s)",
    specialInstructions: "",
    pharmacy: "",
  });

  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const dosageUnits = ["mg", "g", "ml", "tablet", "capsule"];
  const frequencyOptions = [
    "Once a day",
    "Twice a day",
    "Three times a day",
    "Four times a day",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
  ];
  const durationUnits = ["Day(s)", "Week(s)", "Month(s)"];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!formData.medication.trim()) {
      newErrors.medication = "Medication is required";
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = "Dosage is required";
    }
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save prescription
    const prescriptionData = {
      ...formData,
      patientDOB: patientData?.dob || "N/A",
      patientId: `P-${Date.now()}`,
    };
    
    try {
      await savePrescription(prescriptionData);
      // Show confirmation screen (keep prescription modal open in background)
      setShowConfirmation(true);
    } catch (error) {
      // Error is already handled in savePrescription, but we can add user feedback here if needed
      setErrors({ general: "حدث خطأ أثناء حفظ الروشته. تم الحفظ في التخزين المحلي فقط." });
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    // Reset form
    setFormData({
      patientName: patientData?.name || "",
      medication: "",
      dosage: "",
      dosageUnit: "mg",
      frequency: "Once a day",
      duration: "",
      durationUnit: "Day(s)",
      specialInstructions: "",
      pharmacy: "",
    });
    onClose();
  };

  const savePrescription = async (prescriptionData) => {
    // Get patient ID - prioritize email as it's the unique identifier
    const patientId = patientData?.email || 
                     patientData?.patientId || 
                     patientData?.name || 
                     "Unknown";
    
    // Get patient name
    const patientName = patientData?.name || 
                       patientData?.patientName || 
                       "Unknown Patient";
    
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    
    const prescription = {
      ...prescriptionData,
      patientId: patientId.trim().toLowerCase(), // Normalize patientId (lowercase, trimmed)
      patientName: patientName,
      doctorName: currentUser?.doctorProfile?.fullName || "Dr. Unknown",
      doctorId: currentUser?.email || currentUser?.doctorProfile?.email,
      status: "active",
    };
    
    try {
      // Save to Firebase
      const savedPrescription = await FirestoreService.addPrescription(prescription);
      
      // Also save to localStorage as backup
      const allPrescriptions = JSON.parse(localStorage.getItem("Prescriptions") || "[]");
      const prescriptionWithId = {
        id: savedPrescription.id || Date.now(),
        ...prescription,
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      allPrescriptions.push(prescriptionWithId);
      localStorage.setItem("Prescriptions", JSON.stringify(allPrescriptions));
      
      // Create notification for patient
      const patientNotification = {
        type: "prescription",
        title: "New Prescription Received",
        message: `${currentUser?.doctorProfile?.fullName || "Dr. Unknown"} has issued a new prescription for ${prescription.medication}`,
        patientId: patientId.trim().toLowerCase(),
        prescriptionId: prescriptionWithId.id,
        read: false,
      };
      
      // Save notification to Firebase
      try {
        await FirestoreService.addNotification(patientNotification);
      } catch (notifError) {
        console.error("Error sending notification to patient:", notifError);
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
      } catch (notifError) {
        console.error("Error saving notification to localStorage:", notifError);
      }
      
      // Dispatch custom event to notify other tabs/components
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("prescriptionAdded", { detail: prescriptionWithId }));
    } catch (error) {
      // If Firebase fails, still save to localStorage
      const allPrescriptions = JSON.parse(localStorage.getItem("Prescriptions") || "[]");
      const prescriptionWithId = {
        id: Date.now(),
        ...prescription,
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      allPrescriptions.push(prescriptionWithId);
      localStorage.setItem("Prescriptions", JSON.stringify(allPrescriptions));
      
      // Create notification for patient (even if Firebase failed)
      const patientNotification = {
        type: "prescription",
        title: "New Prescription Received",
        message: `${currentUser?.doctorProfile?.fullName || "Dr. Unknown"} has issued a new prescription for ${prescription.medication}`,
        patientId: patientId.trim().toLowerCase(),
        prescriptionId: prescriptionWithId.id,
        read: false,
      };
      
      // Save notification to localStorage
      try {
        const notifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
        notifications.push({ 
          ...patientNotification, 
          id: Date.now() + Math.random(), 
          date: new Date().toISOString() 
        });
        localStorage.setItem("Notifications", JSON.stringify(notifications));
        window.dispatchEvent(new Event("storage"));
      } catch (notifError) {
        console.error("Error saving notification to localStorage:", notifError);
      }
      
      // Dispatch custom event
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("prescriptionAdded", { detail: prescriptionWithId }));
    }
  };

  const handleReturnToDashboard = () => {
    setShowConfirmation(false);
    // Reset form
    setFormData({
      patientName: patientData?.name || "",
      medication: "",
      dosage: "",
      dosageUnit: "mg",
      frequency: "Once a day",
      duration: "",
      durationUnit: "Day(s)",
      specialInstructions: "",
      pharmacy: "",
    });
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          fontWeight: 700,
          color: "#1C1C1C",
        }}
      >
        Prescribe Medication
        <IconButton
          onClick={handleClose}
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

      <DialogContent sx={{ pt: 3 }}>
        {/* Select Patient Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Select Patient
          </Typography>
          <TextField
            fullWidth
            label="Patient Name"
            value={formData.patientName}
            onChange={(e) => handleChange("patientName", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#757575" }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {patientData && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#E3F2FD",
                borderRadius: 2,
                border: "1px solid #90CAF9",
              }}
            >
              <Typography variant="body2" sx={{ color: "#1C1C1C", mb: 0.5 }}>
                <strong>Patient:</strong> {patientData.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#1C1C1C", mb: 0.5 }}>
                <strong>DOB:</strong> {patientData.dob || "N/A"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                <Typography variant="body2" component="span" sx={{ color: "#1C1C1C" }}>
                  <strong>Allergies:</strong>{" "}
                </Typography>
                {patientData.allergies && patientData.allergies.length > 0 ? (
                  <Chip
                    label={Array.isArray(patientData.allergies) ? patientData.allergies.join(", ") : patientData.allergies}
                    size="small"
                    sx={{
                      backgroundColor: "#FFEBEE",
                      color: "#C62828",
                      fontWeight: 600,
                      border: "1px solid #EF5350",
                      height: 24,
                    }}
                  />
                ) : (
                  <Typography variant="body2" component="span" sx={{ color: "#1C1C1C" }}>
                    None
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Medication & Dosage Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Medication & Dosage
          </Typography>

          <TextField
            fullWidth
            label="Medication"
            placeholder="Search for medication (e.g., Amoxicillin 500mg)"
            value={formData.medication}
            onChange={(e) => handleChange("medication", e.target.value)}
            error={!!errors.medication}
            helperText={errors.medication}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MedicationIcon sx={{ color: "#757575" }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#757575",
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                Dosage
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  placeholder="e.g., 500"
                  value={formData.dosage}
                  onChange={(e) => handleChange("dosage", e.target.value)}
                  error={!!errors.dosage}
                  helperText={errors.dosage}
                  sx={{ flex: 1 }}
                />
                <FormControl sx={{ minWidth: 100 }}>
                  <Select
                    value={formData.dosageUnit}
                    onChange={(e) => handleChange("dosageUnit", e.target.value)}
                    MenuProps={{ disableScrollLock: true }}
                  >
                    {dosageUnits.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#757575",
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                Frequency
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={formData.frequency}
                  onChange={(e) => handleChange("frequency", e.target.value)}
                  MenuProps={{ disableScrollLock: true }}
                >
                  {frequencyOptions.map((freq) => (
                    <MenuItem key={freq} value={freq}>
                      {freq}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "#757575",
                mb: 1,
                fontWeight: 500,
              }}
            >
              Duration
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                placeholder="e.g., 10"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                error={!!errors.duration}
                helperText={errors.duration}
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value={formData.durationUnit}
                  onChange={(e) => handleChange("durationUnit", e.target.value)}
                  MenuProps={{ disableScrollLock: true }}
                >
                  {durationUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* Additional Information Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Additional Information
          </Typography>
          <TextField
            fullWidth
            label="Special Instructions (optional)"
            placeholder="e.g., Take with food."
            value={formData.specialInstructions}
            onChange={(e) => handleChange("specialInstructions", e.target.value)}
            multiline
            rows={3}
          />
        </Box>

        {/* Pharmacy Section */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Pharmacy
          </Typography>
          <TextField
            fullWidth
            placeholder="Search for patient's preferred pharmacy..."
            value={formData.pharmacy}
            onChange={(e) => handleChange("pharmacy", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalPharmacyIcon sx={{ color: "#757575" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: "1px solid #E0E0E0",
          gap: 2,
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
            color: "#757575",
            fontWeight: 600,
            px: 3,
            "&:hover": {
              backgroundColor: "#F5F5F5",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          endIcon={<ArrowForwardIcon />}
          sx={{
            backgroundColor: "#1E88E5",
            color: "white",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": {
              backgroundColor: "#1565C0",
            },
          }}
        >
          Review and Issue Prescription
        </Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <PrescriptionConfirmation
        open={showConfirmation}
        onClose={handleCloseConfirmation}
        onReturnToDashboard={handleReturnToDashboard}
        prescriptionData={{
          ...formData,
          patientDOB: patientData?.dob || "N/A",
          patientId: `P-${Date.now()}`,
        }}
      />
    </Dialog>
  );
};

export default PrescriptionModal;

