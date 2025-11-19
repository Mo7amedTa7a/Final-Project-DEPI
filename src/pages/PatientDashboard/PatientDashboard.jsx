import React, { useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VideocamIcon from "@mui/icons-material/Videocam";
import PeopleIcon from "@mui/icons-material/People";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import doctorImage from "../../assets/doctor.svg";
import { useDataManager, useCurrentUser } from "../../hooks/useDataManager";
import PatientQueueView from "./components/PatientQueueView";

// Constants
const STATUS_COLORS = {
  Delivered: "success",
  Shipped: "warning",
  Processing: "info",
  default: "default",
};

const PatientDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { currentUser, loading } = useCurrentUser();
  const { data: appointments } = useDataManager("Appointments", []);
  const { data: orders } = useDataManager("Orders", []);
  const { data: prescriptions } = useDataManager("Prescriptions", []);

  // Check if user is logged in (only after loading is complete)
  useEffect(() => {
    // Wait for loading to complete before checking
    if (!loading) {
      if (!currentUser || !currentUser.email) {
        navigate("/login", { replace: true });
      }
    }
  }, [currentUser, loading, navigate]);

  const userName = currentUser?.patientProfile?.fullName || currentUser?.name || "Patient";

  // Filter appointments for current user
  const userAppointments = useMemo(() => {
    if (!currentUser) return [];
    const patientId = currentUser.email;
    return appointments
      .filter((apt) => apt.patientId === patientId && apt.status === "confirmed")
      .map((apt) => ({
        ...apt,
        doctorAvatar: doctorImage,
        appointmentType: apt.appointmentType || "video",
      }))
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      });
  }, [appointments, currentUser]);

  // Separate appointments by type
  const videoAppointments = useMemo(
    () => userAppointments.filter((apt) => apt.appointmentType === "video"),
    [userAppointments]
  );

  const onsiteAppointments = useMemo(
    () => userAppointments.filter((apt) => apt.appointmentType === "onsite"),
    [userAppointments]
  );

  // Filter orders for current user
  const recentOrders = useMemo(() => {
    if (!currentUser) return [];
    const patientId = currentUser.email;
    return orders
      .filter((order) => order.patientId === patientId)
      .map((order) => ({
        id: order.id,
        items: order.items || [],
        totalPrice: order.total || 0,
        status: order.status || "Processing",
        date: order.date || new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5); // Get latest 5 orders
  }, [orders, currentUser]);

  // Get today's or upcoming appointment for queue tracking
  const todayAppointment = useMemo(() => {
    if (!userAppointments || userAppointments.length === 0) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    
    // Find the first appointment from today onwards
    const upcomingAppointment = userAppointments.find((apt) => {
      if (!apt.date) return false;
      
      // Handle different date formats
      let aptDateStr = '';
      if (typeof apt.date === 'string') {
        aptDateStr = apt.date.split('T')[0].split(' ')[0];
      } else if (apt.date instanceof Date) {
        aptDateStr = apt.date.toISOString().split("T")[0];
      } else {
        aptDateStr = String(apt.date).split('T')[0].split(' ')[0];
      }
      
      const appointmentDate = new Date(aptDateStr);
      appointmentDate.setHours(0, 0, 0, 0);
      const todayDate = new Date(todayStr);
      todayDate.setHours(0, 0, 0, 0);
      
      return appointmentDate >= todayDate;
    });
    
    return upcomingAppointment || null;
  }, [userAppointments]);

  // Filter prescriptions for current user
  const userPrescriptions = useMemo(() => {
    if (!currentUser) return [];
    const patientId = currentUser.email;
    return prescriptions
      .filter((prescription) => {
        const matchesPatient = prescription.patientId === patientId || 
                              String(prescription.patientId) === String(patientId) ||
                              prescription.patientId?.toLowerCase() === patientId?.toLowerCase() ||
                              prescription.patientName === (currentUser.patientProfile?.fullName || currentUser.name);
        return matchesPatient;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.timestamp || 0);
        const dateB = new Date(b.date || b.timestamp || 0);
        return dateB - dateA; // Newest first
      })
      .slice(0, 5); // Get latest 5 prescriptions
  }, [prescriptions, currentUser]);

  const getStatusColor = useCallback((status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl" sx={{ mx: "auto", px: { xs: 1, sm: 2 } }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: { xs: 3, sm: 4 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#1E88E5",
              fontSize: { xs: "1.5rem", sm: "1.875rem", md: "2.125rem" },
              textAlign: { xs: "center", sm: "left" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Welcome back, {userName || "Patient"}!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth={isMobile}
            sx={{
              backgroundColor: "#1E88E5",
              color: "white",
              px: { xs: 2, sm: 3 },
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              "&:hover": {
                backgroundColor: "#005CB2",
              },
            }}
          >
            Book New Appointment
          </Button>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ justifyContent: "center" }}>
        {/* Right Column - Live Queue Tracker (يظهر أولاً في الموبايل) */}
        {currentUser && (
          <Grid 
            size={{ xs: 12, lg: 4 }}
            sx={{
              order: { xs: 1, lg: 2 },
            }}
          >
            {/* Live Queue Tracker Box - Always visible */}
            {todayAppointment ? (
              <PatientQueueView
                patientId={currentUser.email}
                doctorId={todayAppointment.doctorId}
              />
            ) : (
              <Card
                sx={{
                  borderRadius: { xs: 2, sm: 3 },
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  position: { lg: "sticky" },
                  top: { lg: 100 },
                  backgroundColor: "white",
                  border: "1px solid #E0E0E0",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mb: 1.5,
                      color: "#1C1C1C",
                      fontSize: "1.25rem",
                    }}
                  >
                    Live Queue Tracker
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#757575",
                      fontSize: "0.875rem",
                    }}
                  >
                    لا يوجد موعد اليوم لمتابعة الطابور
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        )}

        {/* Left Column - Main Content */}
        <Grid 
          size={{ xs: 12, lg: 8 }}
          sx={{
            order: { xs: 2, lg: 1 },
            maxWidth: { lg: "100%" },
          }}
        >
          {/* Video Call Appointments Section */}
          {videoAppointments.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: "#1C1C1C",
                  textAlign: { xs: "center", sm: "left" },
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                Video Call Appointments
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}>
                {videoAppointments.map((appointment) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={appointment.id} sx={{ display: "flex" }}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        overflow: "hidden",
                        backgroundColor: "white",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: { xs: "auto", sm: 480 },
                        "&:hover": {
                          transform: { xs: "none", sm: "translateY(-4px)" },
                          boxShadow: { xs: "0 2px 10px rgba(0,0,0,0.05)", sm: "0 4px 20px rgba(0,0,0,0.1)" },
                        },
                      }}
                    >
                      {/* Doctor Image */}
                      <Box
                        sx={{
                          width: "100%",
                          height: { xs: 180, sm: 200 },
                          backgroundColor: "#F5F5F5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          component="img"
                          src={doctorImage}
                          alt={appointment.doctorName}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        {/* Date and Status */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#757575",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              fontWeight: 500,
                            }}
                          >
                            {appointment.date} at {appointment.time}
                          </Typography>
                          <Chip
                            label={appointment.status}
                            size="small"
                            sx={{
                              backgroundColor: "#1E88E5",
                              color: "white",
                              fontWeight: 600,
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              height: { xs: 22, sm: 24 },
                              borderRadius: 2,
                            }}
                          />
                        </Box>

                        {/* Doctor Name */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            mb: 0.5,
                            color: "#1C1C1C",
                            fontSize: { xs: "1rem", sm: "1.125rem" },
                          }}
                        >
                          {appointment.doctorName}
                        </Typography>

                        {/* Consultation Type */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#757575",
                            mb: 2,
                            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                          }}
                        >
                          {appointment.consultationType || `${appointment.specialty} Consultation`}
                        </Typography>

                        {/* Queue Information */}
                        {appointment.queueCount > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mb: 1,
                              }}
                            >
                              <PeopleIcon
                                sx={{
                                  fontSize: { xs: 16, sm: 18 },
                                  color: "#757575",
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#757575",
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                {appointment.queueCount} in queue
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={appointment.queueProgress || 0}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: "#E0E0E0",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: "#1E88E5",
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                        )}

                        {/* Join Call Button */}
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<VideocamIcon />}
                          sx={{
                            backgroundColor: "#1E88E5",
                            color: "white",
                            textTransform: "none",
                            fontWeight: 600,
                            py: { xs: 1.25, sm: 1.5 },
                            borderRadius: 2,
                            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                            mt: "auto",
                            "&:hover": {
                              backgroundColor: "#005CB2",
                            },
                          }}
                        >
                          Join Call
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* On-site Appointments Section */}
          {onsiteAppointments.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: "#1C1C1C",
                  textAlign: { xs: "center", sm: "left" },
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                On-site Appointments
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}>
                {onsiteAppointments.map((appointment) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={appointment.id} sx={{ display: "flex" }}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: { xs: "auto", sm: 480 },
                        "&:hover": {
                          transform: { xs: "none", sm: "translateY(-4px)" },
                          boxShadow: { xs: "0 2px 10px rgba(0,0,0,0.05)", sm: "0 4px 20px rgba(0,0,0,0.1)" },
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            flexGrow: 1,
                            justifyContent: "center",
                          }}
                        >
                          <Avatar
                            src={doctorImage}
                            alt={appointment.doctorName}
                            sx={{
                              width: { xs: 100, sm: 120 },
                              height: { xs: 100, sm: 120 },
                              mb: { xs: 1.5, sm: 2 },
                              border: "3px solid #E3F2FD",
                            }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              mb: 0.5,
                              color: "#1C1C1C",
                            }}
                          >
                            {appointment.doctorName}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#555555",
                              mb: 1.5,
                            }}
                          >
                            {appointment.specialty}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mb: 0.5,
                              justifyContent: "center",
                            }}
                          >
                            <CalendarTodayIcon
                              sx={{ fontSize: 16, color: "#555555" }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {appointment.date}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mb: 2,
                              justifyContent: "center",
                            }}
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: 16, color: "#555555" }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {appointment.time}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              textTransform: "none",
                              borderColor: "#E0E0E0",
                              color: "#555555",
                              mt: "auto",
                              "&:hover": {
                                borderColor: "#1E88E5",
                                backgroundColor: "#E3F2FD",
                              },
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* My Prescriptions Section */}
          {userPrescriptions.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: "#1C1C1C",
                  textAlign: { xs: "center", sm: "left" },
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <LocalPharmacyIcon sx={{ color: "#1E88E5" }} />
                My Prescriptions
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 2, md: 2 }}>
                {userPrescriptions.map((prescription) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={prescription.id || prescription.timestamp}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        {/* Header */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                mb: 0.5,
                                color: "#1C1C1C",
                                fontSize: { xs: "1rem", sm: "1.125rem" },
                              }}
                            >
                              {prescription.medication || "Prescription"}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#757575", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                              Dr. {prescription.doctorName || "Unknown"}
                            </Typography>
                          </Box>
                          {prescription.status && (
                            <Chip
                              label={prescription.status}
                              size="small"
                              color={prescription.status === "active" ? "success" : "default"}
                              sx={{
                                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                height: { xs: 22, sm: 24 },
                              }}
                            />
                          )}
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        {/* Prescription Details */}
                        <Box sx={{ flex: 1, mb: 2 }}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#757575",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Dosage
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 500, fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                              {prescription.dosage && prescription.dosageUnit
                                ? `${prescription.dosage} ${prescription.dosageUnit}`
                                : "N/A"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#757575",
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                Frequency
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 500, fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                                {prescription.frequency || "N/A"}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#757575",
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                Duration
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 500, fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                                {prescription.duration && prescription.durationUnit
                                  ? `${prescription.duration} ${prescription.durationUnit}`
                                  : "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                          {prescription.specialInstructions && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#757575",
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                Instructions
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#1C1C1C", fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                                {prescription.specialInstructions}
                              </Typography>
                            </Box>
                          )}
                          {prescription.pharmacy && (
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#757575",
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                Pharmacy
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#1C1C1C", fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                                {prescription.pharmacy}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        {/* Footer */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" sx={{ color: "#757575", fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
                            {formatDate(prescription.date || prescription.timestamp)}
                          </Typography>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => navigate("/prescriptions")}
                            sx={{
                              textTransform: "none",
                              color: "#1E88E5",
                              fontWeight: 500,
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              "&:hover": {
                                backgroundColor: "#E3F2FD",
                              },
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Recent Medicine Orders Section */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
                color: "#1C1C1C",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Recent Medicine Orders
            </Typography>
            
            {/* Mobile View - Cards */}
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              {recentOrders.map((order, index) => (
                <Card
                  key={index}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.7rem",
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          ORDER ID
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "#1C1C1C",
                          }}
                        >
                          {order.orderId}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          borderRadius: 1,
                          fontSize: "0.7rem",
                          height: "24px",
                        }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.7rem",
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          DATE
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.875rem",
                            color: "#1C1C1C",
                          }}
                        >
                          {order.date}
                        </Typography>
                      </Box>
                      <Button
                        variant="text"
                        size="small"
                        sx={{
                          textTransform: "none",
                          color: "#1E88E5",
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          px: 1.5,
                          "&:hover": {
                            backgroundColor: "#E3F2FD",
                          },
                        }}
                      >
                        Track Order
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Desktop View - Table */}
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                display: { xs: "none", sm: "block" },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>ORDER ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#F9FAFB",
                        },
                      }}
                    >
                      <TableCell sx={{ fontSize: "0.875rem" }}>{order.orderId}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>{order.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="text"
                          size="small"
                          sx={{
                            textTransform: "none",
                            color: "#1E88E5",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            "&:hover": {
                              backgroundColor: "#E3F2FD",
                            },
                          }}
                        >
                          Track Order
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PatientDashboard;
