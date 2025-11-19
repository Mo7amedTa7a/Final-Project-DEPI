import React, { useState, useEffect, useMemo } from "react";
import Grid from '@mui/material/Grid';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  useTheme,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate, useSearchParams } from "react-router";
import { usePharmacies } from "../../hooks/useData";

const Pharmacies = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [locationFilter, setLocationFilter] = useState("All");
  const [governorateFilter, setGovernorateFilter] = useState(searchParams.get('governorate') || "All");
  
  // Use dynamic data hook
  const { pharmacies, isLoading } = usePharmacies();

  // Extract governorate from location (assuming format like "City, Governorate" or just "Governorate")
  const getGovernorate = (location) => {
    if (!location) return null;
    // If location contains comma, take the part after comma, otherwise take the whole location
    const parts = location.split(",").map((p) => p.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  };

  // Filter pharmacies
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((pharmacy) => {
      // Filter by search term (name or location)
      const matchesSearch =
        searchTerm === "" ||
        pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pharmacy.location && pharmacy.location.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by location (city)
      const matchesLocation =
        locationFilter === "All" ||
        (pharmacy.location && pharmacy.location.toLowerCase().includes(locationFilter.toLowerCase()));

      // Filter by governorate
      const pharmacyGovernorate = getGovernorate(pharmacy.location);
      const matchesGovernorate =
        governorateFilter === "All" ||
        (pharmacyGovernorate && pharmacyGovernorate.toLowerCase() === governorateFilter.toLowerCase());

      return matchesSearch && matchesLocation && matchesGovernorate;
    });
  }, [searchTerm, locationFilter, governorateFilter, pharmacies]);

  // Get unique locations for filter
  const uniqueLocations = Array.from(
    new Set(pharmacies.map((p) => p.location).filter((loc) => loc))
  ).sort();

  // Get unique governorates for filter
  const uniqueGovernorates = Array.from(
    new Set(
      pharmacies
        .map((p) => getGovernorate(p.location))
        .filter((gov) => gov)
    )
  ).sort();

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleGovernorateChange = (value) => {
    setGovernorateFilter(value);
    const params = new URLSearchParams(searchParams);
    if (value !== "All") {
      params.set('governorate', value);
    } else {
      params.delete('governorate');
    }
    setSearchParams(params);
  };

  const handlePharmacyClick = (pharmacyId) => {
    navigate(`/pharmacy/${pharmacyId}`);
  };

  return (
    <Box
      sx={{
        py: 8,
        px: { xs: 2, sm: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
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
          All Pharmacies
        </Typography>

        {/* Search and Filters Section */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name or location"
            value={searchTerm}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: { xs: 1, sm: 2 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "& fieldset": {
                  borderColor: theme.palette.divider,
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <FormControl
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              flex: { xs: 1, sm: 0 },
            }}
          >
            <InputLabel>Location</InputLabel>
            <Select
              value={locationFilter}
              label="Location"
              onChange={(e) => setLocationFilter(e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <FilterListIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="All">All Locations</MenuItem>
              {uniqueLocations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              flex: { xs: 1, sm: 0 },
            }}
          >
            <InputLabel>Governorate</InputLabel>
            <Select
              value={governorateFilter}
              label="Governorate"
              onChange={(e) => handleGovernorateChange(e.target.value)}
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="All">All Governorates</MenuItem>
              {uniqueGovernorates.map((governorate) => (
                <MenuItem key={governorate} value={governorate}>
                  {governorate}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* عرض Loader أثناء تحميل البيانات */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {filteredPharmacies.length > 0 ? (
              filteredPharmacies.map((pharmacy) => (
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
                sx={{ color: theme.palette.text.secondary }}
              >
                No pharmacies found.
              </Typography>
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Pharmacies;
