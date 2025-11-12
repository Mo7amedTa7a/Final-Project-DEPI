// Data
import Data from "/src/Data/Doctors.json";
// MUI Components
import { Box, Typography, Grid, Card, CardContent, Avatar, Rating, useTheme } from "@mui/material";
import { useNavigate } from "react-router";

const DoctorsSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const doctors = Data.filter(doctor => doctor.isTop);

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
          Find Top-Rated Doctors Near You
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {doctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={3} key={doctor.id}>
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
                    src={doctor.image}
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
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DoctorsSection;

