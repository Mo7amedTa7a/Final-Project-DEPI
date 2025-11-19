import React, { useMemo, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import {
  RadioButtonChecked as LiveIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { useAppointments } from "../../../hooks/useData";
import { useDataManager } from "../../../hooks/useDataManager";
import doctorImage from "../../../assets/doctor.svg";
import {
  normalizeAppointment,
  sortAppointmentsByBookingTime,
  getBookingTime,
  calculateEstimatedWaitTime,
  DEFAULT_SLOT_DURATION,
} from "../../../utils/queueUtils";

const SimpleQueueTracker = ({ patientId, doctorId }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get appointments from Firebase
  const appointmentFilters = useMemo(() => {
    if (!doctorId || !patientId) return {};
    return {
      doctorId: doctorId,
      status: "confirmed",
      paymentStatus: "paid",
    };
  }, [doctorId, patientId]);

  const { appointments: firebaseAppointments, isLoading: firebaseLoading } = useAppointments(appointmentFilters);
  const { data: localStorageAppointments } = useDataManager("Appointments", []);

  // Combine Firebase and localStorage appointments and normalize them
  const allAppointments = useMemo(() => {
    const combined = [...(firebaseAppointments || []), ...(localStorageAppointments || [])];
    // Remove duplicates and normalize old appointments
    const unique = new Map();
    combined.forEach((apt) => {
      const key = apt.id || `${apt.doctorId}-${apt.patientId}-${apt.date}-${apt.time}`;
      if (!unique.has(key)) {
        const normalized = normalizeAppointment(apt);
        unique.set(key, normalized);
      }
    });
    return Array.from(unique.values());
  }, [firebaseAppointments, localStorageAppointments]);

  // Calculate queue data
  const queueData = useMemo(() => {
    if (!doctorId || !patientId) {
      return null;
    }

    const today = new Date().toISOString().split("T")[0];
    
    // Get all today's appointments for this doctor
    const todayAppointments = allAppointments.filter(
      (apt) =>
        apt.date === today &&
        apt.doctorId === doctorId &&
        apt.status === "confirmed" &&
        apt.paymentStatus === "paid"
    );

    if (todayAppointments.length === 0) {
      return null;
    }

    // Sort by booking time (first-come-first-served)
    const sortedAppointments = sortAppointmentsByBookingTime(todayAppointments);

    // Find patient's appointment
    const patientAppointment = sortedAppointments.find(
      (apt) => apt.patientId === patientId
    );

    if (!patientAppointment) {
      return null;
    }

    // Find currently serving (in-progress)
    const currentlyServing = sortedAppointments.find(
      (apt) => apt.queueStatus === "in-progress"
    );

    // Calculate patient's position
    const queueStatus = patientAppointment.queueStatus || "waiting";
    let currentlyServingNumber = 0;
    let yourNumber = 0;
    let estimatedWaitTime = 0;
    let progress = 0;

    // Get patient's booking time
    const patientBookingTime = getBookingTime(patientAppointment);

    // Find currently serving patient
    if (currentlyServing) {
      const servingIndex = sortedAppointments.findIndex(
        (apt) => apt.id === currentlyServing.id
      );
      currentlyServingNumber = servingIndex + 1;
    }

    if (queueStatus === "in-progress") {
      // Patient is currently being served
      yourNumber = currentlyServingNumber;
      estimatedWaitTime = 0;
      progress = 100;
    } else if (queueStatus === "waiting") {
      // Count patients ahead (booked before this patient and still waiting/in-progress)
      const patientsAhead = sortedAppointments.filter((apt) => {
        if (apt.id === patientAppointment.id) return false;
        const aptBookingTime = getBookingTime(apt);
        const aptStatus = apt.queueStatus || "waiting";
        return aptBookingTime < patientBookingTime && 
               (aptStatus === "waiting" || aptStatus === "in-progress");
      }).length;

      // Calculate position: patients ahead + 1 (if no one serving) or + 2 (if someone is serving)
      yourNumber = patientsAhead + (currentlyServing ? 2 : 1);
      estimatedWaitTime = calculateEstimatedWaitTime(patientsAhead, !!currentlyServing);
      
      const totalWaiting = sortedAppointments.filter(
        (apt) => apt.queueStatus === "waiting" || apt.queueStatus === "in-progress"
      ).length;
      progress = totalWaiting > 0 ? ((totalWaiting - patientsAhead - (currentlyServing ? 1 : 0)) / totalWaiting) * 100 : 0;
    } else {
      // Completed
      yourNumber = -1;
      progress = 100;
    }

    // Calculate total patients in queue
    const totalInQueue = sortedAppointments.filter(
      (apt) => apt.queueStatus === "waiting" || apt.queueStatus === "in-progress"
    ).length;

    // Calculate patients ahead
    const patientsAhead = queueStatus === "waiting" 
      ? (yourNumber > 0 ? yourNumber - 1 : 0)
      : 0;

    return {
      currentlyServing: currentlyServingNumber,
      yourNumber: yourNumber,
      estimatedWaitTime: estimatedWaitTime,
      progress: progress,
      doctorName: patientAppointment.doctorName,
      doctorAvatar: patientAppointment.doctorAvatar,
      doctorSpecialty: patientAppointment.doctorSpecialty,
      totalInQueue: totalInQueue,
      patientsAhead: patientsAhead,
      queueStatus: queueStatus,
    };
  }, [allAppointments, doctorId, patientId]);

  useEffect(() => {
    if (!firebaseLoading && allAppointments.length >= 0) {
      setIsLoading(false);
    }
  }, [allAppointments, firebaseLoading]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!queueData) {
    return null;
  }

  const { 
    currentlyServing, 
    yourNumber, 
    estimatedWaitTime, 
    progress, 
    doctorName,
    doctorAvatar,
    doctorSpecialty,
    totalInQueue,
    patientsAhead,
    queueStatus,
  } = queueData;

  return (
    <Card
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        position: { lg: "sticky" },
        top: { lg: 100 },
        backgroundColor: "white",
        border: "2px solid #1E88E5",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header with Live Indicator */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#1C1C1C",
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Live Queue Tracker
            <Chip
              icon={<LiveIcon sx={{ fontSize: 14, color: "#4CAF50" }} />}
              label="LIVE"
              size="small"
              sx={{
                backgroundColor: "#E8F5E9",
                color: "#2E7D32",
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 20,
                "& .MuiChip-icon": {
                  color: "#4CAF50",
                  animation: "pulse 2s infinite",
                },
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                  "100%": { opacity: 1 },
                },
              }}
            />
          </Typography>
        </Box>

        {/* Doctor Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            p: 2,
            backgroundColor: "#F5F5F5",
            borderRadius: 2,
          }}
        >
          <Avatar
            src={doctorAvatar || doctorImage}
            alt={doctorName}
            sx={{ width: 56, height: 56 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#1C1C1C", mb: 0.5 }}
            >
              {doctorName || "Doctor"}
            </Typography>
            {doctorSpecialty && (
              <Typography variant="body2" sx={{ color: "#757575" }}>
                {doctorSpecialty}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Queue Stats */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              p: 2,
              borderRadius: 2,
              backgroundColor: "#E3F2FD",
              border: "2px solid #1E88E5",
            }}
          >
            <PeopleIcon sx={{ fontSize: 28, color: "#1E88E5", mb: 1 }} />
            <Typography
              variant="body2"
              sx={{
                color: "#555555",
                mb: 1,
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              في الطابور
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#1E88E5",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {totalInQueue}
            </Typography>
            <Typography variant="caption" sx={{ color: "#757575" }}>
              {totalInQueue === 1 ? "مريض" : "مرضى"}
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              p: 2,
              borderRadius: 2,
              backgroundColor: queueStatus === "in-progress" ? "#E8F5E9" : "#FFF3E0",
              border: queueStatus === "in-progress" ? "2px solid #4CAF50" : "2px solid #F57C00",
            }}
          >
            <AccessTimeIcon 
              sx={{ 
                fontSize: 28, 
                color: queueStatus === "in-progress" ? "#4CAF50" : "#F57C00", 
                mb: 1 
              }} 
            />
            <Typography
              variant="body2"
              sx={{
                color: "#555555",
                mb: 1,
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              باقي على دورك
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: queueStatus === "in-progress" ? "#4CAF50" : "#F57C00",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {queueStatus === "in-progress" ? "الآن!" : patientsAhead}
            </Typography>
            <Typography variant="caption" sx={{ color: "#757575" }}>
              {queueStatus === "in-progress" 
                ? "دورك الآن" 
                : patientsAhead === 0 
                ? "أنت التالي" 
                : patientsAhead === 1 
                ? "مريض واحد" 
                : `${patientsAhead} مرضى`}
            </Typography>
          </Box>
        </Box>

        {/* Your Position */}
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            mb: 3,
            borderRadius: 2,
            backgroundColor: queueStatus === "in-progress" 
              ? "#E8F5E9" 
              : queueStatus === "completed"
              ? "#F5F5F5"
              : "#E3F2FD",
            border: queueStatus === "in-progress"
              ? "2px solid #4CAF50"
              : "2px solid #1E88E5",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#555555",
              mb: 1,
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            {queueStatus === "in-progress" 
              ? "دورك الآن!" 
              : queueStatus === "completed"
              ? "تم إكمال الموعد"
              : "رقمك في الطابور"}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: queueStatus === "in-progress" ? "#4CAF50" : "#1E88E5",
              fontSize: { xs: "3rem", sm: "4rem", md: "5rem" },
              mb: 1,
            }}
          >
            {queueStatus === "in-progress" 
              ? "✓" 
              : queueStatus === "completed"
              ? "✓"
              : yourNumber > 0 ? yourNumber : "-"}
          </Typography>
          {currentlyServing > 0 && queueStatus === "waiting" && (
            <Typography variant="body2" sx={{ color: "#757575" }}>
              حالياً: {currentlyServing}
            </Typography>
          )}
        </Box>

        {/* Estimated Wait Time */}
        {queueStatus === "waiting" && (
          <Box
            sx={{
              backgroundColor: "#FFF3E0",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              mb: { xs: 2, sm: 3 },
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <AccessTimeIcon sx={{ color: "#F57C00", fontSize: 20 }} />
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#F57C00",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                الوقت المتوقع للانتظار
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#F57C00",
                  fontWeight: 700,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                ~{estimatedWaitTime} دقيقة
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#E0E0E0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#1E88E5",
                borderRadius: 5,
              },
            }}
          />
        </Box>

        {queueStatus === "waiting" && (
          <Typography
            variant="body2"
            sx={{
              color: "#555555",
              textAlign: "center",
              fontStyle: "italic",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              mt: 2,
            }}
          >
            {patientsAhead === 0 
              ? "أنت التالي! استعد للموعد" 
              : `يرجى الاستعداد. سيتم إشعارك عندما يحين دورك`}
          </Typography>
        )}
        {queueStatus === "in-progress" && (
          <Typography
            variant="body2"
            sx={{
              color: "#4CAF50",
              textAlign: "center",
              fontWeight: 600,
              fontSize: "0.875rem",
              mt: 2,
            }}
          >
            🎉 دورك الآن! الدكتور يستقبلك
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleQueueTracker;

