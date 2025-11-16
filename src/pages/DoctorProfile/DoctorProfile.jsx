import React, { useState } from "react";
import Data from "/src/Data/Doctors.json";
import { useParams, useNavigate } from "react-router";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ImageIcon from "@mui/icons-material/Image";

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

  const doctors = Data;
  const doctor = doctors.find((doc) => doc.id === id);

  if (!doctor) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error">
          Doctor not found
        </Typography>
      </Box>
    );
  }

  // Available time slots
  const clinics = mockClinics;

  // Set default clinic
  React.useEffect(() => {
    if (clinics.length > 0 && !selectedClinic) {
      setSelectedClinic(clinics[0].id.toString());
    }
  }, []);

  const currentClinic = clinics.find((c) => c.id.toString() === selectedClinic) || clinics[0];

  // Mock data for reviews
  const [reviews, setReviews] = useState(initialReviews);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime || !reasonForVisit.trim() || !selectedClinic) {
      alert("Please fill in all fields");
      return;
    }
    // Navigate to payment page or show success message
    alert("Appointment booked successfully!");
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
                    src={doctorImage}
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
                      {doctor.bio}
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

                    {/* Clinic Images */}
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                      Clinic Photos
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {clinicImages.map((image, index) => (
                        <Grid size={{ xs: 12, sm: 4 }} key={index}>
                          <Box
                            component="img"
                            src={image}
                            alt={`Clinic ${index + 1}`}
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
                      ))}
                    </Grid>

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

                    {/* Consultation Fee */}
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
                        Consultation Fee:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1E88E5" }}>
                        ${currentClinic.consultationFee}
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
                      {availableSlots.map((slot) => (
                        <Chip
                          key={slot}
                          label={slot}
                          onClick={() => setSelectedTime(slot)}
                          sx={{
                            cursor: "pointer",
                            backgroundColor:
                              selectedTime === slot ? "#1E88E5" : "white",
                            color: selectedTime === slot ? "white" : "#1E88E5",
                            border: "1px solid #1E88E5",
                            fontWeight: selectedTime === slot ? 600 : 400,
                            "&:hover": {
                              backgroundColor:
                                selectedTime === slot ? "#005CB2" : "#E3F2FD",
                            },
                          }}
                        />
                      ))}
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
                    #{currentClinic.queueData.nowServing}
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
                    ~ {currentClinic.queueData.estimatedWait} min
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#999",
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  Last updated: {currentClinic.queueData.lastUpdated}
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
