import React from "react";
import { Box, Typography, Link } from "@mui/material";

export default function Footer({ open }) {
  return (
    <Box
      sx={{
        backgroundColor: "#E0F7FA",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 4,
        py: 1.5,
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        boxShadow: "0 -2px 6px rgba(0,0,0,0.1)",
        mt: "auto",
        marginLeft: {
          xs: open ? "240px" : "64px",
          sm: open ? "240px" : "64px",
        },
        width: {
          xs: `calc(100% - ${open ? "240px" : "64px"})`,
          sm: `calc(100% - ${open ? "240px" : "64px"})`,
        },
        transition: "margin-left 0.3s ease, width 0.3s ease",
      }}
    >
      {/* الروابط اليسار */}
      <Box sx={{ display: "flex", gap: 3 }}>
        <Link
          href="#"
          underline="none"
          color="inherit"
          sx={{ fontSize: "0.9rem", "&:hover": { textDecoration: "underline" } }}
        >
          About Us
        </Link>
        <Link
          href="#"
          underline="none"
          color="inherit"
          sx={{ fontSize: "0.9rem", "&:hover": { textDecoration: "underline" } }}
        >
          Contact Us
        </Link>
      </Box>

      {/* حقوق النشر */}
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontSize: "0.8rem" }}
      >
        © {new Date().getFullYear()} CureTap
      </Typography>
    </Box>
  );
}
