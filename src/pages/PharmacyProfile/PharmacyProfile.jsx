import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import Grid from "@mui/material/Grid";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import PharmacyHeader from "./PharmacyHeader";
import ContactInfo from "./ContactInfo";
import MedicationCard from "./MedicationCard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { medicationCategories } from "../../Data/MedicationCategories";
import { usePharmacies } from "../../hooks/useData";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PharmacyProfile = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  
  
  // ============= State Management =============
  const [pharmacy, setPharmacy] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [successToast, setSuccessToast] = useState(false);
  const [cartToast, setCartToast] = useState({ open: false, message: "" });
  
  // ============= Hooks =============
  const { getPharmacyById, isLoading } = usePharmacies();

  // ============= Memoized Values =============
  // استخراج القيم الثابتة من pharmacy object لتجنب تغيير reference
  // تحويل إلى string لضمان primitive comparison في dependency array
  const pharmacyIdString = pharmacy?.id ? String(pharmacy.id) : null;
  const pharmacyNameString = pharmacy?.name ? String(pharmacy.name) : "";
  
  const pharmacyId = useMemo(() => pharmacyIdString, [pharmacyIdString]);
  const pharmacyName = useMemo(() => pharmacyNameString, [pharmacyNameString]);

  // ============= Helper Functions =============
  const getCurrentUser = useCallback(() => {
    try {
      const user = localStorage.getItem("CurrentUser");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }, []);

  const calculateAverageRating = useCallback((reviewsArray) => {
    if (!Array.isArray(reviewsArray) || reviewsArray.length === 0) {
      return 4.5;
    }
    const sum = reviewsArray.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round((sum / reviewsArray.length) * 10) / 10;
  }, []);

  // ============= Data Loading =============
  useEffect(() => {
    const loadPharmacy = async () => {
      if (!id) {
        return;
      }
      
      try {
        const pharmacyData = await getPharmacyById(id);
        if (pharmacyData) {
          setPharmacy(pharmacyData);
          setReviews(Array.isArray(pharmacyData.reviews) ? pharmacyData.reviews : []);
        }
      } catch (error) {
        console.error("Error loading pharmacy:", error);
      }
    };

    if (!isLoading) {
      loadPharmacy();
    }
  }, [id, isLoading, getPharmacyById]);

  // ============= Filtered Products (Memoized) =============
  const filteredProducts = useMemo(() => {
    if (!pharmacy?.products || pharmacy.products.length === 0) {
      return [];
    }
    
    return pharmacy.products.filter((medication) => {
      const matchesSearch =
        searchTerm === "" ||
        medication.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory =
        categoryFilter === "All" ||
        (medication.category || "Other") === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [pharmacy?.products, searchTerm, categoryFilter]);

  // ============= Event Handlers =============
  const handleAddToCart = useCallback((medication) => {
    const currentUser = getCurrentUser();
    
    if (!currentUser?.email) {
      alert("Please login first to add items to cart");
      navigate("/login");
      return;
    }

    if (!pharmacyId) {
      alert("Unable to add to cart. Please try again.");
      return;
    }

    try {
      const savedCart = localStorage.getItem("Cart");
      const currentCart = savedCart ? JSON.parse(savedCart) : [];

      const existingItemIndex = currentCart.findIndex(
        (item) => item.id === medication.id && item.pharmacyId === pharmacyId
      );

      let updatedCart;
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        updatedCart = currentCart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        updatedCart = [
          ...currentCart,
          {
            ...medication,
            quantity: 1,
            pharmacyId: pharmacyId,
            pharmacyName: pharmacyName || "Unknown Pharmacy",
          },
        ];
      }

      localStorage.setItem("Cart", JSON.stringify(updatedCart));
      
      // Show success toast
      const isNewItem = existingItemIndex === -1;
      setCartToast({
        open: true,
        message: isNewItem 
          ? `${medication.name} added to cart successfully!`
          : `${medication.name} quantity updated in cart!`
      });
      
      // Dispatch custom event to update cart count in Header without re-rendering this component
      window.dispatchEvent(new CustomEvent("cartUpdated", { 
        detail: { cart: updatedCart, totalItems: updatedCart.reduce((sum, item) => sum + item.quantity, 0) }
      }));
    } catch (error) {
      console.error("Error adding to cart:", error);
      setCartToast({
        open: true,
        message: "Failed to add item to cart. Please try again."
      });
    }
  }, [pharmacyId, pharmacyName, navigate, getCurrentUser]);

  const handleAddReview = useCallback(async () => {
    // Validation
    if (reviewRating === 0) {
      alert("Please provide a rating");
      return;
    }

    if (!reviewComment.trim()) {
      alert("Please provide a comment");
      return;
    }

    if (!pharmacy?.id) {
      alert("Pharmacy data not loaded. Please try again.");
      return;
    }

    const currentUser = getCurrentUser();
    
    if (!currentUser?.email) {
      alert("Please login first to add a review");
      navigate("/login");
      return;
    }

    // Create new review
    const newReview = {
      id: Date.now().toString(),
      patientName:
        currentUser.name ||
        currentUser.patientProfile?.fullName ||
        "Anonymous User",
      patientId: currentUser.email || currentUser.id,
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
    };

    // Check for duplicate review
    const reviewExists = reviews.some(
      (r) => r.patientId === newReview.patientId && r.date === newReview.date
    );

    if (reviewExists) {
      alert("You have already submitted a review for this pharmacy today.");
      return;
    }

    try {
      // Update local state
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      setReviewRating(0);
      setReviewComment("");
      setSuccessToast(true);

      // Calculate new average rating
      const newAverageRating = calculateAverageRating(updatedReviews);

      // Update pharmacy state
      setPharmacy((prev) => ({
        ...prev,
        rating: newAverageRating,
        reviews: updatedReviews,
      }));

      // Save to Firebase
      const pharmacyRef = doc(db, "pharmacies", pharmacy.id);
      const pharmacyDoc = await getDoc(pharmacyRef);

      if (pharmacyDoc.exists()) {
        await updateDoc(pharmacyRef, {
          reviews: updatedReviews,
          rating: newAverageRating,
          updatedAt: serverTimestamp(),
        });
      }

      // Update user's pharmacy profile if exists
      const FirestoreService = (await import("../../services/FirestoreService")).default;
      const users = await FirestoreService.get("users");
      const user = users.find((u) => {
        const userId = String(u.email || u.id || "").toLowerCase();
        const pharmacyId = String(pharmacy.id || "").toLowerCase();
        return userId === pharmacyId;
      });

      if (user?.pharmacyProfile) {
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
          "pharmacyProfile.reviews": updatedReviews,
          "pharmacyProfile.rating": newAverageRating,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Failed to submit review. Please try again.");
      // Rollback local state if Firebase update fails
      setReviews(reviews);
      setPharmacy((prev) => ({
        ...prev,
        reviews: reviews,
      }));
    }
  }, [pharmacy, reviewRating, reviewComment, reviews, navigate, getCurrentUser, calculateAverageRating]);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
    // TODO: Save favorite status to backend/localStorage
  }, []);

  // ============= Loading State =============
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Loading pharmacy data...
        </Typography>
      </Container>
    );
  }

  if (!pharmacy) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Pharmacy not found
        </Typography>
        <Button
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
          variant="contained"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  // ============= Main Render =============
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          maxWidth: "1200px",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Back Button */}
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
          toggleFavorite={toggleFavorite}
          theme={theme}
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            {/* Contact Information */}
            <ContactInfo pharmacy={pharmacy} theme={theme} />

            {/* Description and Reviews Tabs */}
            <Card
              sx={{
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: `1px solid ${theme.palette.divider}`,
                overflow: "hidden",
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                }}
              >
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

                {/* Tab Content: Description */}
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
                          }}
                        >
                          No description available for this pharmacy.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Tab Content: Reviews */}
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
                            setReviewRating(newValue || 0);
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
                        disabled={reviewRating === 0 || !reviewComment.trim()}
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          textTransform: "none",
                          py: 1.5,
                          fontWeight: 600,
                          borderRadius: 2,
                          "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                          },
                          "&:disabled": {
                            backgroundColor: theme.palette.action.disabledBackground,
                          },
                        }}
                      >
                        Submit Review
                      </Button>
                    </Paper>

                    <Divider sx={{ my: 3 }} />

                    {/* Reviews Display */}
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
                          }}
                        >
                          No reviews yet. Be the first to share your experience!
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          py: 2,
                          "& .swiper": {
                            paddingBottom: "50px",
                          },
                          "& .swiper-button-next, & .swiper-button-prev": {
                            color: theme.palette.primary.main,
                            "&::after": {
                              fontSize: "20px",
                            },
                          },
                          "& .swiper-pagination-bullet-active": {
                            backgroundColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        <Swiper
                          modules={[Navigation, Pagination, Autoplay]}
                          spaceBetween={20}
                          slidesPerView={1}
                          navigation
                          pagination={{ clickable: true }}
                          autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
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
                                        flexWrap: "wrap",
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
                                        {new Date(review.date).toLocaleDateString(
                                          "en-US",
                                          {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          }
                                        )}
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
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Available Medications Section */}
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

            {/* Search and Filter */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
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
                }}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  MenuProps={{ disableScrollLock: true }}
                  startAdornment={
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      <FilterListIcon
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {medicationCategories.map((category) => (
                    <MenuItem
                      key={category}
                      value={category === "All Categories" ? "All" : category}
                    >
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Medications Grid */}
            {filteredProducts.length === 0 ? (
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
                  }}
                >
                  No medications found matching your search criteria.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
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
            )}
          </Box>
        )}

        {/* Review Success Toast */}
        <Snackbar
          open={successToast}
          autoHideDuration={3000}
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

        {/* Cart Success Toast */}
        <Snackbar
          open={cartToast.open}
          autoHideDuration={3000}
          onClose={() => setCartToast({ open: false, message: "" })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setCartToast({ open: false, message: "" })}
            severity={cartToast.message.includes("Failed") ? "error" : "success"}
            sx={{
              width: "100%",
              borderRadius: 2,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
            }}
          >
            {cartToast.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default PharmacyProfile;