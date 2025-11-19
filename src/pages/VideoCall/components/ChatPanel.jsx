import React, { useRef, useEffect } from "react";
import { Box, Typography, Avatar, Paper, IconButton, TextField } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

const ChatPanel = ({ chatMessages, message, onMessageChange, onSendMessage }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: "#9E9E9E",
            fontSize: "0.7rem",
            mb: 2.5,
            display: "block",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          Today, {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </Typography>

        {chatMessages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              gap: 1.5,
              mb: 2.5,
              flexDirection: msg.sender === "doctor" ? "row-reverse" : "row",
            }}
          >
            <Avatar src={msg.avatar} alt={msg.name} sx={{ width: 36, height: 36, border: "2px solid #E3F2FD" }} />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: msg.sender === "doctor" ? "flex-end" : "flex-start",
                maxWidth: "75%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.75,
                  flexDirection: msg.sender === "doctor" ? "row-reverse" : "row",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1C1C1C", fontSize: "0.75rem" }}>
                  {msg.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#9E9E9E", fontSize: "0.7rem" }}>
                  {msg.time}
                </Typography>
              </Box>
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  background:
                    msg.sender === "doctor"
                      ? "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)"
                      : "#F5F5F5",
                  color: msg.sender === "doctor" ? "white" : "#1C1C1C",
                  borderRadius: 3,
                  border: msg.sender === "doctor" ? "none" : "1px solid #E0E0E0",
                }}
              >
                <Typography variant="body2" sx={{ fontSize: "0.875rem", lineHeight: 1.6, fontWeight: 400 }}>
                  {msg.message}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 2.5,
          borderTop: "1px solid #E8EAF6",
          backgroundColor: "#FAFBFC",
          display: "flex",
          gap: 1.5,
        }}
      >
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "white",
              "& fieldset": { borderColor: "#E0E0E0" },
              "&:hover fieldset": { borderColor: "#1E88E5" },
              "&.Mui-focused fieldset": { borderColor: "#1E88E5" },
            },
          }}
        />
        <IconButton
          onClick={onSendMessage}
          disabled={!message.trim()}
          sx={{
            backgroundColor: "#1E88E5",
            color: "white",
            width: 44,
            height: 44,
            "&:hover": {
              backgroundColor: "#005CB2",
              transform: "scale(1.1)",
            },
            "&:disabled": {
              backgroundColor: "#E0E0E0",
              color: "#9E9E9E",
            },
            transition: "all 0.2s ease",
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatPanel;

