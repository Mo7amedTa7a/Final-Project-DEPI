import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VideocamIcon from "@mui/icons-material/Videocam";
import PeopleIcon from "@mui/icons-material/People";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import doctorImage from "../../assets/doctor.svg";
import { useDataManager, useCurrentUser } from "../../hooks/useDataManager";
import { useOrders, useAppointments } from "../../hooks/useData";
import PatientQueueView from "./components/PatientQueueView";
import FirestoreService from "../../services/FirestoreService";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, loading } = useCurrentUser();
  const { data: localStorageAppointments } = useDataManager("Appointments", []);
  // Get appointments from Firebase for real-time updates
  const { appointments: firebaseAppointments } = useAppointments({});
  const [successSnackbar, setSuccessSnackbar] = useState({ open: false, message: "" });
  
  // Combine Firebase and localStorage appointments (prefer Firebase for meetingStatus)
  const appointments = useMemo(() => {
    // First, add all Firebase appointments (they have the latest data including meetingStatus)
    const unique = new Map();
    
    firebaseAppointments?.forEach((apt) => {
      const key = apt.id || `${apt.doctorId}-${apt.patientId}-${apt.date}-${apt.time}`;
      unique.set(key, apt);
    });
    
    // Then, add localStorage appointments only if they don't exist in Firebase
    localStorageAppointments?.forEach((apt) => {
      const key = apt.id || `${apt.doctorId}-${apt.patientId}-${apt.date}-${apt.time}`;
      if (!unique.has(key)) {
        unique.set(key, apt);
      }
    });
    
    return Array.from(unique.values());
  }, [firebaseAppointments, localStorageAppointments]);
  // Get orders from Firebase and localStorage
  const { orders: firebaseOrders } = useOrders({});
  const { data: localOrders } = useDataManager("Orders", []);
  const { data: prescriptions } = useDataManager("Prescriptions", []);
  
  // Combine Firebase and localStorage orders, removing duplicates
  const orders = useMemo(() => {
    const allOrders = [...firebaseOrders];
    const firebaseIds = new Set(firebaseOrders.map(o => o.id));
    
    // Add local orders that don't exist in Firebase
    localOrders.forEach(localOrder => {
      if (!firebaseIds.has(localOrder.id)) {
        allOrders.push(localOrder);
      }
    });
    
    return allOrders;
  }, [firebaseOrders, localOrders]);

  // Check if user is logged in (only after loading is complete)
  useEffect(() => {
    // Wait for loading to complete before checking
    if (!loading) {
      if (!currentUser || !currentUser.email) {
        navigate("/login", { replace: true });
      }
    }
  }, [currentUser, loading, navigate]);

  // Check for success message from checkout
  useEffect(() => {
    const success = searchParams.get("success");
    const type = searchParams.get("type");
    if (success === "true") {
      if (type === "appointment") {
        setSuccessSnackbar({
          open: true,
          message: "Appointment booked successfully! Payment has been processed.",
        });
      }
      // Clean URL
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const userName = currentUser?.patientProfile?.fullName || currentUser?.name || "Patient";

  // Filter appointments for current user
  const userAppointments = useMemo(() => {
    if (!currentUser) return [];
    const patientId = currentUser.email;
    return appointments
      .filter((apt) => apt.patientId === patientId && apt.status === "confirmed")
      .map((apt) => ({
        ...apt,
        doctorAvatar: apt.doctorAvatar || apt.doctorImage || doctorImage,
        appointmentType: apt.appointmentType || "video",
        // Ensure meetingStatus and meetingLink are preserved
        meetingStatus: apt.meetingStatus || (apt.appointmentType === "video" ? "waiting" : undefined),
        meetingLink: apt.meetingLink,
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

  // Format date helper - must be defined before useMemo that uses it
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      // Handle Firestore Timestamp objects
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }, []);

  // Filter orders for current user
  const recentOrders = useMemo(() => {
    if (!currentUser) return [];
    const patientId = currentUser.email;
    return orders
      .filter((order) => {
        const orderPatientId = order.patientId;
        return orderPatientId === patientId || 
               String(orderPatientId).toLowerCase() === String(patientId).toLowerCase();
      })
      .map((order) => ({
        id: order.id,
        orderId: order.id, // Use id as orderId for display
        items: order.items || [],
        totalPrice: order.total || order.totalPrice || 0,
        status: order.status || "pending",
        date: formatDate(order.date),
        rawDate: order.date, // Keep raw date for sorting
        pharmacyId: order.pharmacyId,
        pharmacyName: order.pharmacyName || order.items?.[0]?.pharmacyName,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      }))
      .sort((a, b) => {
        const dateA = a.rawDate?.toDate ? a.rawDate.toDate().getTime() : a.rawDate ? new Date(a.rawDate).getTime() : 0;
        const dateB = b.rawDate?.toDate ? b.rawDate.toDate().getTime() : b.rawDate ? new Date(b.rawDate).getTime() : 0;
        return dateB - dateA; // Descending order
      })
      .slice(0, 3); // Get latest 3 orders
  }, [orders, currentUser, formatDate]);

  // Get today's or upcoming appointment for queue tracking
  // Always get the MOST RECENT ACTIVE appointment (by booking time or date)
  // Only show appointments that are NOT completed and NOT past their time
  const todayAppointment = useMemo(() => {
    if (!userAppointments || userAppointments.length === 0) return null;
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    
    // Filter appointments from today onwards that are ACTIVE (not completed)
    // IMPORTANT: Normalize appointments first to ensure bookingTime exists
    const normalizedAppointments = userAppointments.map((apt) => {
      // Ensure bookingTime exists for proper sorting
      if (!apt.bookingTime) {
        if (apt.dateCreated?.toDate) {
          apt.bookingTime = apt.dateCreated.toDate().toISOString();
        } else if (apt.dateCreated) {
          apt.bookingTime = typeof apt.dateCreated === 'string' 
            ? apt.dateCreated 
            : new Date(apt.dateCreated).toISOString();
        } else {
          apt.bookingTime = new Date().toISOString();
        }
      }
      // Ensure queueStatus exists
      if (!apt.queueStatus) {
        apt.queueStatus = "waiting";
      }
      return apt;
    });
    
    const upcomingAppointments = normalizedAppointments.filter((apt) => {
      if (!apt.date || !apt.time) return false;
      
      // Exclude completed appointments
      if (apt.queueStatus === "completed") return false;
      
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
      
      // Check if appointment date is today or future
      if (appointmentDate < todayDate) return false;
      
      // If appointment is today, check if time has passed
      if (appointmentDate.getTime() === todayDate.getTime()) {
        try {
          // Parse appointment time (format: "HH:MM" or "HH:MM AM/PM")
          const timeStr = apt.time.trim();
          let appointmentDateTime;
          
          if (timeStr.includes('AM') || timeStr.includes('PM')) {
            // 12-hour format
            appointmentDateTime = new Date(`${aptDateStr} ${timeStr}`);
          } else {
            // 24-hour format (HH:MM)
            const [hours, minutes] = timeStr.split(':');
            appointmentDateTime = new Date(aptDateStr);
            appointmentDateTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
          }
          
          // Add 1 hour buffer (appointment can be shown for 1 hour after its time)
          const appointmentEndTime = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
          
          // Only show if appointment hasn't ended yet (with 1 hour buffer)
          if (now > appointmentEndTime) {
            // If appointment is past and completed, don't show
            // If appointment is past but not completed, still don't show (it's effectively done)
            return false;
          }
        } catch (error) {
          // If time parsing fails, include it anyway (better to show than hide)
          console.warn("Error parsing appointment time:", apt.time, error);
        }
      }
      
      return true;
    });
    
    if (upcomingAppointments.length === 0) return null;
    
    // Sort by booking time (MOST RECENT booking first - latest booking gets priority)
    // This ensures that if you book a new appointment, it will be shown
    const sortedAppointments = upcomingAppointments.sort((a, b) => {
      // First, try to sort by bookingTime (most recent booking first)
      const aBookingTime = a.bookingTime ? new Date(a.bookingTime).getTime() : 0;
      const bBookingTime = b.bookingTime ? new Date(b.bookingTime).getTime() : 0;
      
      if (aBookingTime !== bBookingTime) {
        return bBookingTime - aBookingTime; // Most recent booking first
      }
      
      // If no bookingTime, sort by dateCreated
      const aDateCreated = a.dateCreated?.toDate ? a.dateCreated.toDate().getTime() : 
                           a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
      const bDateCreated = b.dateCreated?.toDate ? b.dateCreated.toDate().getTime() : 
                           b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
      
      if (aDateCreated !== bDateCreated) {
        return bDateCreated - aDateCreated; // Most recent first
      }
      
      // Finally, sort by date and time (earliest appointment first)
      const aDateTime = new Date(`${a.date} ${a.time}`).getTime();
      const bDateTime = new Date(`${b.date} ${b.time}`).getTime();
      return aDateTime - bDateTime; // Earliest appointment first (if same booking time)
    });
    
    // Return the most recent ACTIVE appointment (by booking time)
    return sortedAppointments[0] || null;
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
            onClick={() => navigate("/finddoctor")}
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
                          src={appointment.doctorAvatar || appointment.doctorImage || doctorImage}
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
                          {appointment.consultationType || 
                           (appointment.doctorSpecialty || appointment.specialty 
                             ? `${appointment.doctorSpecialty || appointment.specialty} Consultation`
                             : "Video Consultation")}
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

                        {/* Join Call Button - Only show when meeting is started */}
                        {appointment.meetingStatus === "started" && appointment.meetingLink ? (
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<VideocamIcon />}
                            onClick={async () => {
                              try {
                                // Update meeting status to joined in Firebase
                                if (appointment.id) {
                                  await FirestoreService.updateAppointment(appointment.id, {
                                    meetingStatus: "joined",
                                    meetingJoinedAt: new Date().toISOString(),
                                  });
                                }

                                // Update meeting status to joined in localStorage
                                const appointments = JSON.parse(localStorage.getItem("Appointments") || "[]");
                                const aptIndex = appointments.findIndex(apt => apt.id === appointment.id);
                                if (aptIndex !== -1) {
                                  appointments[aptIndex].meetingStatus = "joined";
                                  appointments[aptIndex].meetingJoinedAt = new Date().toISOString();
                                  localStorage.setItem("Appointments", JSON.stringify(appointments));
                                  window.dispatchEvent(new Event("storage"));
                                }

                                // Create notification for doctor
                                const doctorNotification = {
                                  type: "meeting",
                                  title: "انضم المريض للميتنج",
                                  message: `${currentUser?.patientProfile?.fullName || currentUser?.name || "المريض"} انضم للميتنج`,
                                  doctorId: appointment.doctorId,
                                  appointmentId: appointment.id,
                                  read: false,
                                };

                                // Save notification to Firebase
                                await FirestoreService.addNotification(doctorNotification);

                                // Also save to localStorage
                                const notifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
                                notifications.push({
                                  ...doctorNotification,
                                  id: Date.now() + Math.random(),
                                  date: new Date().toISOString(),
                                });
                                localStorage.setItem("Notifications", JSON.stringify(notifications));
                                window.dispatchEvent(new CustomEvent("notificationAdded", { detail: doctorNotification }));

                                // Open meeting link
                                window.open(appointment.meetingLink, "_blank");
                              } catch (error) {
                                // If update fails, still open the meeting link
                                window.open(appointment.meetingLink, "_blank");
                              }
                            }}
                            sx={{
                              backgroundColor: "#4CAF50",
                              color: "white",
                              textTransform: "none",
                              fontWeight: 600,
                              py: { xs: 1.25, sm: 1.5 },
                              borderRadius: 2,
                              fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                              mt: "auto",
                              "&:hover": {
                                backgroundColor: "#45A049",
                              },
                            }}
                          >
                            انضم للميتنج
                          </Button>
                        ) : appointment.meetingStatus === "waiting" ? (
                          <Button
                            variant="outlined"
                            fullWidth
                            disabled
                            startIcon={<VideocamIcon />}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              py: { xs: 1.25, sm: 1.5 },
                              borderRadius: 2,
                              fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                              mt: "auto",
                              borderColor: "#E0E0E0",
                              color: "#757575",
                            }}
                          >
                            في انتظار بدء الميتنج
                          </Button>
                        ) : null}
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
                        overflow: "hidden",
                        backgroundColor: "white",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
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
                          src={appointment.doctorAvatar || appointment.doctorImage || doctorImage}
                          alt={appointment.doctorName}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column" }}>
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
                          {appointment.consultationType || 
                           (appointment.doctorSpecialty || appointment.specialty 
                             ? `${appointment.doctorSpecialty || appointment.specialty} Consultation`
                             : "Video Consultation")}
                        </Typography>

                        {/* View Details Button */}
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => {
                            // Navigate to doctor profile page
                            const doctorId = appointment.doctorId || appointment.doctorEmail;
                            if (doctorId) {
                              navigate(`/doctor/${doctorId}`);
                            }
                          }}
                          sx={{
                            textTransform: "none",
                            borderColor: "#E0E0E0",
                            color: "#555555",
                            py: { xs: 1.25, sm: 1.5 },
                            borderRadius: 2,
                            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                            "&:hover": {
                              borderColor: "#1E88E5",
                              backgroundColor: "#E3F2FD",
                            },
                          }}
                        >
                          View Details
                        </Button>
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
                        onClick={() => navigate("/orders")}
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
                          onClick={() => navigate("/orders")}
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

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setSuccessSnackbar({ ...successSnackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSuccessSnackbar({ ...successSnackbar, open: false })} 
          severity="success" 
          sx={{ width: "100%" }}
        >
          {successSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientDashboard;
