import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
  Avatar,
  Divider,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  Send as SendIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import userImage from "../../assets/user.svg";
import doctorImage from "../../assets/doctor.svg";

const Messages = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();

  // Load current user and conversations
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    if (!user || !user.email) {
      // User not logged in, redirect to login
      navigate("/login", { replace: true });
      return;
    }
    setCurrentUser(user);
    loadConversations(user);
  }, [navigate]);

  // Auto scroll to bottom when new message is added
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = (user) => {
    const allMessages = JSON.parse(localStorage.getItem("Messages") || "[]");
    const userRole = user.role;

    if (userRole === "Patient") {
      // Patient can see conversations with doctors they booked with or pharmacies they ordered from
      const patientConversations = {};
      
      allMessages.forEach((msg) => {
        if (msg.patientId === user.email || msg.patientId === user.patientProfile?.email) {
          const otherId = msg.doctorId || msg.pharmacyId;
          const otherName = msg.doctorName || msg.pharmacyName;
          const otherAvatar = msg.doctorAvatar || msg.pharmacyAvatar;
          const otherType = msg.doctorId ? "Doctor" : "Pharmacy";

          if (!patientConversations[otherId]) {
            patientConversations[otherId] = {
              id: otherId,
              name: otherName,
              avatar: otherAvatar || (otherType === "Doctor" ? doctorImage : userImage),
              type: otherType,
              messages: [],
              lastMessage: null,
              lastMessageTime: null,
            };
          }
          patientConversations[otherId].messages.push(msg);
        }
      });

      // Sort by last message time
      const sortedConversations = Object.values(patientConversations)
        .map((conv) => {
          const sortedMessages = conv.messages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          return {
            ...conv,
            messages: sortedMessages,
            lastMessage: sortedMessages[sortedMessages.length - 1],
            lastMessageTime: sortedMessages[sortedMessages.length - 1]?.timestamp,
          };
        })
        .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));

      setConversations(sortedConversations);
      if (sortedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(sortedConversations[0]);
      }
    } else if (userRole === "Doctor") {
      // Doctor can see conversations with all patients
      const doctorConversations = {};
      
      allMessages.forEach((msg) => {
        if (msg.doctorId === user.email || msg.doctorId === user.doctorProfile?.email) {
          const patientId = msg.patientId;
          const patientName = msg.patientName;
          const patientAvatar = msg.patientAvatar;

          if (!doctorConversations[patientId]) {
            doctorConversations[patientId] = {
              id: patientId,
              name: patientName,
              avatar: patientAvatar || userImage,
              type: "Patient",
              messages: [],
              lastMessage: null,
              lastMessageTime: null,
            };
          }
          doctorConversations[patientId].messages.push(msg);
        }
      });

      const sortedConversations = Object.values(doctorConversations)
        .map((conv) => {
          const sortedMessages = conv.messages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          return {
            ...conv,
            messages: sortedMessages,
            lastMessage: sortedMessages[sortedMessages.length - 1],
            lastMessageTime: sortedMessages[sortedMessages.length - 1]?.timestamp,
          };
        })
        .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));

      setConversations(sortedConversations);
      if (sortedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(sortedConversations[0]);
      }
    } else if (userRole === "Pharmacy") {
      // Pharmacy can see conversations with all patients
      const pharmacyConversations = {};
      
      allMessages.forEach((msg) => {
        if (msg.pharmacyId === user.email || msg.pharmacyId === user.pharmacyProfile?.email) {
          const patientId = msg.patientId;
          const patientName = msg.patientName;
          const patientAvatar = msg.patientAvatar;

          if (!pharmacyConversations[patientId]) {
            pharmacyConversations[patientId] = {
              id: patientId,
              name: patientName,
              avatar: patientAvatar || userImage,
              type: "Patient",
              messages: [],
              lastMessage: null,
              lastMessageTime: null,
            };
          }
          pharmacyConversations[patientId].messages.push(msg);
        }
      });

      const sortedConversations = Object.values(pharmacyConversations)
        .map((conv) => {
          const sortedMessages = conv.messages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          return {
            ...conv,
            messages: sortedMessages,
            lastMessage: sortedMessages[sortedMessages.length - 1],
            lastMessageTime: sortedMessages[sortedMessages.length - 1]?.timestamp,
          };
        })
        .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));

      setConversations(sortedConversations);
      if (sortedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(sortedConversations[0]);
      }
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation || !currentUser) return;

    const newMessage = {
      id: Date.now(),
      senderId: currentUser.email || currentUser.patientProfile?.email || currentUser.doctorProfile?.email || currentUser.pharmacyProfile?.email,
      senderName: currentUser.name || currentUser.patientProfile?.fullName || currentUser.doctorProfile?.fullName || currentUser.pharmacyProfile?.pharmacyName,
      senderAvatar: currentUser.patientProfile?.profilePicture || currentUser.doctorProfile?.profilePicture || currentUser.pharmacyProfile?.profilePicture || (currentUser.role === "Doctor" ? doctorImage : userImage),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    if (currentUser.role === "Patient") {
      newMessage.patientId = currentUser.email || currentUser.patientProfile?.email;
      newMessage.patientName = currentUser.patientProfile?.fullName || currentUser.name;
      newMessage.patientAvatar = currentUser.patientProfile?.profilePicture || userImage;
      
      if (selectedConversation.type === "Doctor") {
        newMessage.doctorId = selectedConversation.id;
        newMessage.doctorName = selectedConversation.name;
        newMessage.doctorAvatar = selectedConversation.avatar;
      } else {
        newMessage.pharmacyId = selectedConversation.id;
        newMessage.pharmacyName = selectedConversation.name;
        newMessage.pharmacyAvatar = selectedConversation.avatar;
      }
    } else if (currentUser.role === "Doctor") {
      newMessage.doctorId = currentUser.email || currentUser.doctorProfile?.email;
      newMessage.doctorName = currentUser.doctorProfile?.fullName || currentUser.name;
      newMessage.doctorAvatar = currentUser.doctorProfile?.profilePicture || doctorImage;
      newMessage.patientId = selectedConversation.id;
      newMessage.patientName = selectedConversation.name;
      newMessage.patientAvatar = selectedConversation.avatar;
    } else if (currentUser.role === "Pharmacy") {
      newMessage.pharmacyId = currentUser.email || currentUser.pharmacyProfile?.email;
      newMessage.pharmacyName = currentUser.pharmacyProfile?.pharmacyName || currentUser.name;
      newMessage.pharmacyAvatar = currentUser.pharmacyProfile?.profilePicture || userImage;
      newMessage.patientId = selectedConversation.id;
      newMessage.patientName = selectedConversation.name;
      newMessage.patientAvatar = selectedConversation.avatar;
    }

    // Save to localStorage
    const allMessages = JSON.parse(localStorage.getItem("Messages") || "[]");
    allMessages.push(newMessage);
    localStorage.setItem("Messages", JSON.stringify(allMessages));

    // Update conversation
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: newMessage,
      lastMessageTime: newMessage.timestamp,
    };

    setSelectedConversation(updatedConversation);
    setConversations((prev) =>
      prev.map((conv) => (conv.id === selectedConversation.id ? updatedConversation : conv))
        .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0))
    );

    setMessage("");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const isMyMessage = (msg) => {
    if (!currentUser) return false;
    const senderId = msg.senderId;
    const myId = currentUser.email || currentUser.patientProfile?.email || currentUser.doctorProfile?.email || currentUser.pharmacyProfile?.email;
    return senderId === myId;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        display: "flex",
      }}
    >
      {/* Sidebar - Conversations List */}
      <Box
        sx={{
          width: { xs: "100%", md: 350 },
          backgroundColor: "white",
          borderRight: "1px solid #E0E0E0",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ p: 3, borderBottom: "1px solid #E0E0E0" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 2,
              fontSize: "1.25rem",
            }}
          >
            Messages
          </Typography>
          <TextField
            fullWidth
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#757575" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Conversations List */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {filteredConversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#757575" }}>
                {searchTerm ? "No conversations found" : "No messages yet"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredConversations.map((conversation, index) => (
                <React.Fragment key={conversation.id}>
                  <ListItem
                    button
                    onClick={() => setSelectedConversation(conversation)}
                    sx={{
                      backgroundColor:
                        selectedConversation?.id === conversation.id ? "#E3F2FD" : "transparent",
                      "&:hover": {
                        backgroundColor:
                          selectedConversation?.id === conversation.id ? "#BBDEFB" : "#F5F5F5",
                      },
                      py: 2,
                      px: 3,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={conversation.avatar}
                        alt={conversation.name}
                        sx={{
                          width: 48,
                          height: 48,
                          border:
                            selectedConversation?.id === conversation.id ? "2px solid #1E88E5" : "none",
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: selectedConversation?.id === conversation.id ? 700 : 600,
                              color: "#1C1C1C",
                              fontSize: "0.95rem",
                            }}
                          >
                            {conversation.name}
                          </Typography>
                          {conversation.lastMessageTime && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#757575",
                                fontSize: "0.7rem",
                              }}
                            >
                              {formatTime(conversation.lastMessageTime)}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#757575",
                            fontSize: "0.8rem",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {conversation.lastMessage?.message || "No messages yet"}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < filteredConversations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Main Content - Chat */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <Box
              sx={{
                p: 3,
                backgroundColor: "white",
                borderBottom: "1px solid #E0E0E0",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                src={selectedConversation.avatar}
                alt={selectedConversation.name}
                sx={{ width: 48, height: 48 }}
              />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1C1C1C",
                    fontSize: "1.1rem",
                  }}
                >
                  {selectedConversation.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#757575" }}>
                  {selectedConversation.type}
                </Typography>
              </Box>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 3,
                backgroundColor: "#F5F7FA",
              }}
            >
              {selectedConversation.messages.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ color: "#757575" }}>
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {selectedConversation.messages.map((msg) => {
                    const isMine = isMyMessage(msg);
                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: "flex",
                          justifyContent: isMine ? "flex-end" : "flex-start",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        {!isMine && (
                          <Avatar
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            sx={{ width: 32, height: 32 }}
                          />
                        )}
                        <Paper
                          elevation={0}
                          sx={{
                            maxWidth: "70%",
                            p: 2,
                            backgroundColor: isMine ? "#1E88E5" : "white",
                            color: isMine ? "white" : "#1C1C1C",
                            borderRadius: 3,
                            border: isMine ? "none" : "1px solid #E0E0E0",
                          }}
                        >
                          {!isMine && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: isMine ? "rgba(255,255,255,0.8)" : "#757575",
                                fontSize: "0.7rem",
                                display: "block",
                                mb: 0.5,
                                fontWeight: 600,
                              }}
                            >
                              {msg.senderName}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.9rem",
                              lineHeight: 1.5,
                            }}
                          >
                            {msg.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isMine ? "rgba(255,255,255,0.7)" : "#757575",
                              fontSize: "0.7rem",
                              display: "block",
                              mt: 0.5,
                              textAlign: "right",
                            }}
                          >
                            {formatTime(msg.timestamp)}
                          </Typography>
                        </Paper>
                        {isMine && (
                          <Avatar
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            sx={{ width: 32, height: 32 }}
                          />
                        )}
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>
              )}
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 3,
                backgroundColor: "white",
                borderTop: "1px solid #E0E0E0",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={4}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  sx={{
                    backgroundColor: "#1E88E5",
                    color: "white",
                    width: 48,
                    height: 48,
                    "&:hover": {
                      backgroundColor: "#1565C0",
                    },
                    "&:disabled": {
                      backgroundColor: "#E0E0E0",
                      color: "#9E9E9E",
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: "#757575" }}>
              Select a conversation to start messaging
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Messages;

