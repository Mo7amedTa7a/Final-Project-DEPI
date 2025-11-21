import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Videocam as VideocamIcon,
} from "@mui/icons-material";
import FirestoreService from "../../../services/FirestoreService";
import userImage from "../../../assets/user.svg";
import {
  normalizeAppointment,
  sortAppointmentsByBookingTime,
  categorizeByQueueStatus,
} from "../../../utils/queueUtils";
import { useAppointments } from "../../../hooks/useData";
import { useDataManager } from "../../../hooks/useDataManager";
import PrescriptionModal from "./PrescriptionModal";

const DEFAULT_SLOT_DURATION = 60; // 60 minutes default slot

const LiveQueueTracker = ({ doctorId }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [currentPatientData, setCurrentPatientData] = useState(null);
  
  // Get appointments from Firebase with real-time updates
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

  // Combine Firebase and localStorage appointments
  const appointments = useMemo(() => {
    if (!doctorId) {
      return [];
    }
    
    // Start with empty array
    const allAppointments = [];
    
    // Add Firebase appointments
    if (firebaseAppointments && Array.isArray(firebaseAppointments)) {
      allAppointments.push(...firebaseAppointments);
    }
    
    // Add localStorage appointments
    if (localStorageAppointments && Array.isArray(localStorageAppointments)) {
      allAppointments.push(...localStorageAppointments);
    }
    
    if (allAppointments.length === 0) {
      return [];
    }
    
    // Normalize all appointments first to ensure queueStatus exists
    const normalizedAppointments = allAppointments.map(apt => normalizeAppointment(apt));
    
    // Remove duplicates - prefer Firebase data over localStorage
    const unique = new Map();
    normalizedAppointments.forEach((apt) => {
      const key = apt.id || `${apt.doctorId || apt.doctorEmail || 'unknown'}-${apt.patientId || 'unknown'}-${apt.date || 'unknown'}-${apt.time || 'unknown'}`;
      // If key exists, prefer the one with id (from Firebase)
      if (!unique.has(key) || apt.id) {
        unique.set(key, apt);
      }
    });
    
    // Filter by doctor - check multiple possible formats
    const doctorAppointments = Array.from(unique.values()).filter(apt => {
      const aptDoctorId = apt.doctorId || apt.doctorEmail || "";
      const match = aptDoctorId === doctorId || 
             String(aptDoctorId) === String(doctorId) ||
             aptDoctorId?.toLowerCase() === doctorId?.toLowerCase();
      return match;
    });
    
    return doctorAppointments;
  }, [firebaseAppointments, localStorageAppointments, doctorId]);

  // Filter today's and upcoming appointments and sort by booking time (first-come-first-served)
  const queueData = useMemo(() => {
    if (!appointments || appointments.length === 0) {
      return {
        waiting: [],
        inProgress: null,
        completed: [],
        totalWaiting: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    
    // Get tomorrow's date for filtering
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    
    // Filter today's and tomorrow's appointments - handle different date formats
    const todayAppointments = appointments
      .filter((apt) => {
        const aptDate = apt.date;
        if (!aptDate) {
          return false;
        }
        
        // Handle different date formats
        let dateStr = '';
        if (typeof aptDate === 'string') {
          // If date includes time, extract just the date part
          dateStr = aptDate.split('T')[0].split(' ')[0];
        } else if (aptDate instanceof Date) {
          dateStr = aptDate.toISOString().split("T")[0];
        } else {
          dateStr = String(aptDate).split('T')[0].split(' ')[0];
        }
        
        // Include today and tomorrow appointments, or any future date
        const appointmentDate = new Date(dateStr);
        appointmentDate.setHours(0, 0, 0, 0);
        const todayDate = new Date(todayStr);
        todayDate.setHours(0, 0, 0, 0);
        
        // Include appointments from today onwards (not past dates)
        return appointmentDate >= todayDate;
      })
      .map((apt) => normalizeAppointment(apt));

    // Sort by booking time (bookingTime or dateCreated) - first booked, first served
    const sortedAppointments = sortAppointmentsByBookingTime(todayAppointments);

    // Categorize appointments by queue status
    const { waiting, inProgress, completed } = categorizeByQueueStatus(sortedAppointments);

    // Assign queue positions to waiting patients
    waiting.forEach((apt, index) => {
      apt.queuePosition = index + 1;
    });

    return {
      waiting,
      inProgress,
      completed,
      totalWaiting: waiting.length,
    };
  }, [appointments]);

  const handleStartNext = async () => {
    if (queueData.waiting.length === 0) {
      setError("لا يوجد مرضى في الانتظار");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const nextPatient = queueData.waiting[0];

      // If there's a current in-progress appointment, mark it as completed
      if (queueData.inProgress) {
        await FirestoreService.updateAppointment(queueData.inProgress.id, {
          queueStatus: "completed",
          completedAt: new Date().toISOString(),
        });

        // Also update localStorage
        const localAppointments = JSON.parse(
          localStorage.getItem("Appointments") || "[]"
        );
        const localIndex = localAppointments.findIndex(
          (apt) => apt.id === queueData.inProgress.id
        );
        if (localIndex !== -1) {
          localAppointments[localIndex].queueStatus = "completed";
          localAppointments[localIndex].completedAt = new Date().toISOString();
          localStorage.setItem("Appointments", JSON.stringify(localAppointments));
          window.dispatchEvent(new Event("storage"));
        }
      }

      // Start the next patient
      await FirestoreService.updateAppointment(nextPatient.id, {
        queueStatus: "in-progress",
        startedAt: new Date().toISOString(),
        estimatedEndTime: new Date(
          Date.now() + DEFAULT_SLOT_DURATION * 60 * 1000
        ).toISOString(),
      });

      // Also update localStorage
      const localAppointments = JSON.parse(
        localStorage.getItem("Appointments") || "[]"
      );
      const localIndex = localAppointments.findIndex(
        (apt) => apt.id === nextPatient.id
      );
      if (localIndex !== -1) {
        localAppointments[localIndex].queueStatus = "in-progress";
        localAppointments[localIndex].startedAt = new Date().toISOString();
        localAppointments[localIndex].estimatedEndTime = new Date(
          Date.now() + DEFAULT_SLOT_DURATION * 60 * 1000
        ).toISOString();
        localStorage.setItem("Appointments", JSON.stringify(localAppointments));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحديث الطابور");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteCurrent = async () => {
    if (!queueData.inProgress) {
      setError("لا يوجد مريض قيد المعالجة حالياً");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const currentPatientId = queueData.inProgress.id;
      const nextPatient = queueData.waiting.length > 0 ? queueData.waiting[0] : null;

      // Mark current patient as completed
      await FirestoreService.updateAppointment(currentPatientId, {
        queueStatus: "completed",
        completedAt: new Date().toISOString(),
      });

      // Also update localStorage
      const localAppointments = JSON.parse(
        localStorage.getItem("Appointments") || "[]"
      );
      const localIndex = localAppointments.findIndex(
        (apt) => apt.id === currentPatientId
      );
      if (localIndex !== -1) {
        localAppointments[localIndex].queueStatus = "completed";
        localAppointments[localIndex].completedAt = new Date().toISOString();
        localStorage.setItem("Appointments", JSON.stringify(localAppointments));
        window.dispatchEvent(new Event("storage"));
      }

      // Automatically start next patient if available
      if (nextPatient) {
        // Start the next patient immediately
        await FirestoreService.updateAppointment(nextPatient.id, {
          queueStatus: "in-progress",
          startedAt: new Date().toISOString(),
          estimatedEndTime: new Date(
            Date.now() + DEFAULT_SLOT_DURATION * 60 * 1000
          ).toISOString(),
        });

        // Also update localStorage
        const localAppts = JSON.parse(
          localStorage.getItem("Appointments") || "[]"
        );
        const localIdx = localAppts.findIndex(
          (apt) => apt.id === nextPatient.id
        );
        if (localIdx !== -1) {
          localAppts[localIdx].queueStatus = "in-progress";
          localAppts[localIdx].startedAt = new Date().toISOString();
          localAppts[localIdx].estimatedEndTime = new Date(
            Date.now() + DEFAULT_SLOT_DURATION * 60 * 1000
          ).toISOString();
          localStorage.setItem("Appointments", JSON.stringify(localAppts));
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (err) {
      setError("حدث خطأ أثناء إكمال الموعد");
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateEstimatedWaitTime = (position) => {
    // Each patient gets DEFAULT_SLOT_DURATION minutes
    // Add some buffer for the current patient if in progress
    const currentTime = queueData.inProgress
      ? DEFAULT_SLOT_DURATION
      : 0;
    return (position - 1) * DEFAULT_SLOT_DURATION + currentTime;
  };

  // Load patient data when in-progress patient changes
  useEffect(() => {
    const loadPatientData = async () => {
      if (!queueData.inProgress) {
        setCurrentPatientData(null);
        return;
      }

      const patientId = queueData.inProgress.patientId;
      if (!patientId) {
        // Use appointment data as fallback
        setCurrentPatientData({
          name: queueData.inProgress.patientName || "Unknown Patient",
          email: patientId || "",
          dob: "N/A",
          allergies: [],
          avatar: userImage,
        });
        return;
      }

      try {
        // Try to get patient from Firebase
        const firebaseUsers = await FirestoreService.get("users", {
          where: [{ field: "email", operator: "==", value: patientId }],
        });

        // Try to get from localStorage
        const localUsers = JSON.parse(localStorage.getItem("Users") || "[]");
        const localPatient = localUsers.find(
          (user) => (user.email || user.id) === patientId
        );

        const patient = firebaseUsers[0] || localPatient;

        if (patient && patient.patientProfile) {
          const profile = patient.patientProfile;
          setCurrentPatientData({
            name: profile.fullName || patient.name || queueData.inProgress.patientName,
            email: patient.email || patientId,
            dob: profile.dob || "N/A",
            age: profile.age || "N/A",
            gender: profile.gender || "Not specified",
            phone: profile.phoneNumber || "",
            address: profile.address || "Not provided",
            bloodType: profile.bloodType || "Not specified",
            allergies: profile.allergies || profile.chronicConditions || [],
            medications: profile.medications || "None",
            emergencyContact: profile.emergencyContact || "Not provided",
            avatar: profile.profilePicture || userImage,
          });
        } else {
          // Use appointment data as fallback
          setCurrentPatientData({
            name: queueData.inProgress.patientName || "Unknown Patient",
            email: patientId,
            dob: "N/A",
            allergies: [],
            avatar: userImage,
          });
        }
      } catch (error) {
        // Use appointment data as fallback
        setCurrentPatientData({
          name: queueData.inProgress.patientName || "Unknown Patient",
          email: patientId,
          dob: "N/A",
          allergies: [],
          avatar: userImage,
        });
      }
    };

    loadPatientData();
  }, [queueData.inProgress]);

  const handlePrescribeMedication = () => {
    if (queueData.inProgress) {
      setPrescriptionModalOpen(true);
    }
  };

  // Generate Jitsi Meet link
  const generateMeetingLink = (appointmentId) => {
    // Create a unique room name based on appointment ID
    const roomName = `appointment-${appointmentId}-${Date.now()}`;
    // Use Jitsi Meet public server
    return `https://meet.jit.si/${roomName}`;
  };

  // Handle starting video meeting
  const handleStartMeeting = async (appointmentId) => {
    if (!appointmentId) {
      setError("لا يوجد موعد محدد");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // Generate meeting link
      const meetingLink = generateMeetingLink(appointmentId);

      // Get the appointment to find Firebase document ID
      const appointment = queueData.inProgress;
      
      // Try to find Firebase document ID
      // First, try to find in Firebase appointments
      let firebaseDocId = appointmentId;
      if (firebaseAppointments && firebaseAppointments.length > 0) {
        const firebaseApt = firebaseAppointments.find(apt => 
          apt.id === appointmentId || 
          (apt.doctorId === appointment.doctorId && 
           apt.patientId === appointment.patientId && 
           apt.date === appointment.date && 
           apt.time === appointment.time)
        );
        if (firebaseApt && firebaseApt.id) {
          firebaseDocId = firebaseApt.id;
        }
      }

      // Update appointment with meeting status and link in Firebase
      try {
        await FirestoreService.updateAppointment(firebaseDocId, {
          meetingStatus: "started",
          meetingLink: meetingLink,
          meetingStartedAt: new Date().toISOString(),
        });
      } catch (updateError) {
        // If update fails, try with original appointmentId
        if (updateError.message && updateError.message.includes("does not exist")) {
          console.warn("Failed to update with Firebase ID, trying with appointmentId:", appointmentId);
          await FirestoreService.updateAppointment(appointmentId, {
            meetingStatus: "started",
            meetingLink: meetingLink,
            meetingStartedAt: new Date().toISOString(),
          });
        } else {
          throw updateError;
        }
      }

      // Also update localStorage for immediate update
      const localAppointments = JSON.parse(
        localStorage.getItem("Appointments") || "[]"
      );
      const localIndex = localAppointments.findIndex(
        (apt) => apt.id === appointmentId || 
                (apt.doctorId === appointment.doctorId && 
                 apt.patientId === appointment.patientId && 
                 apt.date === appointment.date && 
                 apt.time === appointment.time)
      );
      if (localIndex !== -1) {
        localAppointments[localIndex].meetingStatus = "started";
        localAppointments[localIndex].meetingLink = meetingLink;
        localAppointments[localIndex].meetingStartedAt = new Date().toISOString();
        localStorage.setItem("Appointments", JSON.stringify(localAppointments));
        window.dispatchEvent(new Event("storage"));
      }

      // Create notification for patient
      const patientNotification = {
        type: "meeting",
        title: "الميتنج جاهز",
        message: `الدكتور ${appointment.doctorName} بدأ الميتنج. يمكنك الانضمام الآن.`,
        patientId: appointment.patientId,
        appointmentId: appointmentId,
        meetingLink: meetingLink,
        read: false,
      };

      // Save notification to Firebase
      await FirestoreService.addNotification(patientNotification);

      // Also save to localStorage
      const notifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
      notifications.push({
        ...patientNotification,
        id: Date.now() + Math.random(),
        date: new Date().toISOString(),
      });
      localStorage.setItem("Notifications", JSON.stringify(notifications));
      window.dispatchEvent(new CustomEvent("notificationAdded", { detail: patientNotification }));

      // Open meeting in new tab
      window.open(meetingLink, "_blank");
    } catch (err) {
      setError("حدث خطأ أثناء بدء الميتنج");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "1px solid #E0E0E0",
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <PeopleIcon sx={{ fontSize: 32, color: "#1E88E5" }} />
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#1C1C1C",
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              Live Queue Tracker
            </Typography>
            <Typography variant="body2" sx={{ color: "#757575" }}>
              متتبع الطابور المباشر
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Current Patient */}
        {queueData.inProgress && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#1C1C1C",
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PlayArrowIcon sx={{ color: "#4CAF50" }} />
              المريض الحالي
            </Typography>
            <Card
              sx={{
                backgroundColor: "#E8F5E9",
                border: "2px solid #4CAF50",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Avatar
                    src={userImage}
                    alt={queueData.inProgress.patientName}
                    sx={{ width: 56, height: 56 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      {queueData.inProgress.patientName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#757575" }}>
                      {queueData.inProgress.appointmentType === "video"
                        ? "مكالمة فيديو"
                        : "زيارة عيادة"}
                    </Typography>
                    {queueData.inProgress.reason && (
                      <Typography
                        variant="body2"
                        sx={{ color: "#757575", mt: 0.5 }}
                      >
                        السبب: {queueData.inProgress.reason}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    {/* Start Meeting Button - Only for video appointments */}
                    {queueData.inProgress.appointmentType === "video" && (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<VideocamIcon />}
                        onClick={() => handleStartMeeting(queueData.inProgress.id)}
                        disabled={isUpdating || queueData.inProgress.meetingStatus === "started"}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          px: 2.5,
                          backgroundColor: queueData.inProgress.meetingStatus === "started" 
                            ? "#4CAF50" 
                            : "#9C27B0",
                          "&:hover": {
                            backgroundColor: queueData.inProgress.meetingStatus === "started"
                              ? "#45A049"
                              : "#7B1FA2",
                          },
                        }}
                      >
                        {queueData.inProgress.meetingStatus === "started" 
                          ? "الميتنج مفتوح" 
                          : "بدء الميتنج"}
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<LocalPharmacyIcon />}
                      onClick={handlePrescribeMedication}
                      disabled={isUpdating}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2.5,
                        backgroundColor: "#1E88E5",
                        "&:hover": {
                          backgroundColor: "#1565C0",
                        },
                      }}
                    >
                      كتابة روشته
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={handleCompleteCurrent}
                      disabled={isUpdating}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                      }}
                    >
                      {isUpdating ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "إكمال"
                      )}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Queue Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 4 }}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                backgroundColor: "#F5F5F5",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1E88E5", mb: 0.5 }}
              >
                {queueData.totalWaiting}
              </Typography>
              <Typography variant="body2" sx={{ color: "#757575" }}>
                في الانتظار
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                backgroundColor: "#F5F5F5",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#4CAF50", mb: 0.5 }}
              >
                {queueData.inProgress ? 1 : 0}
              </Typography>
              <Typography variant="body2" sx={{ color: "#757575" }}>
                قيد المعالجة
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                backgroundColor: "#F5F5F5",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#757575", mb: 0.5 }}
              >
                {queueData.completed.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#757575" }}>
                مكتمل
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Start Next Button */}
        {!queueData.inProgress && queueData.waiting.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayArrowIcon />}
              onClick={handleStartNext}
              disabled={isUpdating}
              sx={{
                backgroundColor: "#1E88E5",
                color: "white",
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                "&:hover": {
                  backgroundColor: "#1565C0",
                },
              }}
            >
              {isUpdating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                `بدء المريض التالي (${queueData.waiting[0]?.patientName})`
              )}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Waiting Queue */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1C1C1C",
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <PersonIcon sx={{ color: "#1E88E5" }} />
            قائمة الانتظار ({queueData.totalWaiting})
          </Typography>

          {firebaseLoading ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#F5F5F5",
                borderRadius: 2,
              }}
            >
              <CircularProgress size={24} sx={{ mb: 1 }} />
              <Typography variant="body2" sx={{ color: "#757575" }}>
                جاري تحميل البيانات...
              </Typography>
            </Box>
          ) : queueData.waiting.length === 0 && !queueData.inProgress && queueData.completed.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#F5F5F5",
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" sx={{ color: "#757575", mb: 0.5 }}>
                لا يوجد مواعيد اليوم
              </Typography>
              <Typography variant="body2" sx={{ color: "#9E9E9E", fontSize: "0.875rem" }}>
                سيتم عرض المواعيد هنا عند وجود حجوزات لليوم
              </Typography>
            </Box>
          ) : queueData.waiting.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#F5F5F5",
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" sx={{ color: "#757575" }}>
                لا يوجد مرضى في الانتظار
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {queueData.waiting.map((patient, index) => (
                <Card
                  key={patient.id}
                  sx={{
                    border: index === 0 ? "2px solid #1E88E5" : "1px solid #E0E0E0",
                    borderRadius: 2,
                    backgroundColor: index === 0 ? "#E3F2FD" : "white",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Box
                        sx={{
                          minWidth: 40,
                          height: 40,
                          borderRadius: "50%",
                          backgroundColor:
                            index === 0 ? "#1E88E5" : "#757575",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Avatar
                        src={userImage}
                        alt={patient.patientName}
                        sx={{ width: 48, height: 48 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 0.25 }}
                        >
                          {patient.patientName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#757575" }}>
                          {patient.appointmentType === "video"
                            ? "مكالمة فيديو"
                            : "زيارة عيادة"}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 16, color: "#757575" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "#757575", fontSize: "0.8rem" }}
                          >
                            الوقت المتوقع: ~
                            {calculateEstimatedWaitTime(index + 1)} دقيقة
                          </Typography>
                        </Box>
                      </Box>
                      {index === 0 && (
                        <Chip
                          label="التالي"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Completed Appointments (Collapsed) */}
        {queueData.completed.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: "#757575", fontStyle: "italic" }}
            >
              تم إكمال {queueData.completed.length} موعد اليوم
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>

    {/* Prescription Modal */}
    <PrescriptionModal
      open={prescriptionModalOpen}
      onClose={() => setPrescriptionModalOpen(false)}
      patientData={currentPatientData}
    />
    </>
  );
};

export default LiveQueueTracker;

