import { createTheme , ThemeProvider, CssBaseline } from "@mui/material";

//  Define the CurePan color palette
const CurePanTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1E88E5", // main blue
      light: "#63A4FF",
      dark: "#005CB2",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#43A047", // green accent
      light: "#76D275",
      dark: "#00701A",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F9FAFB", // overall background
      paper: "#FFFFFF", // card background
    },
    text: {
      primary: "#1C1C1C",
      secondary: "#555555",
    },
    error: {
      main: "#E53935",
    },
    success: {
      main: "#43A047",
    },
    info: {
      main: "#1E88E5",
    },
    warning: {
      main: "#FB8C00",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2rem",
      fontWeight: 600,
      color: "#1E88E5",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 500,
      color: "#1E88E5",
    },
    body1: {
      fontSize: "1rem",
      color: "#333",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 20px",
          boxShadow: "none",
          transition: "all 0.3s ease",
          ":hover": {
            boxShadow: "0 3px 8px rgba(30,136,229,0.2)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          padding: "1rem",
        },
      },
    },
  },
});

// Custom ThemeProvider component
const CurePanThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={CurePanTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default CurePanThemeProvider;