import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate, useSearchParams } from "react-router";
import LoaderInPage from "../../components/Loader/LoaderInPage";
import DoctorCard from "./DoctorCard";
import { useDoctors } from "../../hooks/useData";

const FindDoctor = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [specialtyFilter, setSpecialtyFilter] = useState(searchParams.get('specialty') || "All");
  const [governorateFilter, setGovernorateFilter] = useState(searchParams.get('governorate') || "All");
  
  // Use dynamic data hook
  const { doctors, isLoading } = useDoctors();

  // Extract governorate from location (assuming format like "City, Governorate" or just "Governorate")
  const getGovernorate = (location) => {
    if (!location) return null;
    // If location contains comma, take the part after comma, otherwise take the whole location
    const parts = location.split(",").map((p) => p.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  };

  // Get unique specialties for filter
  const uniqueSpecialties = useMemo(() => {
    return Array.from(new Set(doctors.map((d) => d.specialty).filter((s) => s))).sort();
  }, [doctors]);

  // Get unique governorates for filter
  const uniqueGovernorates = useMemo(() => {
    return Array.from(
      new Set(
        doctors
          .map((d) => getGovernorate(d.location))
          .filter((gov) => gov)
      )
    ).sort();
  }, [doctors]);

  // تصفية الأطباء بناءً على البحث والفلاتر
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      // Filter by search term (name or specialty)
      const matchesSearch =
        searchTerm === "" ||
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by specialty
      const matchesSpecialty =
        specialtyFilter === "All" ||
        (doctor.specialty && doctor.specialty.toLowerCase() === specialtyFilter.toLowerCase());

      // Filter by governorate
      const doctorGovernorate = getGovernorate(doctor.location);
      const matchesGovernorate =
        governorateFilter === "All" ||
        (doctorGovernorate && doctorGovernorate.toLowerCase() === governorateFilter.toLowerCase());

      return matchesSearch && matchesSpecialty && matchesGovernorate;
    });
  }, [searchTerm, specialtyFilter, governorateFilter, doctors]);

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

  const handleSpecialtyChange = (value) => {
    setSpecialtyFilter(value);
    const params = new URLSearchParams(searchParams);
    if (value !== "All") {
      params.set('specialty', value);
    } else {
      params.delete('specialty');
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

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

  return (
    <Box sx={{ py: 8, px: { xs: 2, sm: 4, md: 6 }, backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
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
          All Doctors
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
            placeholder="Search by name or specialty"
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
              minWidth: { xs: "100%", sm: 200 },
              flex: { xs: 1, sm: 0 },
            }}
          >
            <InputLabel>Specialty</InputLabel>
            <Select
              value={specialtyFilter}
              label="Specialty"
              onChange={(e) => handleSpecialtyChange(e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <FilterListIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="All">All Specialties</MenuItem>
              {uniqueSpecialties.map((specialty) => (
                <MenuItem key={specialty} value={specialty}>
                  {specialty}
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

        {/* عرض Loader أو عرض الأطباء */}
        {isLoading ? (
          <LoaderInPage />
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor, index) => (
                <DoctorCard key={doctor.id ? `${doctor.id}-${doctor.email || index}` : `doctor-${index}`} doctor={doctor} onClick={handleDoctorClick} />
              ))
            ) : (
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                No doctors found.
              </Typography>
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default FindDoctor;
