import Data from "../../../Data/Pharmacies.json";
// components mui
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  Button,
  useTheme,
} from "@mui/material";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import { useNavigate } from "react-router";

const PharmaciesSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const pharmacies = Data.filter((pharmacy) => pharmacy.isTopRated);

  const handlePharmacyClick = (pharmacyId) => {
    navigate(`/pharmacy/${pharmacyId}`);
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
          Trusted Pharmacies in Your Area
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {pharmacies.map((pharmacy) => (
            <Grid item xs={12} sm={6} md={4} key={pharmacy.id}>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                  p: 2,
                  cursor: "pointer",
                }}
                onClick={() => handlePharmacyClick(pharmacy.id)}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  {/* Pharmacy Icon */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "12px",
                      backgroundColor: theme.palette.primary.light,
                      border: `2px solid ${theme.palette.primary.main}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <LocalPharmacyIcon
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontSize: 32,
                      }}
                    />
                  </Box>

                  {/* Pharmacy Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.text.primary,
                        mb: 0.5,
                        fontSize: "1.1rem",
                      }}
                    >
                      {pharmacy.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 1,
                        fontSize: "0.9rem",
                      }}
                    >
                      {pharmacy.location}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Rating
                          value={pharmacy.rating}
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
                          {pharmacy.rating}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            ml: 0.5,
                          }}
                        >
                          ({pharmacy.reviews} reviews)
                        </Typography>
                      </Box>
                    </Box>
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

export default PharmaciesSection;
