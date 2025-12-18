import React, { useState } from "react";
import { Box, Button, Snackbar, Alert, Card, CardContent, Avatar, Typography, Chip } from "@mui/material";
import {
  LocalPharmacy as LocalPharmacyIcon,
  Person as PersonIcon,
  NoteAdd as NoteAddIcon,
} from "@mui/icons-material";
import NoteModal from "./NoteModal";
import PatientProfileModal from "./PatientProfileModal";

const RightPanel = ({ patientData, onPrescribeMedication }) => {
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [patientProfileModalOpen, setPatientProfileModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  if (!patientData) {
    return (
      <Box
        sx={{
          width: { xs: "100%", md: 360 },
          backgroundColor: "white",
          borderLeft: "1px solid #E8EAF6",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.02)",
        }}
      >
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #E0E0E0",
            p: 4,
            textAlign: "center",
            m: 3,
          }}
        >
          <Typography variant="body1" sx={{ color: "#757575" }}>
            No patient data available
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 360 },
        backgroundColor: "white",
        borderLeft: "1px solid #E8EAF6",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.02)",
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Patient Profile */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #E0E0E0",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 3, textAlign: "center" }}>
            <Avatar
              src={patientData.avatar}
              alt={patientData.name}
              sx={{
                width: 100,
                height: 100,
                mx: "auto",
                mb: 2,
                border: "4px solid #E3F2FD",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1C1C1C",
                mb: 1,
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              {patientData.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#757575", mb: 2 }}>
              Age: {patientData.age} • {patientData.gender} • Blood Type: {patientData.bloodType || "N/A"}
            </Typography>
            {patientData.allergies && 
             (Array.isArray(patientData.allergies) ? patientData.allergies.length > 0 : patientData.allergies !== "None") && (
              <Chip
                icon={<Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#F44336" }} />}
                label={`Allergy: ${Array.isArray(patientData.allergies) ? patientData.allergies.join(", ") : patientData.allergies}`}
                sx={{
                  backgroundColor: "#FFEBEE",
                  color: "#C62828",
                  fontWeight: 600,
                  border: "1px solid #EF5350",
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<LocalPharmacyIcon />}
            onClick={() => setPatientProfileModalOpen(true)}
            sx={{
              backgroundColor: "#1E88E5",
              color: "white",
              textTransform: "none",
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#1565C0",
              },
            }}
          >
            Prescribe Medication
          </Button>
          <Button
            variant="outlined"
            startIcon={<NoteAddIcon />}
            onClick={() => setNoteModalOpen(true)}
            sx={{
              borderColor: "#E0E0E0",
              color: "#757575",
              textTransform: "none",
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                borderColor: "#1E88E5",
                color: "#1E88E5",
                backgroundColor: "#E3F2FD",
              },
            }}
          >
            Add Note
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => setPatientProfileModalOpen(true)}
            sx={{
              borderColor: "#1E88E5",
              color: "#1E88E5",
              textTransform: "none",
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                borderColor: "#1565C0",
                color: "#1565C0",
                backgroundColor: "#E3F2FD",
              },
            }}
          >
            View Profile
          </Button>
        </Box>
      </Box>

      {/* Patient Profile Modal */}
      <PatientProfileModal
        open={patientProfileModalOpen}
        onClose={() => setPatientProfileModalOpen(false)}
        patientData={patientData}
      />

      {/* Note Modal */}
      <NoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        patientData={patientData}
        onSendNote={(noteData) => {
          // Save note to localStorage
          const notes = JSON.parse(localStorage.getItem("PatientNotes") || "[]");
          notes.push(noteData);
          localStorage.setItem("PatientNotes", JSON.stringify(notes));
          
          setSnackbarMessage(`Note sent successfully to ${noteData.patientName}`);
          setSnackbarOpen(true);
        }}
      />

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RightPanel;

