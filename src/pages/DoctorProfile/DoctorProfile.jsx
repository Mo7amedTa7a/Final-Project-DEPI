import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useDoctors, useAppointments } from "../../hooks/useData";
import FirestoreService from "../../services/FirestoreService";
import {
  availableSlots,
  mockClinics,
  clinicImages,
  symptoms,
  services,
  initialReviews,
} from "../../Data/DoctorProfileData";
import doctorImage from "../../assets/doctor.svg";
import {
  Box,
  Typography,
  Avatar,
  Rating,
  Button,
  Card,
  CardContent,
  Grid,
  Container,
  Tabs,
  Tab,
  TextField,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeTab, setActiveTab] = useState(2); // Book Appointment tab is active by default
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [successToast, setSuccessToast] = useState(false);
  const [appointmentType, setAppointmentType] = useState("video"); // "video" or "onsite"
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [doctor, setDoctor] = useState(null);
  // Mock data for reviews - must be before any conditional returns
  const [reviews, setReviews] = useState(initialReviews);

  // Use dynamic data hook
  const { doctors, getDoctorById } = useDoctors();
  
  // Get doctor's email for appointment filtering
  const doctorEmail = useMemo(() => {
    return doctorProfile?.email || doctor?.email || id;
  }, [doctorProfile, doctor, id]);
  
  // Get existing appointments for this doctor to check for booked slots
  const appointmentFilters = useMemo(() => {
    if (!doctorEmail) return {};
    return {
      doctorId: doctorEmail,
      status: "confirmed",
    };
  }, [doctorEmail]);
  
  const { appointments: existingAppointments } = useAppointments(appointmentFilters);
  
  // Get booked time slots for selected date
  const bookedSlots = useMemo(() => {
    if (!selectedDate || !existingAppointments || existingAppointments.length === 0) {
      return [];
    }
    
    return existingAppointments
      .filter(apt => {
        const aptDate = apt.date;
        if (!aptDate) return false;
        
        // Handle different date formats
        if (typeof aptDate === 'string') {
          const dateOnly = aptDate.split('T')[0].split(' ')[0];
          return dateOnly === selectedDate;
        }
        
        if (aptDate instanceof Date) {
          return aptDate.toISOString().split("T")[0] === selectedDate;
        }
        
        return String(aptDate) === selectedDate;
      })
      .filter(apt => {
        // Exclude cancelled or completed appointments
        return apt.status !== "cancelled" && apt.queueStatus !== "completed";
      })
      .map(apt => apt.time)
      .filter(Boolean); // Remove empty values
  }, [selectedDate, existingAppointments]);

  // Load doctor data
  useEffect(() => {
    const loadDoctorData = async () => {
      const foundDoctor = await getDoctorById(id);
      if (foundDoctor) {
        setDoctor(foundDoctor);
        
        // Create doctorProfile from foundDoctor data
        // Ensure all fields have proper values (no undefined)
        const profile = {
          fullName: foundDoctor.name || "",
          specialty: foundDoctor.specialty || "",
          bio: foundDoctor.bio || "",
          address: foundDoctor.location || foundDoctor.address || "",
          profilePicture: foundDoctor.image || doctorImage,
          videoCallPrice: foundDoctor.videoCallPrice || "",
          onsitePrice: foundDoctor.onsitePrice || "",
          consultationFee: foundDoctor.consultationFee || "",
          phoneNumber: foundDoctor.phoneNumber || "",
          email: foundDoctor.email || "",
          education: foundDoctor.education || "",
          clinicImages: foundDoctor.clinicImages || [],
          clinics: foundDoctor.clinics || [],
        };
        setDoctorProfile(profile);
      }
    };
    
    loadDoctorData();
  }, [id, doctors, getDoctorById]);

  // Available clinics - use doctorProfile clinics if available, otherwise use mockClinics
  // Main clinic (from address) should always appear first
  const clinics = React.useMemo(() => {
    const mainClinic = doctorProfile && doctorProfile.address ? {
      id: "main-clinic",
      name: "Main Clinic",
      address: doctorProfile.address,
      consultationFee: doctorProfile.onsitePrice || doctorProfile.consultationFee || 150,
      queueData: {
        nowServing: 0,
        estimatedWait: 0,
        lastUpdated: new Date().toLocaleTimeString(),
      },
      isMain: true,
    } : null;

    // Check if doctorProfile exists and has clinics array with data
    if (doctorProfile && Array.isArray(doctorProfile.clinics) && doctorProfile.clinics.length > 0) {
      // Convert doctorProfile clinics to the format expected by the UI
      const convertedClinics = doctorProfile.clinics.map((clinic, index) => ({
        id: clinic.id || index + 1,
        name: clinic.name || `Clinic ${index + 1}`,
        address: clinic.address || "Address not specified",
        consultationFee: clinic.consultationFee || doctorProfile.consultationFee || doctorProfile.onsitePrice || 150,
        // Add default queueData if not present
        queueData: clinic.queueData || {
          nowServing: 0,
          estimatedWait: 0,
          lastUpdated: new Date().toLocaleTimeString(),
        },
        images: clinic.images || [],
        isMain: false,
      }));
      
      // Always put main clinic first, then additional clinics
      if (mainClinic) {
        return [mainClinic, ...convertedClinics];
      }
      
      return convertedClinics;
    }
    
    // If doctorProfile exists but no clinics, return main clinic only
    if (mainClinic) {
      return [mainClinic];
    }
    
    return mockClinics;
  }, [doctorProfile]);

  // Reset selectedClinic when clinics change
  React.useEffect(() => {
    if (clinics.length > 0) {
      // Check if current selectedClinic exists in clinics
      const clinicExists = clinics.some((c) => c.id.toString() === selectedClinic);
      if (!selectedClinic || !clinicExists) {
        // Always set to first clinic if no selection or selection doesn't exist
        const firstClinicId = clinics[0].id.toString();
        setSelectedClinic(firstClinicId);
      }
    }
  }, [clinics]); // Only depend on clinics

  const currentClinic = clinics.find((c) => c.id.toString() === selectedClinic) || clinics[0];

  // Get images for the currently selected clinic
  const currentClinicImages = React.useMemo(() => {
    if (!currentClinic || !doctorProfile) return [];
    
    // If Main Clinic is selected, show general clinicImages
    if (currentClinic.id === "main-clinic" || currentClinic.isMain) {
      if (doctorProfile.clinicImages && Array.isArray(doctorProfile.clinicImages) && doctorProfile.clinicImages.length > 0) {
        return doctorProfile.clinicImages;
      }
    } else {
      // If a branch clinic is selected, show that clinic's images
      if (currentClinic.images && Array.isArray(currentClinic.images) && currentClinic.images.length > 0) {
        return currentClinic.images;
      } else if (currentClinic.image && typeof currentClinic.image === 'string' && currentClinic.image.trim() !== '') {
        return [currentClinic.image];
      }
    }
    
    return [];
  }, [currentClinic, doctorProfile]);

  // Show loading or not found - must be after all hooks
  if (!doctor) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error">
          Doctor not found
        </Typography>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBookAppointment = async () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    if (!currentUser || !currentUser.email) {
      alert("Please login first to book an appointment");
      navigate("/login");
      return;
    }

    if (!selectedDate || !selectedTime || !reasonForVisit.trim() || !appointmentType) {
      alert("Please fill in all fields");
      return;
    }
    
    // Check if the selected time slot is already booked
    if (bookedSlots.includes(selectedTime)) {
      alert("هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.");
      return;
    }
    
    // Double check with Firebase before proceeding
    try {
      const existingAppointments = await FirestoreService.getAppointments({
        doctorId: doctorEmail,
        status: "confirmed",
      });
      
      const localAppointments = JSON.parse(localStorage.getItem("Appointments") || "[]");
      const allAppointments = [...existingAppointments, ...localAppointments];
      
      const isDuplicate = allAppointments.some(apt => {
        const sameDoctor = apt.doctorId === doctorEmail || 
                         String(apt.doctorId) === String(doctorEmail) ||
                         apt.doctorId?.toLowerCase() === doctorEmail?.toLowerCase();
        const aptDate = apt.date;
        let sameDate = false;
        
        if (typeof aptDate === 'string') {
          const dateOnly = aptDate.split('T')[0].split(' ')[0];
          sameDate = dateOnly === selectedDate;
        } else if (aptDate instanceof Date) {
          sameDate = aptDate.toISOString().split("T")[0] === selectedDate;
        } else {
          sameDate = String(aptDate) === selectedDate;
        }
        
        const sameTime = apt.time === selectedTime;
        const isActive = apt.status !== "cancelled" && apt.queueStatus !== "completed";
        
        return sameDoctor && sameDate && sameTime && isActive;
      });
      
      if (isDuplicate) {
        alert("هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.");
        return;
      }
    } catch (error) {
      // If check fails, still allow booking (better to allow than block)
    }
    
    // Save appointment data to sessionStorage and navigate to checkout
    const price = appointmentType === "video" 
      ? (doctorProfile?.videoCallPrice || currentClinic?.consultationFee || 100)
      : (doctorProfile?.onsitePrice || currentClinic?.consultationFee || 150);
    
    const appointmentData = {
      doctorId: doctorProfile?.email || doctor.email || id, // Use email as primary ID, fallback to id
      doctorName: doctorProfile?.fullName || doctor.name,
      doctorSpecialty: doctorProfile?.specialty || doctor.specialty,
      doctorAvatar: doctorProfile?.profilePicture || doctor.image || doctorImage,
      appointmentType,
      date: selectedDate,
      time: selectedTime,
      reason: reasonForVisit,
      price,
    };
    
    sessionStorage.setItem("pendingAppointment", JSON.stringify(appointmentData));
    navigate("/checkout?type=appointment");
  };

  // Get current price based on appointment type
  const getCurrentPrice = () => {
    if (appointmentType === "video") {
      return doctorProfile?.videoCallPrice || currentClinic?.consultationFee || 100;
    } else {
      return doctorProfile?.onsitePrice || currentClinic?.consultationFee || 150;
    }
  };

  const handleAddReview = () => {
    if (reviewRating === 0 || !reviewComment.trim()) {
      alert("Please provide a rating and comment");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    const newReview = {
      id: reviews.length + 1,
      patientName: currentUser.name || "Anonymous",
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split("T")[0],
    };

    setReviews([newReview, ...reviews]);
    setReviewRating(0);
    setReviewComment("");
    setSuccessToast(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl" sx={{ mx: "auto" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, textTransform: "none" }}
        >
          Back
        </Button>

        <Grid container spacing={3}>
          {/* Left Panel - Doctor's Profile */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                p: 3,
                position: { md: "sticky" },
                top: { md: 100 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Box sx={{ position: "relative", mb: 2 }}>
                  <Avatar
                    src={doctorProfile?.profilePicture || doctor.image || doctorImage}
                    alt={doctor.name}
                    sx={{
                      width: { xs: 120, sm: 150, md: 180 },
                      height: { xs: 120, sm: 150, md: 180 },
                      border: "4px solid #E3F2FD",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      width: 16,
                      height: 16,
                      backgroundColor: "#4CAF50",
                      borderRadius: "50%",
                      border: "2px solid white",
                    }}
                  />
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 0.5,
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  Dr. {doctor.name}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "#555555",
                    mb: 1.5,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  {doctor.specialty}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#555555",
                    mb: 2,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {doctor.experience} of Experience
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    justifyContent: "center",
                  }}
                >
                  <Rating value={doctor.rating} precision={0.1} readOnly size="small" />
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {doctor.rating}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#555555",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    [256 reviews]
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={() => setIsFavorite(!isFavorite)}
                  fullWidth
                  sx={{
                    textTransform: "none",
                    borderColor: "#1E88E5",
                    color: "#1E88E5",
                    "&:hover": {
                      borderColor: "#005CB2",
                      backgroundColor: "#E3F2FD",
                    },
                  }}
                >
                  Add to Favorites
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Middle Panel - Appointment Booking */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    mb: 3,
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Tab label="Details" sx={{ textTransform: "none" }} />
                  <Tab label="Reviews" sx={{ textTransform: "none" }} />
                  <Tab label="Book Appointment" sx={{ textTransform: "none" }} />
                </Tabs>

                {activeTab === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                      About
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                      {doctorProfile?.bio || doctor.bio || "No bio available."}
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#555555", mb: 0.5 }}
                        >
                          Experience
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doctor.experience}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#555555", mb: 0.5 }}
                        >
                          Education
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doctor.education}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#555555", mb: 0.5 }}
                        >
                          Location
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doctor.location}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Clinic Images - Show images based on selected clinic */}
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                      {currentClinic?.name || "Clinic"} Photos
                    </Typography>
                    {currentClinicImages.length > 0 ? (
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {currentClinicImages.map((image, index) => {
                          if (!image || typeof image !== 'string' || image.trim() === '') return null;
                          return (
                            <Grid size={{ xs: 12, sm: 4 }} key={`clinic-${currentClinic?.id || 'clinic'}-img-${index}`}>
                              <Box
                                component="img"
                                src={image}
                                alt={`${currentClinic?.name || "Clinic"} Photo ${index + 1}`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                                sx={{
                                  width: "100%",
                                  height: 200,
                                  objectFit: "cover",
                                  borderRadius: 2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    opacity: 0.8,
                                  },
                                }}
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: "italic" }}>
                        No photos available for {currentClinic?.name || "this clinic"}.
                      </Typography>
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* Symptoms/Conditions Treated */}
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                      Conditions Treated
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        mb: 3,
                      }}
                    >
                      {symptoms.map((symptom) => (
                        <Chip
                          key={symptom}
                          label={symptom}
                          sx={{
                            backgroundColor: "#E3F2FD",
                            color: "#1E88E5",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Services */}
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                      Services Offered
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      {services.map((service) => (
                        <Chip
                          key={service}
                          label={service}
                          sx={{
                            backgroundColor: "#F5F5F5",
                            color: "#1C1C1C",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
                      Reviews ({reviews.length})
                    </Typography>

                    {/* Add Review Section */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 3,
                        backgroundColor: "#F9FAFB",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Add Your Review
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: "#555555" }}>
                          Rating
                        </Typography>
                        <Rating
                          value={reviewRating}
                          onChange={(event, newValue) => {
                            setReviewRating(newValue);
                          }}
                          size="large"
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Write your review..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddReview}
                        sx={{
                          backgroundColor: "#1E88E5",
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: "#005CB2",
                          },
                        }}
                      >
                        Submit Review
                      </Button>
                    </Paper>

                    <Divider sx={{ my: 3 }} />

                    {/* Reviews List */}
                    <Box>
                      {reviews.map((review) => (
                        <Box key={review.id} sx={{ mb: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {review.patientName}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                <Rating value={review.rating} readOnly size="small" />
                                <Typography variant="caption" color="text.secondary">
                                  {review.date}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ color: "#555555", lineHeight: 1.6 }}>
                            {review.comment}
                          </Typography>
                          {review.id !== reviews[reviews.length - 1]?.id && (
                            <Divider sx={{ mt: 2 }} />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", mb: 3, fontSize: { xs: "1rem", sm: "1.25rem" } }}
                    >
                      Select a Date & Time
                    </Typography>

                    {/* Clinic Selection */}
                    {clinics.length > 1 && (
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Select Clinic</InputLabel>
                        <Select
                          value={selectedClinic}
                          onChange={(e) => setSelectedClinic(e.target.value)}
                          label="Select Clinic"
                        >
                          {clinics.map((clinic) => (
                            <MenuItem key={clinic.id} value={clinic.id.toString()}>
                              {clinic.name} - {clinic.address}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {/* Appointment Type Selection */}
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Appointment Type
                    </Typography>
                    <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                      <RadioGroup
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        row
                        sx={{
                          display: "flex",
                          gap: { xs: 1, sm: 2 },
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <FormControlLabel
                          value="video"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <VideocamIcon sx={{ fontSize: 20 }} />
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  Video Call
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ${doctorProfile?.videoCallPrice || currentClinic?.consultationFee || 100}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{
                            border: appointmentType === "video" ? "2px solid #1E88E5" : "2px solid #E0E0E0",
                            borderRadius: 2,
                            px: 2,
                            py: 1.5,
                            flex: 1,
                            "&:hover": {
                              borderColor: "#1E88E5",
                            },
                          }}
                        />
                        <FormControlLabel
                          value="onsite"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <LocalHospitalIcon sx={{ fontSize: 20 }} />
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  On-site Visit
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ${doctorProfile?.onsitePrice || currentClinic?.consultationFee || 150}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{
                            border: appointmentType === "onsite" ? "2px solid #1E88E5" : "2px solid #E0E0E0",
                            borderRadius: 2,
                            px: 2,
                            py: 1.5,
                            flex: 1,
                            "&:hover": {
                              borderColor: "#1E88E5",
                            },
                          }}
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Price Display */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 3,
                        backgroundColor: "#E3F2FD",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <AttachMoneyIcon sx={{ color: "#1E88E5" }} />
                      <Typography variant="body2" sx={{ color: "#555555" }}>
                        {appointmentType === "video" ? "Video Call" : "On-site Visit"} Price:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1E88E5" }}>
                        ${getCurrentPrice()}
                      </Typography>
                    </Paper>

                    <TextField
                      fullWidth
                      type="date"
                      label="Select Date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon sx={{ color: "#1E88E5" }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Available Slots for{" "}
                      {selectedDate
                        ? new Date(selectedDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Select a date"}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                        mb: 3,
                      }}
                    >
                      {availableSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <Chip
                            key={slot}
                            label={isBooked ? `${slot} (محجوز)` : slot}
                            onClick={() => {
                              if (!isBooked) {
                                setSelectedTime(slot);
                              }
                            }}
                            disabled={isBooked}
                            sx={{
                              cursor: isBooked ? "not-allowed" : "pointer",
                              backgroundColor: isBooked
                                ? "#F5F5F5"
                                : selectedTime === slot
                                ? "#1E88E5"
                                : "white",
                              color: isBooked
                                ? "#9E9E9E"
                                : selectedTime === slot
                                ? "white"
                                : "#1E88E5",
                              border: isBooked
                                ? "1px solid #E0E0E0"
                                : "1px solid #1E88E5",
                              fontWeight: selectedTime === slot ? 600 : 400,
                              opacity: isBooked ? 0.6 : 1,
                              "&:hover": {
                                backgroundColor: isBooked
                                  ? "#F5F5F5"
                                  : selectedTime === slot
                                  ? "#005CB2"
                                  : "#E3F2FD",
                              },
                            }}
                          />
                        );
                      })}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Reason for Visit
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Briefly describe your medical issue..."
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      sx={{ mb: 3 }}
                    />

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleBookAppointment}
                      sx={{
                        backgroundColor: "#1E88E5",
                        color: "white",
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        "&:hover": {
                          backgroundColor: "#005CB2",
                        },
                      }}
                    >
                      Book & Proceed to Payment
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel - Clinic Info & Live Queue */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                mb: 2,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  {currentClinic.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                  <LocationOnIcon sx={{ color: "#1E88E5", mt: 0.5 }} />
                  <Typography variant="body2" sx={{ color: "#555555" }}>
                    {currentClinic.address}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 150,
                    backgroundColor: "#E0E0E0",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  Map Preview
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  Live Queue Status
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#555555", mb: 1, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Now Serving
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      color: "#1E88E5",
                      fontSize: { xs: "1.75rem", sm: "2rem" },
                    }}
                  >
                    #{currentClinic?.queueData?.nowServing || 0}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#555555", mb: 1, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Your Turn (Est.)
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "#1C1C1C",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    ~ {currentClinic?.queueData?.estimatedWait || 0} min
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#999",
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  Last updated: {currentClinic?.queueData?.lastUpdated || new Date().toLocaleTimeString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={successToast}
        autoHideDuration={2000}
        onClose={() => setSuccessToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessToast(false)} severity="success" sx={{ width: "100%" }}>
          Review added successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorProfile;
