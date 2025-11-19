import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import userImage from "../../assets/user.svg";
import doctorImage from "../../assets/doctor.svg";
import { useAppointments } from "../../hooks/useData";
import { useDataManager } from "../../hooks/useDataManager";
import FirestoreService from "../../services/FirestoreService";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get appointments for selected patient
  const appointmentFilters = useMemo(() => {
    if (!selectedPatient?.email) return {};
    return {
      patientId: selectedPatient.email,
      status: "confirmed",
    };
  }, [selectedPatient]);

  const { appointments: firebaseAppointments } = useAppointments(appointmentFilters);
  const { data: localStorageAppointments } = useDataManager("Appointments", []);

  // Combine and filter appointments for selected patient
  const patientAppointments = useMemo(() => {
    if (!selectedPatient?.email) return [];
    
    const allAppointments = [...(firebaseAppointments || []), ...(localStorageAppointments || [])];
    
    // Filter by patient and remove duplicates
    const unique = new Map();
    allAppointments
      .filter(apt => {
        const matchesPatient = apt.patientId === selectedPatient.email || 
                              String(apt.patientId) === String(selectedPatient.email) ||
                              apt.patientId?.toLowerCase() === selectedPatient.email?.toLowerCase();
        return matchesPatient;
      })
      .forEach((apt) => {
        const key = apt.id || `${apt.doctorId}-${apt.patientId}-${apt.date}-${apt.time}`;
        if (!unique.has(key)) {
          unique.set(key, apt);
        }
      });
    
    return Array.from(unique.values())
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA; // Most recent first
      });
  }, [firebaseAppointments, localStorageAppointments, selectedPatient]);

  // Separate completed and upcoming appointments
  const completedAppointments = useMemo(() => {
    return patientAppointments.filter(apt => 
      apt.queueStatus === "completed" || 
      (apt.status === "completed" && apt.queueStatus !== "waiting" && apt.queueStatus !== "in-progress")
    );
  }, [patientAppointments]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return patientAppointments.filter(apt => {
      const aptDate = typeof apt.date === 'string' 
        ? apt.date.split('T')[0].split(' ')[0]
        : apt.date instanceof Date 
        ? apt.date.toISOString().split("T")[0]
        : String(apt.date).split('T')[0].split(' ')[0];
      
      const isUpcoming = aptDate >= today;
      const isNotCompleted = apt.queueStatus !== "completed" && 
                            !(apt.status === "completed" && apt.queueStatus !== "waiting" && apt.queueStatus !== "in-progress");
      
      return isUpcoming && isNotCompleted;
    });
  }, [patientAppointments]);

  // Load patients from Firebase, localStorage, and appointments
  useEffect(() => {
    const loadPatients = async () => {
      try {
        // Get users from Firebase
        const firebaseUsers = await FirestoreService.get("users", {
          where: [{ field: "role", operator: "==", value: "Patient" }],
        });

        // Get users from localStorage
        const localUsers = JSON.parse(localStorage.getItem("Users") || "[]");

        // Get appointments to extract patient information
        const allAppointments = [...(firebaseAppointments || []), ...(localStorageAppointments || [])];
        
        // Extract unique patients from appointments
        const patientsFromAppointments = new Map();
        allAppointments.forEach(apt => {
          if (apt.patientId && apt.patientName) {
            if (!patientsFromAppointments.has(apt.patientId)) {
              patientsFromAppointments.set(apt.patientId, {
                id: apt.patientId,
                email: apt.patientId,
                name: apt.patientName,
                role: "Patient",
                patientProfile: {
                  fullName: apt.patientName,
                  email: apt.patientId,
                }
              });
            }
          }
        });

        // Combine all users
        const allUsers = [...firebaseUsers];
        const userEmails = new Set(firebaseUsers.map(u => u.email || u.id));
        
        // Add local users
        localUsers.forEach(localUser => {
          if (!userEmails.has(localUser.email || localUser.id)) {
            allUsers.push(localUser);
            userEmails.add(localUser.email || localUser.id);
          }
        });

        // Add patients from appointments (if not already in users list)
        patientsFromAppointments.forEach((patientFromApt, patientId) => {
          if (!userEmails.has(patientId)) {
            allUsers.push(patientFromApt);
            userEmails.add(patientId);
          }
        });

        // Filter and map patients
        const patientsList = allUsers
          .filter((user) => {
            const isPatient = user.role === "Patient";
            const hasProfile = user.patientProfile || (user.email && (user.name || user.patientProfile?.fullName));
            return isPatient && hasProfile;
          })
          .map((user) => ({
            id: user.email || user.id,
            name: user.patientProfile?.fullName || user.name || "Unknown Patient",
            email: user.email || user.patientProfile?.email || "",
            phone: user.patientProfile?.phoneNumber || "",
            age: user.patientProfile?.age || "N/A",
            gender: user.patientProfile?.gender || "Not specified",
            bloodType: user.patientProfile?.bloodType || "Not specified",
            allergies: user.patientProfile?.allergies || user.patientProfile?.chronicConditions || [],
            medications: user.patientProfile?.medications || "None",
            address: user.patientProfile?.address || "Not provided",
            dob: user.patientProfile?.dob || "Not provided",
            avatar: user.patientProfile?.profilePicture || userImage,
            emergencyContact: user.patientProfile?.emergencyContact || "Not provided",
          }));

        setPatients(patientsList);
        if (patientsList.length > 0 && !selectedPatient) {
          setSelectedPatient(patientsList[0]);
        }
      } catch (error) {
        // Fallback to localStorage and appointments if Firebase fails
        const users = JSON.parse(localStorage.getItem("Users") || "[]");
        const allAppointments = [...(firebaseAppointments || []), ...(localStorageAppointments || [])];
        
        // Extract patients from appointments
        const patientsFromAppointments = new Map();
        allAppointments.forEach(apt => {
          if (apt.patientId && apt.patientName) {
            if (!patientsFromAppointments.has(apt.patientId)) {
              patientsFromAppointments.set(apt.patientId, {
                id: apt.patientId,
                email: apt.patientId,
                name: apt.patientName,
                role: "Patient",
                patientProfile: {
                  fullName: apt.patientName,
                  email: apt.patientId,
                }
              });
            }
          }
        });

        const allUsers = [...users];
        const userEmails = new Set(users.map(u => u.email || u.id));
        
        patientsFromAppointments.forEach((patientFromApt, patientId) => {
          if (!userEmails.has(patientId)) {
            allUsers.push(patientFromApt);
            userEmails.add(patientId);
          }
        });

        const patientsList = allUsers
          .filter((user) => user.role === "Patient" && (user.patientProfile || user.email))
          .map((user) => ({
            id: user.email || user.id,
            name: user.patientProfile?.fullName || user.name || "Unknown Patient",
            email: user.email || user.patientProfile?.email || "",
            phone: user.patientProfile?.phoneNumber || "",
            age: user.patientProfile?.age || "N/A",
            gender: user.patientProfile?.gender || "Not specified",
            bloodType: user.patientProfile?.bloodType || "Not specified",
            allergies: user.patientProfile?.allergies || user.patientProfile?.chronicConditions || [],
            medications: user.patientProfile?.medications || "None",
            address: user.patientProfile?.address || "Not provided",
            dob: user.patientProfile?.dob || "Not provided",
            avatar: user.patientProfile?.profilePicture || userImage,
            emergencyContact: user.patientProfile?.emergencyContact || "Not provided",
          }));

        setPatients(patientsList);
        if (patientsList.length > 0 && !selectedPatient) {
          setSelectedPatient(patientsList[0]);
        }
      }
    };

    loadPatients();
  }, [selectedPatient, firebaseAppointments, localStorageAppointments]);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const InfoField = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          color: "#757575",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          display: "block",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#1C1C1C",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        {value || "N/A"}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        display: "flex",
      }}
    >
      {/* Sidebar - Patients List */}
      <Box
        sx={{
          width: { xs: "100%", md: 350 },
          backgroundColor: "white",
          borderRight: "1px solid #E0E0E0",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ p: 3, borderBottom: "1px solid #E0E0E0" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 2,
              fontSize: "1.25rem",
            }}
          >
            All Patients
          </Typography>
          <TextField
            fullWidth
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#757575" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Patients List */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {filteredPatients.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#757575" }}>
                {searchTerm ? "No patients found" : "No patients available"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredPatients.map((patient, index) => (
                <React.Fragment key={patient.id}>
                  <ListItem
                    onClick={() => handlePatientSelect(patient)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedPatient?.id === patient.id ? "#E3F2FD" : "transparent",
                      "&:hover": {
                        backgroundColor:
                          selectedPatient?.id === patient.id ? "#BBDEFB" : "#F5F5F5",
                      },
                      py: 2,
                      px: 3,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={patient.avatar}
                        alt={patient.name}
                        sx={{
                          width: 48,
                          height: 48,
                          border: selectedPatient?.id === patient.id ? "2px solid #1E88E5" : "none",
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: selectedPatient?.id === patient.id ? 700 : 600,
                            color: "#1C1C1C",
                            fontSize: "0.95rem",
                          }}
                        >
                          {patient.name}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#757575",
                            fontSize: "0.8rem",
                          }}
                        >
                          {patient.email || "No email"}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < filteredPatients.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Main Content - Patient Details */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {selectedPatient ? (
          <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
            {/* Patient Header */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #E0E0E0",
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Avatar
                    src={selectedPatient.avatar}
                    alt={selectedPatient.name}
                    sx={{
                      width: 100,
                      height: 100,
                      border: "4px solid #E3F2FD",
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#1C1C1C",
                        mb: 1,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                      }}
                    >
                      {selectedPatient.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#757575", mb: 2 }}>
                      {selectedPatient.gender}, Age {selectedPatient.age} • Blood Type: {selectedPatient.bloodType}
                    </Typography>
                    {selectedPatient.allergies &&
                      (Array.isArray(selectedPatient.allergies)
                        ? selectedPatient.allergies.length > 0
                        : selectedPatient.allergies !== "None") && (
                        <Chip
                          icon={<Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: "#F44336" }} />}
                          label={`Allergy: ${
                            Array.isArray(selectedPatient.allergies)
                              ? selectedPatient.allergies.join(", ")
                              : selectedPatient.allergies
                          }`}
                          sx={{
                            backgroundColor: "#FFEBEE",
                            color: "#C62828",
                            fontWeight: 600,
                            border: "1px solid #EF5350",
                          }}
                        />
                      )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #E0E0E0",
                    mb: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1C1C1C",
                        mb: 3,
                        fontSize: "1.1rem",
                      }}
                    >
                      Personal Information
                    </Typography>
                    <InfoField label="Email" value={selectedPatient.email} />
                    <InfoField label="Phone" value={selectedPatient.phone} />
                    <InfoField label="Date of Birth" value={selectedPatient.dob} />
                    <InfoField label="Address" value={selectedPatient.address} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Medical Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #E0E0E0",
                    mb: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1C1C1C",
                        mb: 3,
                        fontSize: "1.1rem",
                      }}
                    >
                      Medical Information
                    </Typography>
                    <InfoField label="Blood Type" value={selectedPatient.bloodType} />
                    <InfoField
                      label="Allergies"
                      value={
                        selectedPatient.allergies
                          ? Array.isArray(selectedPatient.allergies)
                            ? selectedPatient.allergies.join(", ")
                            : selectedPatient.allergies
                          : "None"
                      }
                    />
                    <InfoField label="Current Medications" value={selectedPatient.medications} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Emergency Contact */}
              <Grid size={{ xs: 12 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #E0E0E0",
                    mb: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1C1C1C",
                        mb: 3,
                        fontSize: "1.1rem",
                      }}
                    >
                      Emergency Contact
                    </Typography>
                    <InfoField label="Contact Person" value={selectedPatient.emergencyContact} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Appointments Section */}
              <Grid size={{ xs: 12 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1C1C1C",
                        mb: 3,
                        fontSize: "1.1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CalendarTodayIcon sx={{ color: "#1E88E5" }} />
                      Appointments History
                    </Typography>

                    {/* Upcoming Appointments */}
                    {upcomingAppointments.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: "#1C1C1C",
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <ScheduleIcon sx={{ fontSize: 20, color: "#1E88E5" }} />
                          Upcoming Appointments ({upcomingAppointments.length})
                        </Typography>
                        <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #E0E0E0", borderRadius: 2 }}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Doctor</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {upcomingAppointments.map((apt) => (
                                <TableRow key={apt.id || `${apt.doctorId}-${apt.date}-${apt.time}`}>
                                  <TableCell>{apt.date}</TableCell>
                                  <TableCell>{apt.time}</TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Avatar
                                        src={apt.doctorAvatar || doctorImage}
                                        alt={apt.doctorName}
                                        sx={{ width: 32, height: 32 }}
                                      />
                                      <Typography variant="body2">{apt.doctorName}</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={apt.appointmentType === "video" ? "Video Call" : "On-site"}
                                      size="small"
                                      sx={{ fontSize: "0.75rem" }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={
                                        apt.queueStatus === "in-progress"
                                          ? "In Progress"
                                          : apt.queueStatus === "waiting"
                                          ? "Waiting"
                                          : "Scheduled"
                                      }
                                      size="small"
                                      color={
                                        apt.queueStatus === "in-progress"
                                          ? "success"
                                          : apt.queueStatus === "waiting"
                                          ? "warning"
                                          : "info"
                                      }
                                      sx={{ fontSize: "0.75rem" }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                    {/* Completed Appointments */}
                    {completedAppointments.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: "#1C1C1C",
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 20, color: "#4CAF50" }} />
                          Completed Appointments ({completedAppointments.length})
                        </Typography>
                        <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #E0E0E0", borderRadius: 2 }}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Doctor</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {completedAppointments.map((apt) => (
                                <TableRow key={apt.id || `${apt.doctorId}-${apt.date}-${apt.time}`}>
                                  <TableCell>{apt.date}</TableCell>
                                  <TableCell>{apt.time}</TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Avatar
                                        src={apt.doctorAvatar || doctorImage}
                                        alt={apt.doctorName}
                                        sx={{ width: 32, height: 32 }}
                                      />
                                      <Typography variant="body2">{apt.doctorName}</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={apt.appointmentType === "video" ? "Video Call" : "On-site"}
                                      size="small"
                                      sx={{ fontSize: "0.75rem" }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label="Completed"
                                      size="small"
                                      color="success"
                                      icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                      sx={{ fontSize: "0.75rem" }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                    {upcomingAppointments.length === 0 && completedAppointments.length === 0 && (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <CalendarTodayIcon sx={{ fontSize: 48, color: "#E0E0E0", mb: 2 }} />
                        <Typography variant="body1" sx={{ color: "#757575" }}>
                          No appointments found
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <PersonIcon sx={{ fontSize: 80, color: "#E0E0E0" }} />
            <Typography variant="h6" sx={{ color: "#757575" }}>
              Select a patient to view details
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Patients;

