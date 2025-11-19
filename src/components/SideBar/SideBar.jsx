import * as React from "react";
import {
  styled,
  useTheme,
  Box,
  Drawer as MuiDrawer,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import HomeIcon from "@mui/icons-material/Home";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MessageIcon from "@mui/icons-material/Message";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import GroupIcon from "@mui/icons-material/Group";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { menuItemsConfig, bottomMenuConfig } from "../../Data/SidebarData";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));


export default function Sidebar({ open, handleDrawerClose }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutToast, setLogoutToast] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  // إغلاق الـ sidebar تلقائياً عند تغيير الصفحة (خاصة للشاشات الصغيرة)
  React.useEffect(() => {
    if (!isLargeScreen && open) {
      handleDrawerClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  React.useEffect(() => {
    // الحصول على role المستخدم من localStorage
    const currentUser = localStorage.getItem("CurrentUser");
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        setUserRole(userData.role);
      } catch (error) {
        // Error parsing user data
      }
    }

    // الاستماع لتغييرات localStorage
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("CurrentUser");
      if (updatedUser) {
        try {
          const userData = JSON.parse(updatedUser);
          setUserRole(userData.role);
        } catch (error) {
          // Error parsing user data
        }
      } else {
        setUserRole(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    // حذف المستخدم الحالي فقط وليس كل البيانات
    localStorage.removeItem("CurrentUser");
    setLogoutToast(true);
    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1500);
  };

  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setLogoutToast(false);
  };

  // Icon mapping
  const iconMap = {
    Dashboard: DashboardIcon,
    Home: HomeIcon,
    PersonSearch: PersonSearchIcon,
    LocalPharmacy: LocalPharmacyIcon,
    Message: MessageIcon,
    ShoppingBag: ShoppingBagIcon,
    Group: GroupIcon,
    Description: DescriptionIcon,
    AccountBalanceWallet: AccountBalanceWalletIcon,
    AccountCircle: AccountCircleIcon,
    Logout: LogoutIcon,
  };

  // Convert config to menu items with icons
  const allMenuItems = menuItemsConfig.map((item) => ({
    ...item,
    icon: React.createElement(iconMap[item.iconName]),
  }));

  // تصفية القائمة بناءً على role المستخدم
  const mainMenu = allMenuItems.filter((item) => {
    // إذا لم يكن للعنصر خاصية roles، يظهر للجميع
    if (!item.roles) return true;
    // إذا كان للعنصر خاصية roles، يظهر فقط للـ roles المحددة
    return item.roles.includes(userRole);
  });

  const bottomMenu = bottomMenuConfig.map((item) => ({
    ...item,
    icon: React.createElement(iconMap[item.iconName]),
    action: item.text === "Logout" ? handleLogout : undefined,
  }));

  return (
    <>
      {/* Permanent drawer للشاشات الكبيرة */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          display: { xs: "none", md: "block" },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {mainMenu.map(({ text, icon, path }) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to={path}
                onClick={() => {
                  // إغلاق الـ sidebar عند الضغط على أي رابط (خاصة للشاشات الصغيرة)
                  if (!isLargeScreen) {
                    handleDrawerClose();
                  }
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    color: "#1976d2",
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ position: "absolute", bottom: 0, width: "100%" }}>
          <Divider />
          <List>
            {bottomMenu.map(({ text, icon, color, action, path }) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => {
                    if (action) {
                      action();
                    }
                    // إغلاق الـ sidebar عند الضغط على أي رابط (خاصة للشاشات الصغيرة)
                    if (!isLargeScreen && path) {
                      handleDrawerClose();
                    }
                  }}
                  component={path ? Link : action ? "button" : "div"}
                  to={path || undefined}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.1)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: color || "#1976d2",
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Temporary drawer للشاشات الصغيرة */}
      <MuiDrawer
        variant="temporary"
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: { xs: "100%", sm: "50%" },
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>

        <Divider />
        <List>
          {mainMenu.map(({ text, icon, path }) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to={path}
                onClick={handleDrawerClose}
                sx={{
                  minHeight: 48,
                  justifyContent: "initial",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 3,
                    justifyContent: "center",
                    color: "#1976d2",
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ position: "absolute", bottom: 0, width: "100%" }}>
          <Divider />
          <List>
            {bottomMenu.map(({ text, icon, color, action, path }) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => {
                    if (action) {
                      action();
                    }
                    if (path) {
                      handleDrawerClose();
                    }
                  }}
                  component={path ? Link : action ? "button" : "div"}
                  to={path || undefined}
                  sx={{
                    minHeight: 48,
                    justifyContent: "initial",
                    px: 2.5,
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.1)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: "center",
                      color: color || "#1976d2",
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </MuiDrawer>

      <Snackbar
        open={logoutToast}
        autoHideDuration={2000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseToast} severity="success" sx={{ width: "100%" }}>
          تم تسجيل الخروج بنجاح!
        </Alert>
      </Snackbar>
    </>
  );
}
