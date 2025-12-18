import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  CalendarToday as CalendarTodayIcon,
  LocalPharmacy as LocalPharmacyIcon,
} from "@mui/icons-material";
import FirestoreService from "../../services/FirestoreService";
import { useCurrentUser } from "../../hooks/useDataManager";

const Notifications = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser, loading: userLoading } = useCurrentUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "unread", "read"

  useEffect(() => {
    // Wait for user loading to complete before checking
    if (!userLoading) {
      if (!currentUser || !currentUser.email) {
        navigate("/login", { replace: true });
        return;
      }

      loadNotifications();
    }
  }, [currentUser, userLoading, navigate]);

  const loadNotifications = async () => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get notifications based on user role
      let filters = {};
      if (currentUser.role === "Pharmacy") {
        filters = { pharmacyId: currentUser.email };
      } else if (currentUser.role === "Doctor") {
        filters = { doctorId: currentUser.email };
      } else if (currentUser.role === "Patient") {
        filters = { patientId: currentUser.email };
      }

      // Get from Firebase
      const firebaseNotifications = await FirestoreService.getNotifications(filters);
      
      // Get from localStorage as backup
      const localNotifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
      
      // Filter local notifications by user
      const filteredLocal = localNotifications.filter(notif => {
        if (currentUser.role === "Pharmacy") {
          return notif.pharmacyId === currentUser.email;
        } else if (currentUser.role === "Doctor") {
          return notif.doctorId === currentUser.email;
        } else if (currentUser.role === "Patient") {
          return notif.patientId === currentUser.email;
        }
        return false;
      });

      // Merge and remove duplicates (prioritize Firebase)
      const allNotifications = [...firebaseNotifications];
      const firebaseIds = new Set(firebaseNotifications.map(n => n.id));
      
      filteredLocal.forEach(notif => {
        if (!firebaseIds.has(notif.id)) {
          allNotifications.push(notif);
        }
      });

      // Sort by date (newest first)
      const sorted = allNotifications.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
        return dateB - dateA;
      });

      setNotifications(sorted);
    } catch (error) {
      console.error("Error loading notifications:", error);
      // Fallback to localStorage only
      const localNotifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
      const filtered = localNotifications.filter(notif => {
        if (currentUser.role === "Pharmacy") {
          return notif.pharmacyId === currentUser.email;
        } else if (currentUser.role === "Doctor") {
          return notif.doctorId === currentUser.email;
        } else if (currentUser.role === "Patient") {
          return notif.patientId === currentUser.email;
        }
        return false;
      });
      setNotifications(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentUser?.email) return;

    let filters = {};
    if (currentUser.role === "Pharmacy") {
      filters = { pharmacyId: currentUser.email };
    } else if (currentUser.role === "Doctor") {
      filters = { doctorId: currentUser.email };
    } else if (currentUser.role === "Patient") {
      filters = { patientId: currentUser.email };
    }

    const unsubscribe = FirestoreService.subscribe(
      "notifications",
      (firestoreNotifications) => {
        // Filter by user
        const filtered = firestoreNotifications.filter(notif => {
          if (currentUser.role === "Pharmacy") {
            return notif.pharmacyId === currentUser.email;
          } else if (currentUser.role === "Doctor") {
            return notif.doctorId === currentUser.email;
          } else if (currentUser.role === "Patient") {
            return notif.patientId === currentUser.email;
          }
          return false;
        });

        // Merge with localStorage
        const localNotifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
        const filteredLocal = localNotifications.filter(notif => {
          if (currentUser.role === "Pharmacy") {
            return notif.pharmacyId === currentUser.email;
          } else if (currentUser.role === "Doctor") {
            return notif.doctorId === currentUser.email;
          } else if (currentUser.role === "Patient") {
            return notif.patientId === currentUser.email;
          }
          return false;
        });

        const allNotifications = [...filtered];
        const firebaseIds = new Set(filtered.map(n => n.id));
        
        filteredLocal.forEach(notif => {
          if (!firebaseIds.has(notif.id)) {
            allNotifications.push(notif);
          }
        });

        const sorted = allNotifications.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
          return dateB - dateA;
        });

        setNotifications(sorted);
      },
      filters
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  const getRelativeTime = (date) => {
    if (!date) return "";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const diffMs = now - dateObj;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingCartIcon />;
      case "appointment":
        return <CalendarTodayIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await FirestoreService.markNotificationAsRead(notification.id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // Navigate based on notification type
    if (notification.type === "order" && notification.orderId) {
      navigate("/orders");
    } else if (notification.type === "appointment" && notification.appointmentId) {
      navigate("/dashboard");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.email) return;

    try {
      const unreadNotifications = filteredNotifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notif => 
          FirestoreService.markNotificationAsRead(notif.id)
        )
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter(n => !n.read);
    } else if (filter === "read") {
      return notifications.filter(n => n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (userLoading || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser || !currentUser.email) {
    return null; // Will redirect to login
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F9FAFB", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: "text.primary" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1C1C1C" }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                color="error"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: "none" }}
            >
              Mark All as Read
            </Button>
          )}
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          <Button
            variant={filter === "all" ? "contained" : "outlined"}
            onClick={() => setFilter("all")}
            sx={{ textTransform: "none" }}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "contained" : "outlined"}
            onClick={() => setFilter("unread")}
            sx={{ textTransform: "none" }}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === "read" ? "contained" : "outlined"}
            onClick={() => setFilter("read")}
            sx={{ textTransform: "none" }}
          >
            Read ({notifications.length - unreadCount})
          </Button>
        </Box>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <NotificationsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === "unread" 
                  ? "You have no unread notifications"
                  : filter === "read"
                  ? "You have no read notifications"
                  : "You don't have any notifications yet"}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id || index}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 2,
                      px: 3,
                      backgroundColor: notification.read ? "transparent" : "action.hover",
                      "&:hover": {
                        backgroundColor: "action.selected",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          backgroundColor: notification.read 
                            ? theme.palette.grey[200] 
                            : theme.palette.primary.light,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: notification.read 
                            ? theme.palette.text.secondary 
                            : theme.palette.primary.main,
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: notification.read ? 500 : 700,
                              color: notification.read ? "text.secondary" : "text.primary",
                            }}
                          >
                            {notification.title || "Notification"}
                          </Typography>
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "primary.main",
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", mb: 0.5 }}
                          >
                            {notification.message || ""}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                          >
                            {notification.date 
                              ? (notification.date.toDate 
                                  ? getRelativeTime(notification.date.toDate())
                                  : getRelativeTime(notification.date))
                              : ""}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default Notifications;

