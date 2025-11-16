import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  useTheme,
  Typography,
  Rating,
  TextField,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { useParams, useNavigate } from "react-router-dom";
import PharmacyHeader from "./PharmacyHeader";
import ContactInfo from "./ContactInfo";
import Cart from "./Cart";
import MedicationCard from "./MedicationCard";
import OrderTimeline from "./OrderTimeline";
import Data from "../../Data/Pharmacies.json";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { medicationCategories } from "../../Data/MedicationCategories";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PharmacyProfile = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [cart, setCart] = useState([]);
  const [pharmacy, setPharmacy] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [successToast, setSuccessToast] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    // Always use the id from URL to find the pharmacy
    const users = JSON.parse(localStorage.getItem("Users") || "[]");
    let foundPharmacy = null;
    
    // Check if id is an email (from registered pharmacies) or a number (from JSON)
    if (isNaN(Number(id))) {
      // id is an email, search in registered pharmacies
      const pharmacyUser = users.find(
        (user) => user.role === "Pharmacy" && user.pharmacyProfile && user.email === id
      );
      
      if (pharmacyUser && pharmacyUser.pharmacyProfile) {
        foundPharmacy = {
          id: pharmacyUser.email,
          name: pharmacyUser.pharmacyProfile.pharmacyName,
          shortName: pharmacyUser.pharmacyProfile.shortName,
          image: pharmacyUser.pharmacyProfile.profilePicture || "https://i.pravatar.cc/150",
          address: pharmacyUser.pharmacyProfile.address,
          location: pharmacyUser.pharmacyProfile.location,
          phone: pharmacyUser.pharmacyProfile.phoneNumber,
          email: pharmacyUser.pharmacyProfile.email,
          hours: pharmacyUser.pharmacyProfile.hours,
          description: pharmacyUser.pharmacyProfile.description || "",
          rating: 4.5,
          reviews: 0,
          isTopRated: false,
          products: pharmacyUser.pharmacyProfile.products || [],
        };
      }
    } else {
      // id is a number, search in JSON data
      foundPharmacy = Data.find((p) => p.id === Number(id));
    }
    
    // If not found in registered pharmacies or JSON, use fallback
    if (!foundPharmacy) {
      foundPharmacy = Data[0] || null;
    }
    
    if (foundPharmacy) {
      setPharmacy(foundPharmacy);
      
      // Load reviews from localStorage
      const reviewsKey = `pharmacyReviews_${foundPharmacy.id}`;
      const savedReviews = localStorage.getItem(reviewsKey);
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      } else {
        setReviews([]);
      }
    }

    // Load cart from localStorage (for display purposes only)
    if (foundPharmacy) {
      const savedCart = localStorage.getItem("Cart");
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          // Filter cart items for this pharmacy
          const pharmacyCart = cartData.filter(
            (item) => item.pharmacyId === foundPharmacy.id
          );
          setCart(pharmacyCart);
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      }
    }
  }, [id]);

  if (!pharmacy) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6">Loading pharmacy data...</Typography>
      </Container>
    );
  }

  const handleAddToCart = (medication) => {
    // Get cart from localStorage
    const savedCart = localStorage.getItem("Cart");
    const currentCart = savedCart ? JSON.parse(savedCart) : [];
    
    const existingItem = currentCart.find((item) => item.id === medication.id && item.pharmacyId === pharmacy.id);
    
    let updatedCart;
    if (existingItem) {
      updatedCart = currentCart.map((item) =>
        item.id === medication.id && item.pharmacyId === pharmacy.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
      );
    } else {
      updatedCart = [
        ...currentCart,
        {
          ...medication,
          quantity: 1,
          pharmacyId: pharmacy.id,
          pharmacyName: pharmacy.name || pharmacy.pharmacyName,
        },
      ];
    }

    // Save to localStorage
    localStorage.setItem("Cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
    
    // Update local state (for this pharmacy only)
    const pharmacyCart = updatedCart.filter(
      (item) => item.pharmacyId === pharmacy.id
    );
    setCart(pharmacyCart);
  };

  const handleRemoveFromCart = (itemId) => {
    const savedCart = localStorage.getItem("Cart");
    const currentCart = savedCart ? JSON.parse(savedCart) : [];
    const updatedCart = currentCart.filter((item) => !(item.id === itemId && item.pharmacyId === pharmacy.id));
    
    localStorage.setItem("Cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
    
    // Update local state (for this pharmacy only)
    const pharmacyCart = updatedCart.filter(
      (item) => item.pharmacyId === pharmacy.id
    );
    setCart(pharmacyCart);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddReview = () => {
    if (reviewRating === 0 || !reviewComment.trim()) {
      alert("Please provide a rating and comment");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    const newReview = {
      id: reviews.length + 1,
      patientName: currentUser.name || "Anonymous",
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split("T")[0],
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    setReviewRating(0);
    setReviewComment("");
    setSuccessToast(true);

    // Save reviews to localStorage
    if (pharmacy && pharmacy.id) {
      const reviewsKey = `pharmacyReviews_${pharmacy.id}`;
      try {
        localStorage.setItem(reviewsKey, JSON.stringify(updatedReviews));
      } catch (error) {
        console.error("Error saving review:", error);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        width: "100%",
        overflowX: "hidden",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          width: "100%", 
          maxWidth: "1200px",
          px: { xs: 2, sm: 3, md: 4 },
          overflowX: "hidden",
          mx: "auto",
        }}
      >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            textTransform: "none",
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
      >
        Back
      </Button>

      {/* Pharmacy Header */}
      <PharmacyHeader
        pharmacy={pharmacy}
        isFavorite={isFavorite}
        toggleFavorite={() => setIsFavorite(!isFavorite)}
        theme={theme}
      />

        <Grid 
          container 
          spacing={3}
          sx={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            overflowX: "hidden",
            justifyContent: "center",
          }}
        >
          {/* Main Content - Full Width */}
          <Grid size={{ xs: 12, md: 12 }}>
            {/* Contact Information */}
            <ContactInfo pharmacy={pharmacy} theme={theme} />

            {/* Description and Reviews Tabs */}
            <Card
              sx={{
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: `1px solid ${theme.palette.divider}`,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    mb: 3,
                    borderBottom: 1,
                    borderColor: "divider",
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "1rem",
                      minHeight: 48,
                    },
                    "& .Mui-selected": {
                      color: theme.palette.primary.main,
                    },
                  }}
                  indicatorColor="primary"
                >
                  <Tab label="Description" />
                  <Tab label={`Reviews (${reviews.length})`} />
                </Tabs>

              {activeTab === 0 && (
                <Box>
                  {pharmacy.description ? (
                    <>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          mb: 3,
                          color: theme.palette.primary.main,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        About This Pharmacy
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.8,
                          fontSize: "1rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {pharmacy.description}
                      </Typography>
                    </>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 6,
                        px: 2,
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          fontStyle: "italic",
                          fontSize: "1rem",
                        }}
                      >
                        No description available for this pharmacy.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mb: 3,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Customer Reviews ({reviews.length})
                  </Typography>

                  {/* Add Review Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 4,
                      backgroundColor: "#F9FAFB",
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: theme.palette.text.primary,
                      }}
                    >
                      Share Your Experience
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1.5,
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                        }}
                      >
                        Your Rating
                      </Typography>
                      <Rating
                        value={reviewRating}
                        onChange={(event, newValue) => {
                          setReviewRating(newValue);
                        }}
                        size="large"
                        sx={{
                          "& .MuiRating-iconFilled": {
                            color: theme.palette.primary.main,
                          },
                        }}
              />
            </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Tell others about your experience with this pharmacy..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddReview}
                      fullWidth
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        textTransform: "none",
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: 2,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      Submit Review
                    </Button>
                  </Paper>

                  <Divider sx={{ my: 3 }} />

                  {/* Reviews Swiper */}
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "100%",
                      py: 2,
                      overflow: "hidden",
                      position: "relative",
                      boxSizing: "border-box",
                      "& .swiper": {
                        paddingBottom: "50px",
                        width: "100%",
                        maxWidth: "100%",
                        overflow: "hidden",
                        boxSizing: "border-box",
                      },
                      "& .swiper-wrapper": {
                        display: "flex",
                        boxSizing: "border-box",
                      },
                      "& .swiper-slide": {
                        boxSizing: "border-box",
                        flexShrink: 0,
                        height: "auto",
                      },
                      "& .swiper-button-next, & .swiper-button-prev": {
                        color: theme.palette.primary.main,
                        "&::after": {
                          fontSize: "20px",
                        },
                      },
                      "& .swiper-pagination": {
                        bottom: "10px",
                      },
                      "& .swiper-pagination-bullet-active": {
                        backgroundColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {reviews.length === 0 ? (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 6,
                          px: 2,
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            fontStyle: "italic",
                            fontSize: "1rem",
                          }}
                        >
                          No reviews yet. Be the first to share your experience!
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ width: "100%", overflow: "hidden", position: "relative" }}>
                        <Swiper
                          modules={[Navigation, Pagination, Autoplay]}
                          spaceBetween={20}
                          slidesPerView={1}
                          navigation
                          pagination={{ clickable: true }}
                          autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                          }}
                          breakpoints={{
                            640: {
                              slidesPerView: 1,
                              spaceBetween: 15,
                            },
                            768: {
                              slidesPerView: 2,
                              spaceBetween: 15,
                            },
                            1024: {
                              slidesPerView: 3,
                              spaceBetween: 20,
                            },
                          }}
                          style={{
                            width: "100%",
                            overflow: "hidden",
                            boxSizing: "border-box",
                          }}
                          className="reviews-swiper"
                        >
                        {reviews.map((review) => (
                          <SwiperSlide key={review.id}>
                            <Card
                              sx={{
                                height: "100%",
                                borderRadius: 3,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                border: `1px solid ${theme.palette.divider}`,
                                p: 3,
                                display: "flex",
                                flexDirection: "column",
                                transition: "all 0.3s ease",
                                width: "100%",
                                boxSizing: "border-box",
                                overflow: "hidden",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  mb: 2,
                                }}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      fontWeight: 700,
                                      mb: 1,
                                      color: theme.palette.text.primary,
                                    }}
                                  >
                                    {review.patientName}
                                  </Typography>
          <Box
            sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1.5,
                                      mb: 1,
                                    }}
                                  >
                                    <Rating
                                      value={review.rating}
                                      readOnly
                                      size="small"
                                      sx={{
                                        "& .MuiRating-iconFilled": {
                                          color: theme.palette.primary.main,
                                        },
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: theme.palette.text.secondary,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {new Date(review.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  lineHeight: 1.7,
                                  flex: 1,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {review.comment}
                              </Typography>
                            </Card>
                          </SwiperSlide>
                        ))}
                        </Swiper>
                      </Box>
                    )}
                  </Box>
          </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Available Medications */}
      {pharmacy.products && pharmacy.products.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 3,
              textAlign: "center",
              color: theme.palette.primary.main,
            }}
          >
            Available Medications
          </Typography>

          {/* Search and Filter Section */}
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
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
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
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start" sx={{ ml: 1 }}>
                    <FilterListIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: 2,
                }}
              >
                {medicationCategories.map((category) => (
                  <MenuItem key={category} value={category === "All Categories" ? "All" : category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Filtered Medications */}
          {(() => {
            // Get unique categories from products
            const allCategories = [
              ...new Set(
                pharmacy.products
                  .map((p) => p.category || "Other")
                  .filter((cat) => cat)
              ),
            ];

            // Filter products based on search and category
            const filteredProducts = pharmacy.products.filter((medication) => {
              const matchesSearch =
                searchTerm === "" ||
                medication.name.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesCategory =
                categoryFilter === "All" ||
                (medication.category || "Other") === categoryFilter;
              return matchesSearch && matchesCategory;
            });

            if (filteredProducts.length === 0) {
              return (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    px: 2,
                  }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontStyle: "italic",
                      fontSize: "1rem",
                    }}
                  >
                    No medications found matching your search criteria.
                  </Typography>
                </Box>
              );
            }

            return (
              <Grid container spacing={3} sx={{ justifyContent: "center" }}>
                {filteredProducts.map((medication) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={medication.id}>
                    <MedicationCard
                      medication={medication}
                      handleAddToCart={handleAddToCart}
                      theme={theme}
                    />
                  </Grid>
                ))}
              </Grid>
            );
          })()}
        </Box>
      )}

      <Snackbar
        open={successToast}
        autoHideDuration={2000}
        onClose={() => setSuccessToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessToast(false)}
          severity="success"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          Review added successfully!
        </Alert>
      </Snackbar>
    </Container>
    </Box>
  );
};

export default PharmacyProfile;
