import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container } from "@mui/material";
import { useCurrentUser } from "../../hooks/useDataManager";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, loading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!currentUser || !currentUser.email) {
        // User not logged in, redirect to login
        navigate("/login", { replace: true });
      } else if (requiredRole) {
        // Check if user has required role (support array of roles)
        const hasRequiredRole = Array.isArray(requiredRole)
          ? requiredRole.includes(currentUser.role)
          : currentUser.role === requiredRole;
        
        if (!hasRequiredRole) {
          // User doesn't have required role, redirect to home
          navigate("/", { replace: true });
        }
      }
    }
  }, [currentUser, loading, navigate, requiredRole]);

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  // Check if user is logged in
  if (!currentUser || !currentUser.email) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Please Login First
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You need to be logged in to access this page.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{ textTransform: "none" }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  // Check if user has required role (support array of roles)
  const hasRequiredRole = requiredRole 
    ? (Array.isArray(requiredRole) 
        ? requiredRole.includes(currentUser.role)
        : currentUser.role === requiredRole)
    : true;

  if (requiredRole && !hasRequiredRole) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You don't have permission to access this page.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{ textTransform: "none" }}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

