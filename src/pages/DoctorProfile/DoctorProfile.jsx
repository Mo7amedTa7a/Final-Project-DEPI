// Data
import Data from "/src/Data/Doctors.json";

// MUI Components
import Grid from '@mui/material/Grid';
import { useParams, useNavigate } from "react-router";
import {
  Box,
  Typography,
  Avatar,
  Rating,
  Button,
  Card,
  CardContent,
  useTheme,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  // Mock data
  const doctors = Data;

  // Find the doctor by ID
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          p: 4,
        }}
      >
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Avatar
                src={doctor.image}
                alt={doctor.name}
                sx={{
                  width: 200,
                  height: 200,
                  mb: 2,
                  border: `4px solid ${theme.palette.primary.light}`,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                Dr. {doctor.name}
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.secondary, mb: 2 }}
              >
                {doctor.specialty}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Rating value={doctor.rating} precision={0.1} readOnly />
                <Typography variant="h6">{doctor.rating}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
                About
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                {doctor.bio}
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
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
                    sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
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
                    sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
                  >
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {doctor.location}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default DoctorProfile;
