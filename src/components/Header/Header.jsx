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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import userImage from "../../assets/user.svg";
import logoImage from "../../assets/Logo_2.png";

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

    // Listen for cart changes
    const handleCartChange = () => {
      updateCartCount();
    };

    window.addEventListener("storage", handleCartChange);
    return () => window.removeEventListener("storage", handleCartChange);
  }, []);

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

              <IconButton color="inherit">
                <Badge badgeContent={5} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

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
