import React from "react";
import { Box, Typography, Avatar, Paper, Divider, Grid } from "@mui/material";
import userImage from "../../../assets/user.svg";

const PatientInfoCard = ({ patientData }) => {
  if (!patientData) return null;

  const InfoField = ({ label, value, icon }) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          color: "#757575",
          fontSize: "0.7rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          display: "block",
          mb: 0.75,
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
          lineHeight: 1.6,
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="caption"
        sx={{
          color: "#757575",
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: "0.7rem",
          letterSpacing: 1.2,
          mb: 3,
          display: "block",
        }}
      >
        Patient Information
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          borderRadius: 3,
          border: "1px solid #90CAF9",
        }}
      >
        {/* Patient Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            src={patientData.avatar || userImage}
            alt={patientData.name || "Patient"}
            sx={{
              width: 70,
              height: 70,
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1C1C1C",
                fontSize: "1.2rem",
                mb: 0.5,
              }}
            >
              {patientData.name || "Patient"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#555555",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {patientData.gender || "N/A"}, Age {patientData.age || "N/A"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: "#90CAF9", borderWidth: 1.5 }} />

        {/* Personal Information */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#1E88E5",
              fontWeight: 700,
              fontSize: "0.85rem",
              mb: 2,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InfoField label="Date of Birth" value={patientData.dob || "N/A"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoField label="Phone" value={patientData.phone || "N/A"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoField label="Email" value={patientData.email || "N/A"} />
            </Grid>
            <Grid item xs={12}>
              <InfoField label="Address" value={patientData.address || "N/A"} />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3, borderColor: "#90CAF9", borderWidth: 1.5 }} />

        {/* Medical Information */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#1E88E5",
              fontWeight: 700,
              fontSize: "0.85rem",
              mb: 2,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Medical Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
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
                    mb: 0.75,
                  }}
                >
                  Blood Type
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#1C1C1C",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {patientData.bloodType || "N/A"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
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
                    mb: 0.75,
                  }}
                >
                  Allergies
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#1C1C1C",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {patientData.allergies || "None"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <InfoField label="Current Medications" value={patientData.medications || "None"} />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3, borderColor: "#90CAF9", borderWidth: 1.5 }} />

        {/* Emergency Contact */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#1E88E5",
              fontWeight: 700,
              fontSize: "0.85rem",
              mb: 2,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Emergency Contact
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#1C1C1C",
              fontSize: "0.875rem",
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            {patientData.emergencyContact || "N/A"}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PatientInfoCard;
