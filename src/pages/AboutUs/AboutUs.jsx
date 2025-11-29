import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  Avatar,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PeopleIcon from "@mui/icons-material/People";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";

const AboutUs = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <MedicalServicesIcon sx={{ fontSize: 40 }} />,
      title: "Specialized Medical Consultations",
      description: "Connect with the best doctors in various medical specialties for reliable and professional medical consultations.",
    },
    {
      icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
      title: "Live Video Consultations",
      description: "Get medical consultations via video from your home at any time that suits you.",
    },
    {
      icon: <LocalPharmacyIcon sx={{ fontSize: 40 }} />,
      title: "Online Medication Orders",
      description: "Order medications from certified pharmacies and receive them in the fastest time.",
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Appointment Management",
      description: "Book your appointments with doctors easily and manage all your appointments from one place.",
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      title: "Available 24/7",
      description: "Our services are available around the clock to meet your needs at any time.",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Secure & Reliable",
      description: "We ensure the protection of your personal and medical data with the highest security standards.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        py: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 4, sm: 6, md: 8 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main,
              mb: 2,
              fontSize: { xs: "2rem", sm: "3rem", md: "3.5rem" },
            }}
          >
            About Us
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: "800px",
              mx: "auto",
              fontSize: { xs: "1rem", sm: "1.25rem" },
              lineHeight: 1.8,
            }}
          >
            CureTap is an integrated medical platform that aims to facilitate access to medical and pharmaceutical services
            in Egypt. We connect patients, doctors, and pharmacies to provide a comprehensive and convenient health experience.
          </Typography>
        </Box>

        {/* Mission Section */}
        <Card
          sx={{
            mb: { xs: 4, sm: 6 },
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: theme.palette.primary.main,
                mb: 3,
                textAlign: "center",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              Our Vision & Mission
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.light + "15",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Our Vision
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.8,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    To be the leading platform in medical and pharmaceutical services in Egypt,
                    and provide an integrated and easily accessible health experience for all citizens.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: theme.palette.secondary.light + "15",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mb: 2,
                      color: theme.palette.secondary.main,
                    }}
                  >
                    Our Mission
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.8,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    To facilitate access to medical and pharmaceutical services by providing a unified
                    platform that connects patients, doctors, and pharmacies, while ensuring quality and reliability
                    at every step.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main,
              mb: 4,
              textAlign: "center",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Our Features
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        mb: 2,
                        backgroundColor: theme.palette.primary.main,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        mb: 1.5,
                        color: "text.primary",
                        fontSize: { xs: "1rem", sm: "1.125rem" },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.7,
                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Values Section */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.main}05 100%)`,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: theme.palette.primary.main,
                mb: 4,
                textAlign: "center",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              Our Values
            </Typography>
            <Grid container spacing={3}>
              {[
                "Quality: We are committed to the highest quality standards in all our services",
                "Transparency: We believe in full transparency in all our dealings",
                "Innovation: We constantly strive to develop and improve our services",
                "Care: The health and well-being of our clients is our top priority",
              ].map((value, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "white",
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.primary",
                        fontWeight: 500,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AboutUs;

