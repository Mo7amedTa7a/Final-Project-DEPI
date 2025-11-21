// Bootstrap Components
import { Carousel } from "react-bootstrap";
// MUI Components
import { 
  TextField, 
  Button, 
  useTheme, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  InputAdornment,
  Box,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { heroImages } from "../../../Data/HeroSectionData";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useDoctors, usePharmacies } from "../../../hooks/useData";

const HeroSection = ({
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  specialtyFilter,
  setSpecialtyFilter,
  governorateFilter,
  setGovernorateFilter,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const images = heroImages;
  
  // Use dynamic data hooks
  const { doctors: doctorsData } = useDoctors();
  const { pharmacies: pharmaciesData } = usePharmacies();

  // Extract governorate from location
  const getGovernorate = (location) => {
    if (!location) return null;
    const parts = location.split(",").map((p) => p.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  };

  // Get unique specialties
  const uniqueSpecialties = useMemo(() => {
    return Array.from(new Set(doctorsData.map((d) => d.specialty).filter((s) => s))).sort();
  }, [doctorsData]);

  // Get unique governorates from both doctors and pharmacies
  const uniqueGovernorates = useMemo(() => {
    const doctorGovs = doctorsData.map((d) => getGovernorate(d.location)).filter((g) => g);
    const pharmacyGovs = pharmaciesData.map((p) => getGovernorate(p.location)).filter((g) => g);
    return Array.from(new Set([...doctorGovs, ...pharmacyGovs])).sort();
  }, [doctorsData, pharmaciesData]);

  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    if (governorateFilter !== "All") {
      params.set('governorate', governorateFilter);
    }
    
    // Navigate based on search type
    if (searchType === "Doctor" || (searchType === "All" && specialtyFilter !== "All")) {
      // Navigate to FindDoctor page
      if (specialtyFilter !== "All") {
        params.set('specialty', specialtyFilter);
      }
      navigate(`/finddoctor?${params.toString()}`);
    } else if (searchType === "Pharmacy") {
      // Navigate to Pharmacies page
      navigate(`/pharmacies?${params.toString()}`);
    } else {
      // If All and no specialty filter, show both sections on home
      const resultsSection = document.getElementById('search-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Carousel fade controls={false} indicators={false} interval={3000}>
      {images.map((img, index) => (
        <Carousel.Item key={index}>
          <div
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "100vh",
              position: "relative",
            }}
          >
            {/* overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                 background: "linear-gradient(60deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.77), rgba(255, 255, 255, 1))",
                zIndex: 1,
              }}
            />

            {/*Start the search box*/}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                maxWidth: "900px",
                zIndex: 2,
              }}
            >
              {/*Start The text above the search box */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <h1
                  style={{
                    ...theme.typography.h1,
                    fontSize: { xs: "1.5rem", md: "3rem" },
                    marginBottom: "10px",
                    textShadow:
                      "1px 1px 1px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.5)",
                    letterSpacing: "1px",
                  }}
                >
                  Search for Doctor or Pharmacy
                </h1>
                <p
                  style={{
                     fontSize: { xs: "1rem", md: "1.5rem" },
                     fontWeight:"bold",
                    color: "#1d1d1dff",
                    letterSpacing: "1px",
                  }}
                >
                  Find your healthcare provider easily
                </p>
              </div>
              {/*End The text above the search box  */}
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  p: 3,
                  borderRadius: "25px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
              >
                {/* Search Type and Search Term */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Search Type</InputLabel>
                      <Select
                        value={searchType}
                        label="Search Type"
                        onChange={(e) => setSearchType(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start" sx={{ ml: 1 }}>
                            <FilterListIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                          </InputAdornment>
                        }
                        MenuProps={{ disableScrollLock: true }}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Doctor">Doctors</MenuItem>
                        <MenuItem value="Pharmacy">Pharmacies</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search by name..."
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                </Grid>

                {/* Filters */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {searchType === "All" || searchType === "Doctor" ? (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Specialty</InputLabel>
                        <Select
                          value={specialtyFilter}
                          label="Specialty"
                          onChange={(e) => setSpecialtyFilter(e.target.value)}
                          MenuProps={{ disableScrollLock: true }}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="All">All Specialties</MenuItem>
                          {uniqueSpecialties.map((specialty) => (
                            <MenuItem key={specialty} value={specialty}>
                              {specialty}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ) : null}
                  <Grid size={{ xs: 12, sm: searchType === "Pharmacy" ? 12 : 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Governorate</InputLabel>
                      <Select
                        value={governorateFilter}
                        label="Governorate"
                        onChange={(e) => setGovernorateFilter(e.target.value)}
                        MenuProps={{ disableScrollLock: true }}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="All">All Governorates</MenuItem>
                        {uniqueGovernorates.map((governorate) => (
                          <MenuItem key={governorate} value={governorate}>
                            {governorate}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Search Button */}
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<SearchIcon />}
                  fullWidth
                  onClick={handleSearch}
                  sx={{
                    fontWeight: "bold",
                    borderRadius: "15px",
                    py: 1.5,
                    fontSize: "1rem",
                  }}
                >
                  Search
                </Button>
              </Box>
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default HeroSection;
