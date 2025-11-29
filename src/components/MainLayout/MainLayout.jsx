import React, { useState, useEffect } from "react";
import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet, useLocation } from "react-router";
import Sidebar from "../SideBar/SideBar";

const drawerWidth = 240;

export default function MainLayout() {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false); // Starts closed by default
  const location = useLocation();

  const handleDrawerToggle = () => setOpen(!open);
  const handleDrawerClose = () => setOpen(false);

  // Close sidebar automatically when page changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <CssBaseline />
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />

      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            marginTop: (theme) => `${theme.mixins.toolbar.minHeight}px`,
            marginLeft: 0,
            width: "100%",
            transition: theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* Dynamic Content */}
          <Outlet />
        </Box>
      </Box>

      <Footer open={open} />
    </Box>
  );
}
