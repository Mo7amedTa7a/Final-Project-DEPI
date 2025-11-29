// MUI Components
import Grid from '@mui/material/Grid';
import { Box, Typography, Card, CardContent, Avatar, Rating, useTheme } from "@mui/material";
import { useNavigate } from "react-router";
import doctorImage from "../../../assets/doctor.svg";
import { useMemo } from "react";
import { useDoctors } from "../../../hooks/useData";

const DoctorsSection = ({ searchTerm, searchType, specialtyFilter, governorateFilter }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Use dynamic data hook
  const { doctors: allDoctors } = useDoctors();

  // Extract governorate from location
  const getGovernorate = (location) => {
    if (!location) return null;
    const parts = location.split(",").map((p) => p.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  };

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    // Show all registered doctors and top-rated doctors
    let doctors = allDoctors.filter(doctor => doctor.isRegistered || doctor.isTop);

    // Filter by search type
    if (searchType === "Pharmacy") {
      return [];
    }

    // Filter by search term
    if (searchTerm) {
      doctors = doctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialty
    if (specialtyFilter !== "All") {
      doctors = doctors.filter(
        (doctor) => doctor.specialty && doctor.specialty.toLowerCase() === specialtyFilter.toLowerCase()
      );
    }

    // Filter by governorate
    if (governorateFilter !== "All") {
      doctors = doctors.filter((doctor) => {
        const doctorGov = getGovernorate(doctor.location);
        return doctorGov && doctorGov.toLowerCase() === governorateFilter.toLowerCase();
      });
    }

    // Sort by rating (highest first), then by number of reviews
    const sortedDoctors = [...doctors].sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      if (ratingB !== ratingA) {
        return ratingB - ratingA; // Higher rating first
      }
      // If same rating, sort by number of reviews
      const reviewsA = Array.isArray(a.reviews) ? a.reviews.length : (a.reviewCount || 0);
      const reviewsB = Array.isArray(b.reviews) ? b.reviews.length : (b.reviewCount || 0);
      return reviewsB - reviewsA; // Higher review count first
    });

    // If showing top-rated only (no search/filters), limit to top 6
    const isShowingTopRated = !searchTerm && 
                               specialtyFilter === "All" && 
                               governorateFilter === "All" && 
                               (searchType === "All" || searchType === undefined);
    
    if (isShowingTopRated) {
      // Get top 6, but if there are ties in rating and review count, include all tied items
      if (sortedDoctors.length <= 6) {
        return sortedDoctors;
      }
      
      // Get the 6th item's rating and review count
      const sixthItem = sortedDoctors[5];
      const sixthRating = sixthItem.rating || 0;
      const sixthReviews = Array.isArray(sixthItem.reviews) ? sixthItem.reviews.length : (sixthItem.reviewCount || 0);
      
      // Include all items that have the same rating and review count as the 6th item
      const topDoctors = sortedDoctors.filter((doctor, index) => {
        if (index < 6) return true; // Always include first 6
        
        const doctorRating = doctor.rating || 0;
        const doctorReviews = Array.isArray(doctor.reviews) ? doctor.reviews.length : (doctor.reviewCount || 0);
        
        // Include if rating and review count match the 6th item
        return doctorRating === sixthRating && doctorReviews === sixthReviews;
      });
      
      return topDoctors;
    }

    return sortedDoctors;
  }, [allDoctors, searchTerm, searchType, specialtyFilter, governorateFilter]);

  const doctors = filteredDoctors;

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

  return (
    <Box
      sx={{
        py: 8,
        px: { xs: 2, sm: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Box sx={{ maxWidth: "1200px", width: "100%", mx: "auto" }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            color: theme.palette.text.primary,
            mb: 4,
            fontSize: { xs: "1.5rem", md: "2rem" },
            textAlign: "center",
          }}
        >
          {searchTerm || specialtyFilter !== "All" || governorateFilter !== "All" || searchType !== "All"
            ? "Search Results - Doctors"
            : "Find Top-Rated Doctors Near You"}
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {doctors.length > 0 ? (
            doctors.map((doctor, index) => (
            <Grid size={{ xs: 12, sm: 6 ,md:3}} key={doctor.id ? `${doctor.id}-${doctor.email || index}` : `doctor-${index}`}>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                  textAlign: "center",
                  p: 2,
                  cursor: "pointer",
                }}
                onClick={() => handleDoctorClick(doctor.id)}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    src={doctor.image || doctorImage}
                    alt={doctor.name}
                    sx={{
                      width: 100,
                      height: 100,
                      mb: 1,
                      border: `3px solid ${theme.palette.primary.light}`,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.text.primary,
                      fontSize: "1.1rem",
                    }}
                  >
                    Dr. {doctor.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.95rem",
                    }}
                  >
                    {doctor.specialty}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    <Rating
                      value={doctor.rating}
                      precision={0.1}
                      readOnly
                      size="small"
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: "#FFA500",
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        ml: 0.5,
                      }}
                    >
                      {doctor.rating}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            ))
          ) : (
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: "center",
                py: 4,
              }}
            >
              No doctors found matching your search criteria.
            </Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default DoctorsSection;

