import React from "react";
import { Box, Avatar, IconButton } from "@mui/material";
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CallEnd as CallEndIcon,
} from "@mui/icons-material";
import doctorImage from "../../../assets/doctor.svg";
import userImage from "../../../assets/user.svg";

const VideoPanel = ({ patientData, doctorData, isVideoOff, isMuted, onToggleMute, onToggleVideo, onEndCall }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Main Video Feed */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
          }}
        >
          {isVideoOff ? (
            <Avatar
              src={patientData?.avatar || userImage}
              alt={patientData?.name || "Patient"}
              sx={{
                width: { xs: 150, sm: 200, md: 250 },
                height: { xs: 150, sm: 200, md: 250 },
              }}
            />
          ) : (
            <Box
              component="img"
              src={patientData?.avatar || userImage}
              alt={patientData?.name || "Patient"}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </Box>

        {/* Doctor's Video (Small inset) */}
        <Box
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            width: { xs: 140, sm: 180, md: 220 },
            height: { xs: 105, sm: 135, md: 165 },
            borderRadius: 3,
            overflow: "hidden",
            border: "3px solid white",
            backgroundColor: "#000",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            },
          }}
        >
          {isVideoOff ? (
            <Avatar
              src={doctorData?.avatar || doctorImage}
              alt={doctorData?.name || "Doctor"}
              sx={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Box
              component="img"
              src={doctorData?.avatar || doctorImage}
              alt={doctorData?.name || "Doctor"}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </Box>
      </Box>

      {/* Call Controls */}
      <Box
        sx={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          borderRadius: 4,
          px: 2,
          py: 1.5,
        }}
      >
        <IconButton
          onClick={onToggleMute}
          sx={{
            backgroundColor: isMuted ? "rgba(244, 67, 54, 0.2)" : "rgba(255, 255, 255, 0.15)",
            color: "white",
            width: 48,
            height: 48,
            "&:hover": {
              backgroundColor: isMuted ? "rgba(244, 67, 54, 0.3)" : "rgba(255, 255, 255, 0.25)",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s ease",
          }}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
        <IconButton
          onClick={onToggleVideo}
          sx={{
            backgroundColor: isVideoOff ? "rgba(244, 67, 54, 0.2)" : "rgba(255, 255, 255, 0.15)",
            color: "white",
            width: 48,
            height: 48,
            "&:hover": {
              backgroundColor: isVideoOff ? "rgba(244, 67, 54, 0.3)" : "rgba(255, 255, 255, 0.25)",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s ease",
          }}
        >
          {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
        </IconButton>
        <IconButton
          onClick={onEndCall}
          sx={{
            backgroundColor: "#F44336",
            color: "white",
            width: 56,
            height: 56,
            "&:hover": {
              backgroundColor: "#D32F2F",
              transform: "scale(1.1)",
              boxShadow: "0 4px 16px rgba(244, 67, 54, 0.4)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <CallEndIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default VideoPanel;

