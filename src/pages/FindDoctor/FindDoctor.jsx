import React, { useState, useEffect, useMemo } from "react";
import doctorsData from "../../Data/Doctors.json";
import { Box, Typography, TextField, InputAdornment, useTheme } from "@mui/material";
import Grid from '@mui/material/Grid';
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router";
import LoaderInPage from "../../components/Loader/LoaderInPage"; // استيراد الـ Loader
import DoctorCard from "./DoctorCard"; // استيراد مكون عرض الطبيب

const FindDoctor = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // تحميل البيانات ومحاكاة التأخير
  useEffect(() => {
    const loadData = () => {
      setTimeout(() => {
        setDoctors(doctorsData);
        setIsLoading(false); // تحميل البيانات
      }, 1000);
    };

    loadData();
  }, []);

  // تصفية الأطباء بناءً على البحث
  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, doctors]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
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
            marginBottom: "20px",
            mx: "auto",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
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

        {/* عرض Loader أو عرض الأطباء */}
        {isLoading ? (
          <LoaderInPage />
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} onClick={handleDoctorClick} />
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
