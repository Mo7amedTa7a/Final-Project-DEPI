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
import VideoCallIcon from "@mui/icons-material/VideoCall";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PrescriptionIcon from "@mui/icons-material/Description";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const ServicesSection = () => {
  const theme = useTheme();

  const services = [
    {
      icon: <MedicalServicesIcon sx={{ fontSize: 40 }} />,
      title: "Specialized Medical Consultations",
      description: "Connect with the best doctors in various medical specialties for reliable and professional medical consultations.",
    },
    {
      icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
      title: "Live Video Consultations",
      description: "Get medical consultations via video from your home at any time that suits you, without the need to travel.",
    },
    {
      icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />,
      title: "Online Appointment Booking",
      description: "Book your appointments with doctors easily and manage all your appointments from one place in an organized way.",
    },
    {
      icon: <LocalPharmacyIcon sx={{ fontSize: 40 }} />,
      title: "Online Medication Orders",
      description: "Order medications from certified pharmacies and receive them in the fastest time with delivery service.",
    },
    {
      icon: <PrescriptionIcon sx={{ fontSize: 40 }} />,
      title: "Prescription Management",
      description: "Save and manage all your medical prescriptions in one place with access to them at any time.",
    },
    {
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      title: "Order Tracking",
      description: "Track the status of your medication orders from the moment of order until delivery with real-time updates.",
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        backgroundColor: "#F9FAFB",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main,
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Our Available Services
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: "700px",
              mx: "auto",
              fontSize: { xs: "1rem", sm: "1.25rem" },
              lineHeight: 1.8,
            }}
          >
            We offer a comprehensive range of medical and pharmaceutical services to meet all your health needs
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {services.map((service, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
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
                    {service.icon}
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
                    {service.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.7,
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    }}
                  >
                    {service.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ServicesSection;

