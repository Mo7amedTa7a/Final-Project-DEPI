import React, { useState } from "react";
import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet } from "react-router"; // في حال استخدمت React Router
import Sidebar from "../SideBar/SideBar";

const drawerWidth = 240;

export default function MainLayout() {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false); // يبدأ مغلق افتراضياً

  const handleDrawerToggle = () => setOpen(!open);
  const handleDrawerClose = () => setOpen(false);

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
          {/* المحتوى المتغير */}
          <Outlet />
        </Box>
      </Box>

      <Footer open={open} />
    </Box>
  );
}
