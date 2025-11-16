import React from "react";
import { Box, Typography, Link, useMediaQuery, useTheme } from "@mui/material";

export default function Footer({ open }) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      sx={{
        backgroundColor: "#E0F7FA",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 1, sm: 1.25, md: 1.5 },
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        boxShadow: "0 -2px 6px rgba(0,0,0,0.1)",
        mt: "auto",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1, sm: 2 },
        marginLeft: {
          xs: 0,
          md: isLargeScreen && open ? "240px" : isLargeScreen ? `calc(${theme.spacing(7)} + 1px)` : 0,
        },
        width: {
          xs: "100%",
          md: isLargeScreen && open 
            ? `calc(100% - 240px)` 
            : isLargeScreen 
            ? `calc(100% - calc(${theme.spacing(7)} + 1px))` 
            : "100%",
        },
        transition: theme.transitions.create(["margin-left", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      {/* الروابط اليسار */}
      <Box 
        sx={{ 
          display: "flex", 
          gap: { xs: 2, sm: 3 },
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-start" },
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        <Link
          href="#"
          underline="none"
          color="inherit"
          sx={{ 
            fontSize: { xs: "0.8rem", sm: "0.9rem" }, 
            "&:hover": { textDecoration: "underline" } 
          }}
        >
          About Us
        </Link>
        <Link
          href="#"
          underline="none"
          color="inherit"
          sx={{ 
            fontSize: { xs: "0.8rem", sm: "0.9rem" }, 
            "&:hover": { textDecoration: "underline" } 
          }}
        >
          Contact Us
        </Link>
      </Box>

      {/* حقوق النشر */}
      <Typography
        variant="body2"
        sx={{ 
          color: "text.secondary", 
          fontSize: { xs: "0.75rem", sm: "0.8rem" },
          textAlign: { xs: "center", sm: "right" },
        }}
      >
        © {new Date().getFullYear()} CureTap
      </Typography>
    </Box>
  );
}
