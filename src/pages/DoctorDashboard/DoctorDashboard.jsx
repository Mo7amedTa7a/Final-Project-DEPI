import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Card, CardContent, Grid } from "@mui/material";
import LiveQueueTracker from "./components/LiveQueueTracker";
import { useCurrentUser, useDataManager } from "../../hooks/useDataManager";
import { useAppointments } from "../../hooks/useData";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useCurrentUser();
  const doctorId = currentUser?.email || currentUser?.doctorProfile?.email;
  
  // Memoize filters to prevent unnecessary re-renders
  const appointmentFilters = useMemo(() => {
    if (!doctorId) return {};
    return {
      doctorId: doctorId,
      status: "confirmed",
      paymentStatus: "paid"
    };
  }, [doctorId]);
  
  // Use useAppointments to fetch from Firebase, but also combine with localStorage for immediate updates
  const { appointments: firebaseAppointments } = useAppointments(appointmentFilters);
  const { data: localStorageAppointments } = useDataManager("Appointments", []);

  // Combine Firebase and localStorage appointments, removing duplicates and filtering by doctor
  const appointments = useMemo(() => {
    if (!doctorId) {
      return [];
    }
    
    const allAppointments = [...(firebaseAppointments || []), ...(localStorageAppointments || [])];
    
    // Filter by doctor first, then remove duplicates
    const doctorAppointments = allAppointments.filter(apt => {
      const matchesDoctor = apt.doctorId === doctorId || 
                            apt.doctorId === currentUser?.email ||
                            apt.doctorId === currentUser?.doctorProfile?.email ||
                            String(apt.doctorId) === String(doctorId) ||
                            String(apt.doctorId) === String(currentUser?.email) ||
                            String(apt.doctorId) === String(currentUser?.doctorProfile?.email);
      const isConfirmed = apt.status === "confirmed" && apt.paymentStatus === "paid";
      return matchesDoctor && isConfirmed;
    });
    
    // Remove duplicates
    const uniqueAppointments = new Map();
    doctorAppointments.forEach(apt => {
      const key = apt.id || `${apt.doctorId}-${apt.patientId}-${apt.date}-${apt.time}`;
      if (!uniqueAppointments.has(key)) {
        uniqueAppointments.set(key, apt);
      }
    });
    
    return Array.from(uniqueAppointments.values());
  }, [firebaseAppointments, localStorageAppointments, doctorId, currentUser]);
  
  const { data: messages } = useDataManager("Messages", []);

  // Check if user is logged in and has correct role (only after loading is complete)
  // Note: ProtectedRoute already handles authentication, but we add an extra check for role
  useEffect(() => {
    // Wait for loading to complete before checking
    if (!loading) {
      if (!currentUser || !currentUser.email) {
        // User is not logged in and loading is complete
        navigate("/login", { replace: true });
      } else if (currentUser.role !== "Doctor") {
        // User is logged in but not a doctor, redirect to appropriate dashboard
        navigate("/dashboard", { replace: true });
      }
    }
  }, [currentUser, loading, navigate]);

  const doctorName = currentUser?.doctorProfile?.fullName || currentUser?.name || "Dr. Unknown";

  // Calculate stats dynamically
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    
    // Count appointments today (appointments are already filtered by doctor)
    const appointmentsToday = appointments.filter(
      (apt) => apt.date === today
    ).length;

    // Count unread messages
    const unreadMessages = messages.filter(
      (msg) =>
        msg.receiverId === doctorId &&
        msg.receiverRole === "Doctor" &&
        !msg.read
    ).length;

    // Mock pending lab results (can be replaced with real data later)
    const pendingLabResults = 3;

    return {
      appointmentsToday,
      pendingLabResults,
      unreadMessages,
    };
  }, [appointments, messages, doctorId, currentUser]);


  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="xl" sx={{ mx: "auto" }}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid size={{ xs: 12 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1C1C1C",
                  mb: 1,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                Good morning, {doctorName}
              </Typography>
              <Typography variant="body1" sx={{ color: "#757575", fontSize: "0.95rem" }}>
                Here's your schedule and patient overview for today.
              </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#757575", fontSize: "0.875rem", mb: 1, fontWeight: 500 }}
                    >
                      Appointments Today
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: "#1C1C1C",
                        fontSize: { xs: "2rem", md: "2.5rem" },
                      }}
                    >
                      {stats.appointmentsToday}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#757575", fontSize: "0.875rem", mb: 1, fontWeight: 500 }}
                    >
                      Pending Lab Results
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: "#1C1C1C",
                        fontSize: { xs: "2rem", md: "2.5rem" },
                      }}
                    >
                      {stats.pendingLabResults}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#757575", fontSize: "0.875rem", mb: 1, fontWeight: 500 }}
                    >
                      Unread Messages
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: "#1C1C1C",
                        fontSize: { xs: "2rem", md: "2.5rem" },
                      }}
                    >
                      {stats.unreadMessages}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Live Queue Tracker */}
            <LiveQueueTracker doctorId={doctorId} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DoctorDashboard;
