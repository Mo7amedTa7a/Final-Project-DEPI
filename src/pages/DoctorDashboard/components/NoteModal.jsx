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
} from "@mui/material";
import {
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material";

const NoteModal = ({ open, onClose, patientData, onSendNote }) => {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    if (!note.trim()) {
      setError("Note cannot be empty");
      return;
    }

    // Send note to patient
    if (onSendNote) {
      onSendNote({
        patientId: patientData?.id || patientData?.name,
        patientName: patientData?.name || "Patient",
        note: note.trim(),
        date: new Date().toISOString(),
        doctorName: JSON.parse(localStorage.getItem("CurrentUser") || "{}")?.doctorProfile?.fullName || "Dr. Unknown",
      });
    }

    // Reset and close
    setNote("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setNote("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
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
          Add Note for {patientData?.name || "Patient"}
        </Typography>
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
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: "#757575",
              mb: 1.5,
              fontWeight: 500,
            }}
          >
            Write a note to send to the patient:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder="Enter your note here..."
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError("");
            }}
            error={!!error}
            helperText={error}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#1E88E5",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1E88E5",
                },
              },
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
          onClick={handleSend}
          startIcon={<SendIcon />}
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
          Send Note
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteModal;

