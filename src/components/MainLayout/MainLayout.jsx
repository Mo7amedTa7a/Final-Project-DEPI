import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet } from "react-router"; // في حال استخدمت React Router
import Sidebar from "../SideBar/SideBar";

export default function MainLayout() {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <CssBaseline />
      <Header open={open} handleDrawerOpen={handleDrawerOpen} />

      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            marginLeft: { 
              xs: open ? "240px" : "64px",
              sm: open ? "240px" : "64px",
            },
            marginTop: (theme) => `${theme.mixins.toolbar.minHeight}px`,
            transition: "margin-left 0.3s ease",
            width: { 
              xs: `calc(100% - ${open ? "240px" : "64px"})`,
              sm: `calc(100% - ${open ? "240px" : "64px"})`,
            },
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
