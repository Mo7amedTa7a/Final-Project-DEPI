import React from "react";
import { Box, Typography, TextField } from "@mui/material";

const NotesPanel = ({ privateNotes, onNotesChange }) => {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
      <Typography
        variant="body2"
        sx={{
          color: "#757575",
          mb: 2,
          fontSize: "0.875rem",
          fontWeight: 500,
          lineHeight: 1.6,
        }}
      >
        Add your private notes about this consultation. These notes are only visible to you.
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={20}
        placeholder="Enter your notes here..."
        value={privateNotes}
        onChange={(e) => onNotesChange(e.target.value)}
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "& fieldset": { borderColor: "#E0E0E0" },
            "&:hover fieldset": { borderColor: "#1E88E5" },
            "&.Mui-focused fieldset": { borderColor: "#1E88E5" },
          },
        }}
      />
    </Box>
  );
};

export default NotesPanel;

