// src/components/Header/Header.jsx
import React, { useState, useEffect } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Box,
  Badge,
  Avatar,
  Typography,
  styled,
  Button,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import userImage from "../../assets/user.svg";
import logoImage from "../../assets/Logo_2.png";
import FirestoreService from "../../services/FirestoreService";

const drawerWidth = 240;

// Styled AppBar
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isLargeScreen",
})(({ theme, open, isLargeScreen }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(isLargeScreen && open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(isLargeScreen && !open && {
    marginLeft: `calc(${theme.spacing(7)} + 1px)`,
    width: `calc(100% - calc(${theme.spacing(7)} + 1px))`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Header = ({ open, handleDrawerToggle }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  useEffect(() => {
    // التحقق من وجود بيانات المستخدم الحالي في localStorage
    const checkUserLogin = () => {
      const currentUser = localStorage.getItem("CurrentUser");
      if (currentUser) {
        try {
          const parsedData = JSON.parse(currentUser);
          setUserData(parsedData);
          setIsLoggedIn(true);
        } catch (error) {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkUserLogin();

    // الاستماع لتغييرات localStorage من نفس النافذة
    const handleStorageChange = (e) => {
      if (e.key === "CurrentUser" || !e.key) {
        checkUserLogin();
      }
    };

    // الاستماع لتغييرات localStorage من نافذة أخرى
    window.addEventListener("storage", handleStorageChange);
    
    // الاستماع لتغييرات localStorage من نفس النافذة (custom event)
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = function(...args) {
      originalSetItem.apply(this, args);
      if (args[0] === "CurrentUser") {
        window.dispatchEvent(new Event("storage"));
      }
    };

    localStorage.removeItem = function(...args) {
      originalRemoveItem.apply(this, args);
      if (args[0] === "CurrentUser") {
        window.dispatchEvent(new Event("storage"));
      }
    };

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("Cart");
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        } catch (error) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();

    // Listen for cart changes from same window (custom event)
    const handleCartUpdated = (e) => {
      if (e.detail?.totalItems !== undefined) {
        setCartCount(e.detail.totalItems);
      } else {
        updateCartCount();
      }
    };

    // Listen for cart changes from other tabs/windows (storage event)
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Load notifications from Firebase
  useEffect(() => {
    if (!isLoggedIn || !userData?.email) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const loadNotifications = async () => {
      try {
        // Get notifications based on user role
        let filters = {};
        if (userData.role === "Pharmacy") {
          filters = { pharmacyId: userData.email };
        } else if (userData.role === "Doctor") {
          filters = { doctorId: userData.email };
        } else if (userData.role === "Patient") {
          filters = { patientId: userData.email };
        }

        // Get from Firebase
        const firebaseNotifications = await FirestoreService.getNotifications(filters);
        
        // Get from localStorage as backup
        const localNotifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
        
        // Filter local notifications by user
        const filteredLocal = localNotifications.filter(notif => {
          if (userData.role === "Pharmacy") {
            return notif.pharmacyId === userData.email;
          } else if (userData.role === "Doctor") {
            return notif.doctorId === userData.email;
          } else if (userData.role === "Patient") {
            return notif.patientId === userData.email;
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
        setUnreadCount(sorted.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error loading notifications:", error);
        // Fallback to localStorage only
        const localNotifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
        const filtered = localNotifications.filter(notif => {
          if (userData.role === "Pharmacy") {
            return notif.pharmacyId === userData.email;
          } else if (userData.role === "Doctor") {
            return notif.doctorId === userData.email;
          } else if (userData.role === "Patient") {
            return notif.patientId === userData.email;
          }
          return false;
        });
        setNotifications(filtered);
        setUnreadCount(filtered.filter(n => !n.read).length);
      }
    };

    loadNotifications();

    // Subscribe to real-time updates
    let unsubscribe = null;
    if (userData?.email) {
      let filters = {};
      if (userData.role === "Pharmacy") {
        filters = { pharmacyId: userData.email };
      } else if (userData.role === "Doctor") {
        filters = { doctorId: userData.email };
      } else if (userData.role === "Patient") {
        filters = { patientId: userData.email };
      }

      unsubscribe = FirestoreService.subscribe(
        "notifications",
        (firestoreNotifications) => {
          // Filter by user
          const filtered = firestoreNotifications.filter(notif => {
            if (userData.role === "Pharmacy") {
              return notif.pharmacyId === userData.email;
            } else if (userData.role === "Doctor") {
              return notif.doctorId === userData.email;
            } else if (userData.role === "Patient") {
              return notif.patientId === userData.email;
            }
            return false;
          });

          // Merge with localStorage
          const localNotifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
          const filteredLocal = localNotifications.filter(notif => {
            if (userData.role === "Pharmacy") {
              return notif.pharmacyId === userData.email;
            } else if (userData.role === "Doctor") {
              return notif.doctorId === userData.email;
            } else if (userData.role === "Patient") {
              return notif.patientId === userData.email;
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
          setUnreadCount(sorted.filter(n => !n.read).length);
        },
        filters
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isLoggedIn, userData]);

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

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
      });
    } catch (error) {
      return "";
    }
  };

  const handleNotificationItemClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await FirestoreService.markNotificationAsRead(notification.id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // Navigate based on notification type
    if (notification.type === "order" && notification.orderId) {
      window.location.href = "/orders";
    } else if (notification.type === "appointment" && notification.appointmentId) {
      window.location.href = "/dashboard";
    }
    
    handleNotificationClose();
  };

  return (
    <AppBar position="fixed" open={open} isLargeScreen={isLargeScreen}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/*  Left Section */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ marginRight: 2, ...(isLargeScreen && open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <img
            src={logoImage}
            alt="Logo"
            style={{ width: "6rem" }}
          />
        </Box>

        {/* Right Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isLoggedIn ? (
            // العناصر للمستخدم المسجل
            <>
              <IconButton
                color="inherit"
                component={Link}
                to="/cart"
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              <IconButton 
                color="inherit"
                onClick={handleNotificationClick}
              >
                <Badge badgeContent={unreadCount > 0 ? unreadCount : 0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Notifications Menu */}
              <Menu
                anchorEl={notificationAnchor}
                open={Boolean(notificationAnchor)}
                onClose={handleNotificationClose}
                disableScrollLock
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 350,
                    maxWidth: 450,
                    maxHeight: 500,
                    overflow: "auto",
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box sx={{ p: 2, pb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {unreadCount} unread
                    </Typography>
                  )}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No notifications
                    </Typography>
                  </Box>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <MenuItem
                      key={notification.id}
                      onClick={() => handleNotificationItemClick(notification)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        backgroundColor: notification.read ? "transparent" : "action.hover",
                        "&:hover": {
                          backgroundColor: "action.selected",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <NotificationsIcon 
                          fontSize="small" 
                          sx={{ 
                            color: notification.read ? "text.secondary" : "primary.main" 
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: notification.read ? 400 : 600,
                              color: notification.read ? "text.secondary" : "text.primary",
                            }}
                          >
                            {notification.title || "Notification"}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            component="span"
                            sx={{ color: "text.secondary", display: "block" }}
                          >
                            {notification.message || ""}
                            <br />
                            <span style={{ fontSize: "0.7rem" }}>
                              {notification.date 
                                ? (notification.date.toDate 
                                    ? getRelativeTime(notification.date.toDate())
                                    : getRelativeTime(notification.date))
                                : ""}
                            </span>
                          </Typography>
                        }
                      />
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "primary.main",
                            ml: 1,
                          }}
                        />
                      )}
                    </MenuItem>
                  ))
                )}
                {notifications.length > 10 && (
                  <Divider />
                )}
                {notifications.length > 10 && (
                  <MenuItem
                    component={Link}
                    to="/notifications"
                    onClick={handleNotificationClose}
                    sx={{ justifyContent: "center", py: 1 }}
                  >
                    <Typography variant="body2" color="primary">
                      View All Notifications
                    </Typography>
                  </MenuItem>
                )}
              </Menu>

              <Box 
                sx={{ 
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center", 
                  gap: 1.5,
                }}
              >
                <Avatar
                  src={
                    userData?.patientProfile?.profilePicture ||
                    userData?.doctorProfile?.profilePicture ||
                    userData?.pharmacyProfile?.profilePicture ||
                    userImage
                  }
                  alt="User"
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {userData?.name || "User"}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: "0.75rem",
                      color: "rgba(255, 255, 255, 0.8)",
                      display: "block",
                      lineHeight: 1.2,
                    }}
                  >
                    {userData?.email || ""}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            // أزرار Login و Register للمستخدم غير المسجل
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                component={Link}
                to="/login"
                color="inherit"
                variant="outlined"
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.8)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/signup"
                color="inherit"
                variant="contained"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
