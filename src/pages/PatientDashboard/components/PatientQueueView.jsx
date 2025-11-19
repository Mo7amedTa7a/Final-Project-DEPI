import React, { useMemo, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { useAppointments } from "../../../hooks/useData";
import { useDataManager } from "../../../hooks/useDataManager";
import doctorImage from "../../../assets/doctor.svg";
import {
  normalizeAppointment,
  sortAppointmentsByBookingTime,
  getBookingTime,
  calculateEstimatedWaitTime,
} from "../../../utils/queueUtils";

const PatientQueueView = ({ patientId, doctorId }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get appointments from Firebase - get ALL appointments for this doctor (not just this patient)
  // We need all appointments to calculate queue position correctly
  const appointmentFilters = useMemo(() => {
    if (!doctorId) return {};
    return {
      doctorId: doctorId,
      status: "confirmed",
      paymentStatus: "paid",
    };
  }, [doctorId]);

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

  // Get today's appointments for this doctor
  const queueInfo = useMemo(() => {
    if (!doctorId || !patientId) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    
    // Get all appointments from today onwards for this doctor
    const todayAppointments = allAppointments.filter((apt) => {
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
      
      return (
        appointmentDate >= todayDate &&
        apt.doctorId === doctorId &&
        apt.status === "confirmed" &&
        apt.paymentStatus === "paid"
      );
    });

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

    // Calculate queue position
    const queueStatus = patientAppointment.queueStatus || "waiting";
    let queuePosition = 0;
    let patientsAhead = 0;

    // Get patient's booking time
    const patientBookingTime = getBookingTime(patientAppointment);

    if (queueStatus === "waiting") {
      // Count patients who booked BEFORE this patient and are still waiting
      const waitingAhead = sortedAppointments.filter((apt) => {
        if (apt.id === patientAppointment.id) return false;
        const aptBookingTime = getBookingTime(apt);
        return (
          aptBookingTime < patientBookingTime &&
          apt.queueStatus === "waiting"
        );
      }).length;

      // Check if there's a patient currently in-progress who booked before this patient
      const inProgressBefore = sortedAppointments.some((apt) => {
        if (apt.id === patientAppointment.id) return false;
        const aptBookingTime = getBookingTime(apt);
        return (
          aptBookingTime < patientBookingTime &&
          apt.queueStatus === "in-progress"
        );
      });

      // Calculate queue position:
      // - If there's someone in-progress before this patient, they're being served now
      //   Position = waiting patients ahead + 1 (the in-progress patient doesn't count as "ahead" for waiting)
      // - Otherwise, position = waiting patients ahead + 1
      // Note: The in-progress patient is being served, so they don't count as "ahead"
      // but waiting patients before this one do count
      queuePosition = waitingAhead + 1;
      patientsAhead = waitingAhead;
      
      // If there's someone in-progress before this patient and no one waiting ahead,
      // this patient is next (position 1)
      if (inProgressBefore && waitingAhead === 0) {
        queuePosition = 1;
        patientsAhead = 0;
      }
    } else if (queueStatus === "in-progress") {
      // If patient is currently being served, they are position 0 (no one ahead)
      queuePosition = 0;
      patientsAhead = 0;
    } else {
      // Completed
      queuePosition = -1;
      patientsAhead = 0;
    }

    // Calculate estimated wait time
    const hasInProgress = sortedAppointments.some(
      (apt) => apt.queueStatus === "in-progress" && apt.patientId !== patientId
    );
    const estimatedWaitTime =
      queueStatus === "waiting"
        ? calculateEstimatedWaitTime(patientsAhead, hasInProgress)
        : queueStatus === "in-progress"
        ? 0
        : null;

    return {
      appointment: patientAppointment,
      queueStatus,
      queuePosition,
      patientsAhead,
      estimatedWaitTime,
      totalInQueue: sortedAppointments.filter(
        (apt) =>
          apt.queueStatus === "waiting" || apt.queueStatus === "in-progress"
      ).length,
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

  if (!queueInfo) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid #E0E0E0",
        }}
      >
        <CardContent sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" sx={{ color: "#757575" }}>
            لا يوجد موعد في الطابور اليوم
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { appointment, queueStatus, queuePosition, patientsAhead, estimatedWaitTime, totalInQueue } = queueInfo;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "1px solid #E0E0E0",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <PeopleIcon sx={{ fontSize: 32, color: "#1E88E5" }} />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1C1C1C",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              موضعك في الطابور
            </Typography>
            <Typography variant="body2" sx={{ color: "#757575" }}>
              مع د. {appointment.doctorName}
            </Typography>
          </Box>
        </Box>

        {/* Current Status */}
        {queueStatus === "in-progress" && (
          <Alert
            severity="success"
            icon={<PlayArrowIcon />}
            sx={{ mb: 3, backgroundColor: "#E8F5E9", color: "#2E7D32" }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              دورك الآن!
            </Typography>
            <Typography variant="body2">
              الدكتور يستقبلك الآن
            </Typography>
          </Alert>
        )}

        {queueStatus === "waiting" && (
          <>
            {/* Queue Position */}
            <Box
              sx={{
                textAlign: "center",
                p: 3,
                backgroundColor: "#E3F2FD",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: "#1E88E5",
                  mb: 1,
                  fontSize: { xs: "3rem", md: "4rem" },
                }}
              >
                {queuePosition}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1C1C1C", mb: 0.5 }}
              >
                رقمك في الطابور
              </Typography>
              <Typography variant="body2" sx={{ color: "#757575", mb: 1 }}>
                {patientsAhead === 0
                  ? "أنت التالي!"
                  : `يوجد ${patientsAhead} ${patientsAhead === 1 ? "مريض" : "مرضى"} قبلك`}
              </Typography>
              <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>
                إجمالي في الطابور: {totalInQueue} {totalInQueue === 1 ? "مريض" : "مرضى"}
              </Typography>
            </Box>

            {/* Estimated Wait Time */}
            {estimatedWaitTime !== null && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#FFF3E0",
                  borderRadius: 2,
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <AccessTimeIcon sx={{ color: "#F57C00", fontSize: 28 }} />
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#1C1C1C" }}
                  >
                    الوقت المتوقع للانتظار
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#F57C00" }}
                  >
                    ~{estimatedWaitTime} دقيقة
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: "#757575" }}>
                  التقدم في الطابور
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {queuePosition} / {totalInQueue}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((totalInQueue - patientsAhead) / totalInQueue) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#E0E0E0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#1E88E5",
                  },
                }}
              />
            </Box>
          </>
        )}

        {queueStatus === "completed" && (
          <Alert
            severity="info"
            icon={<CheckCircleIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              تم إكمال الموعد
            </Typography>
            <Typography variant="body2">
              شكراً لك على استخدام خدماتنا
            </Typography>
          </Alert>
        )}

        {/* Appointment Details */}
        <Box
          sx={{
            p: 2,
            backgroundColor: "#F5F5F5",
            borderRadius: 2,
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar
              src={appointment.doctorAvatar || doctorImage}
              alt={appointment.doctorName}
              sx={{ width: 48, height: 48 }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {appointment.doctorName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#757575" }}>
                {appointment.doctorSpecialty}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              icon={<AccessTimeIcon />}
              label={`${appointment.date} ${appointment.time}`}
              size="small"
              sx={{ fontWeight: 500 }}
            />
            <Chip
              label={
                appointment.appointmentType === "video"
                  ? "مكالمة فيديو"
                  : "زيارة عيادة"
              }
              size="small"
              color="primary"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PatientQueueView;

