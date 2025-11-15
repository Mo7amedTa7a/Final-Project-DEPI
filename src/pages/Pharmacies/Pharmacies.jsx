import React, { useState, useEffect } from "react";
import pharmaciesData from "../../Data/Pharmacies.json";
import Grid from '@mui/material/Grid';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  useTheme,
  TextField, // استبدال input بـ TextField
  InputAdornment, // لإضافة أيقونة البحث
  CircularProgress, // استخدام CircularProgress لعرض Loader
} from "@mui/material";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import SearchIcon from "@mui/icons-material/Search"; // استيراد أيقونة البحث
import { useNavigate } from "react-router";

const Pharmacies = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // حالة تحميل البيانات

  useEffect(() => {
    // محاكاة عملية تحميل البيانات
    const loadData = () => {
      setTimeout(() => {
        setPharmacies(pharmaciesData);
        setIsLoading(false); // تغيير حالة التحميل بعد انتهاء البيانات
      }, 1000); // محاكاة تأخير 1 ثانية
    };

    loadData();
  }, []);

  useEffect(() => {
    const results = pharmacies.filter((pharmacy) =>
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPharmacies(results);
  }, [searchTerm, pharmacies]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
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

        {/* استبدال input بـ TextField مع الأنماط */}
        <TextField
          fullWidth
          placeholder="Search by name"
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
            mx: "auto", // توسيط الشريط
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

        {/* عرض Loader أثناء تحميل البيانات */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {filteredPharmacies.length > 0 ? (
              filteredPharmacies.map((pharmacy) => (
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
