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
import { useMemo } from "react";
import { usePharmacies } from "../../../hooks/useData";

const PharmaciesSection = ({ searchTerm, searchType, governorateFilter }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Use dynamic data hook
  const { pharmacies: allPharmacies } = usePharmacies();

  // Extract governorate from location
  const getGovernorate = (location) => {
    if (!location) return null;
    const parts = location.split(",").map((p) => p.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  };

  // Filter pharmacies
  const filteredPharmacies = useMemo(() => {
    // Show all registered pharmacies and top-rated pharmacies
    let pharmacies = allPharmacies.filter((pharmacy) => pharmacy.isRegistered || pharmacy.isTopRated);

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

    // Sort by rating (highest first) and limit to top 10 for top-rated section
    const sortedPharmacies = [...pharmacies].sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      if (ratingB !== ratingA) {
        return ratingB - ratingA; // Higher rating first
      }
      // If same rating, sort by number of reviews
      const reviewsA = Array.isArray(a.reviews) ? a.reviews.length : 0;
      const reviewsB = Array.isArray(b.reviews) ? b.reviews.length : 0;
      return reviewsB - reviewsA;
    });

    // If showing top-rated only, limit to top 10
    if (!searchTerm && governorateFilter === "All" && searchType === "All") {
      return sortedPharmacies.slice(0, 10);
    }

    return sortedPharmacies;
  }, [allPharmacies, searchTerm, searchType, governorateFilter]);

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
                  {/* Pharmacy Icon/Image */}
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
                      overflow: "hidden",
                    }}
                  >
                    {pharmacy.image ? (
                      <Box
                        component="img"
                        src={pharmacy.image}
                        alt={pharmacy.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <LocalPharmacyIcon
                        sx={{
                          color: theme.palette.primary.contrastText,
                          fontSize: 32,
                        }}
                      />
                    )}
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
                          ({Array.isArray(pharmacy.reviews) ? pharmacy.reviews.length : pharmacy.reviews || 0} reviews)
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
