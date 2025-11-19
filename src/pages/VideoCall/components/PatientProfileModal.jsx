import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
} from "@mui/icons-material";
import userImage from "../../../assets/user.svg";

const InfoField = ({ label, value }) => (
  <Box>
    <Typography
      variant="caption"
      sx={{
        color: "#757575",
        fontSize: "0.7rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        display: "block",
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "#1C1C1C",
        fontSize: "0.875rem",
        fontWeight: 500,
      }}
    >
      {value || "N/A"}
    </Typography>
  </Box>
);

const PatientProfileModal = ({ open, onClose, patientData }) => {
  if (!patientData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
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
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1C1C1C" }}>
          Patient Profile
        </Typography>
        <IconButton
          onClick={onClose}
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
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            src={patientData.avatar || userImage}
            alt={patientData.name || "Patient"}
            sx={{
              width: 120,
              height: 120,
              mx: "auto",
              mb: 2,
              border: "4px solid #E3F2FD",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 1,
            }}
          >
            {patientData.name || "Patient"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#757575" }}>
            {patientData.gender || "N/A"}, Age {patientData.age || "N/A"}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Personal Information Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#1E88E5",
              fontWeight: 700,
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoField label="Date of Birth" value={patientData.dob || "N/A"} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoField label="Phone" value={patientData.phone || "N/A"} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoField label="Email" value={patientData.email || "N/A"} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoField label="Address" value={patientData.address || "N/A"} />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Medical Information Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#1E88E5",
              fontWeight: 700,
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Medical Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoField label="Blood Type" value={patientData.bloodType || "N/A"} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoField
                label="Allergies"
                value={
                  patientData.allergies
                    ? Array.isArray(patientData.allergies)
                      ? patientData.allergies.join(", ")
                      : patientData.allergies
                    : "None"
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <InfoField
                label="Current Medications"
                value={patientData.medications || "None"}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Emergency Contact Section */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#1E88E5",
              fontWeight: 700,
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Emergency Contact
          </Typography>
          <InfoField
            label="Contact Person"
            value={patientData.emergencyContact || "N/A"}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfileModal;

