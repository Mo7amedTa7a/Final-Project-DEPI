// src/components/Header/Header.jsx
import React from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Box,
  Badge,
  Avatar,
  Typography,
  styled,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const drawerWidth = 240;

// Styled AppBar
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Header = ({ open, handleDrawerOpen }) => {
  return (
    <AppBar position="fixed" open={open}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/*  Left Section */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ marginRight: 5, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <img
            src="/src/assets/Logo_2.png"
            alt="Logo"
            style={{ width: "6rem" }}
          />
        </Box>

        {/* Right Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit">
            <Badge badgeContent={5} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src="https://i.pravatar.cc/40"
              alt="User"
              sx={{ width: 35, height: 35 }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Mohamed Taha
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
