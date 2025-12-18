import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import logoImage from "../../../assets/Logo_2.png";
import doctorImage from "../../../assets/doctor.svg";

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, "0")} : ${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
};

const VideoCallHeader = ({ callDuration, doctorData }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: { xs: 2, sm: 3, md: 4 },
        py: 2,
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)",
        borderBottom: "1px solid #E0E0E0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, #1E88E5 0%, #42A5F5 50%, #1E88E5 100%)",
        },
      }}
    >
      {/* Left Section - Logo & Live Status */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1,
            borderRadius: 2,
            background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)",
            border: "1px solid #0D47A1",
            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.3)",
          }}
        >
          <img src={logoImage} alt="Logo" style={{ height: "32px", filter: "brightness(0) invert(1)" }} />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="body2"
              sx={{
                color: "#FFFFFF",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Video Consultation
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#4CAF50",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1, transform: "scale(1)" },
                    "50%": { opacity: 0.7, transform: "scale(1.2)" },
                    "100%": { opacity: 1, transform: "scale(1)" },
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: "#FFFFFF", fontSize: "0.65rem", fontWeight: 600 }}>
                Live
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Center Section - HealthConnect Badge */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2.5,
            py: 1.25,
            backgroundColor: "#E3F2FD",
            borderRadius: 2,
            border: "1px solid #90CAF9",
            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
          }}
        >
          <CheckCircleIcon sx={{ color: "#1E88E5", fontSize: 20 }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: "#1E88E5",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              letterSpacing: 0.5,
            }}
          >
            HealthConnect
          </Typography>
        </Box>
      </Box>

      {/* Right Section - Timer & Doctor Info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flex: 1, justifyContent: "flex-end" }}>
        {/* Timer */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2.5,
            py: 1,
            backgroundColor: "#1C1C1C",
            borderRadius: 2,
            border: "1px solid #424242",
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#F44336",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.5 },
                "100%": { opacity: 1 },
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: "#FFFFFF",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontFamily: "monospace",
              letterSpacing: 1,
            }}
          >
            {formatTime(callDuration)}
          </Typography>
        </Box>

        {/* Doctor Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1,
            backgroundColor: "#F5F5F5",
            borderRadius: 2,
            border: "1px solid #E0E0E0",
          }}
        >
          <Avatar
            src={doctorData?.avatar || doctorImage}
            alt={doctorData?.name || "Doctor"}
            sx={{
              width: 40,
              height: 40,
              border: "2px solid #1E88E5",
              boxShadow: "0 2px 8px rgba(30, 136, 229, 0.2)",
            }}
          />
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "#1C1C1C",
                fontSize: "0.875rem",
                lineHeight: 1.2,
              }}
            >
              {doctorData?.name || "Doctor"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#757575",
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              {doctorData?.specialty || "General Practitioner"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoCallHeader;

