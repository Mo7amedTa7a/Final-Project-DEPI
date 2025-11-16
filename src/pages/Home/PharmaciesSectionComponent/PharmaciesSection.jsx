import Data from "../../../Data/Pharmacies.json";
// components mui
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  useTheme,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import { useNavigate } from "react-router";
import { useMemo, useEffect } from "react";

const PharmaciesSection = ({ searchTerm, searchType, governorateFilter }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Extract governorate from location
  const getGovernorate = (location) => {
    if (!location) return null;
    const parts = location.split(",").map((p) => p.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  };

  // Load registered pharmacies
  useEffect(() => {
    // This will be handled by the parent component if needed
  }, []);

  // Filter pharmacies
  const filteredPharmacies = useMemo(() => {
    // Load registered pharmacies from localStorage
    const users = JSON.parse(localStorage.getItem("Users") || "[]");
    const registeredPharmacies = users
      .filter((user) => user.role === "Pharmacy" && user.pharmacyProfile)
      .map((user) => ({
        id: user.email,
        name: user.pharmacyProfile.pharmacyName,
        location: user.pharmacyProfile.location,
        rating: 4.5,
        reviews: 0,
        isTopRated: true,
        isRegistered: true,
      }));

    let pharmacies = [...registeredPharmacies, ...Data].filter((pharmacy) => pharmacy.isTopRated);

    // Filter by search type
    if (searchType === "Doctor") {
      return [];
    }

    // Filter by search term
    if (searchTerm) {
      pharmacies = pharmacies.filter(
        (pharmacy) =>
          pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pharmacy.location && pharmacy.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by governorate
    if (governorateFilter !== "All") {
      pharmacies = pharmacies.filter((pharmacy) => {
        const pharmacyGov = getGovernorate(pharmacy.location);
        return pharmacyGov && pharmacyGov.toLowerCase() === governorateFilter.toLowerCase();
      });
    }

    return pharmacies;
  }, [searchTerm, searchType, governorateFilter]);

  const pharmacies = filteredPharmacies;

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
          {searchTerm || governorateFilter !== "All" || searchType !== "All"
            ? "Search Results - Pharmacies"
            : "Trusted Pharmacies in Your Area"}
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {pharmacies.length > 0 ? (
            pharmacies.map((pharmacy) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pharmacy.id}>
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
              No pharmacies found matching your search criteria.
            </Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default PharmaciesSection;
