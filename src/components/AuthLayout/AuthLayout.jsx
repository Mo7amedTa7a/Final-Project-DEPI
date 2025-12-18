import React from "react";
import { Box, CssBaseline } from "@mui/material";
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: "100vh", overflow: "hidden" }}>
      <CssBaseline />
      <Outlet />
    </Box>
  );
}

