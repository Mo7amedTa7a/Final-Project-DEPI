import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import doctorImage from "../../../assets/doctor.svg";

const DoctorInfoCard = ({ doctorData }) => {
  if (!doctorData) return null;

  return (
    <Box sx={{ px: 3, pb: 3, borderBottom: "1px solid #E8EAF6" }}>
      <Typography
        variant="caption"
        sx={{
          color: "#757575",
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: "0.7rem",
          letterSpacing: 1.2,
          mb: 2.5,
          display: "block",
        }}
      >
        Doctor
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          src={doctorData.avatar || doctorImage}
          alt={doctorData.name || "Doctor"}
          sx={{ width: 40, height: 40, border: "2px solid #E3F2FD" }}
        />
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              fontSize: "0.95rem",
              mb: 0.25,
            }}
          >
            {doctorData.name || "Doctor"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#757575",
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            {doctorData.specialty || "General Practitioner"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorInfoCard;

