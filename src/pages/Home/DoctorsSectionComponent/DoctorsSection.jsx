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

    return doctors;
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

