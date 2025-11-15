// components mui
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  useTheme,
  IconButton,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DeleteIcon from "@mui/icons-material/Delete";
// Data
import Data from "../../Data/Pharmacies.json";

const PharmacyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [cart, setCart] = useState([]);

  // Mock data
  const pharmacies = Data;

  const pharmacy = pharmacies.find((p) => p.id === Number(id)) || pharmacies[0];

  const handleAddToCart = (medication) => {
    const existingItem = cart.find((item) => item.id === medication.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === medication.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...medication, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Box
      sx={{
        maxWidth: "1200",
        width: "100%",
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      {/* Pharmacy Header */}
      <Card
        sx={{
          maxWidth: "95%",
          mx: "auto",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          p: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          <Avatar
            src={pharmacy.image}
            alt={pharmacy.name}
            sx={{
              width: "80px",
              height: "80px",
              mb: 2,
              border: `4px solid ${theme.palette.primary.light}`,
            }}
          />
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "start" } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mb: 0.5,
                fontSize: { xs: "19px", md: "25px" },
              }}
            >
              {pharmacy.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.secondary }}
            >
              {pharmacy.address}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={() => setIsFavorite(!isFavorite)}
            sx={{
              borderColor: theme.palette.grey[300],
              color: isFavorite
                ? theme.palette.error.main
                : theme.palette.text.primary,
              "&:hover": {
                borderColor: theme.palette.error.main,
                backgroundColor: theme.palette.error.light + "10",
              },
            }}
          >
            Add to Favorites
          </Button>
        </Box>
      </Card>

      <Grid container spacing={3} sx={{ justifyContent: "space-around" }}>
        {/* Main Content - Left */}
        <Grid item xs={12} md={8} sx={{ width: { xs: "100%", md: "50%" } }}>
          {/* Map */}
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              mb: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: 400,
                backgroundColor: theme.palette.grey[200],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=-87.8,41.8,-87.6,42.0&layer=mapnik&marker=41.9,-87.7`}
                title="Pharmacy Location"
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  backgroundColor: "white",
                  px: 2,
                  py: 1,
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {pharmacy.address}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Contact Information */}
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              p: 3,
              mb: 3,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Phone
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {pharmacy.phone}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <AccessTimeIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Hours
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {pharmacy.hours}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <EmailIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Email
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {pharmacy.email}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        {/* Sidebar - Right */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: "sticky",
              top: 80,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Your Cart */}
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                p: 3,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: theme.palette.text.primary,
                }}
              >
                Your Cart
              </Typography>
              {cart.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Your cart is empty
                </Typography>
              ) : (
                <>
                  {cart.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        gap: 2,
                        mb: 2,
                        pb: 2,
                        borderBottom: `1px solid ${theme.palette.grey[200]}`,
                        alignItems: "flex-start",
                      }}
                    >
                      <Avatar
                        src={item.image}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 0.5 }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Qty: {item.quantity}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: theme.palette.primary.main,
                          }}
                        >
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => handleRemoveFromCart(item.id)}
                        sx={{
                          color: theme.palette.error.main,
                          "&:hover": {
                            backgroundColor: theme.palette.error.light + "20",
                          },
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Subtotal
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      ${subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      py: 1.5,
                      fontWeight: "bold",
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </>
              )}
            </Card>

            {/* Your Order */}
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: theme.palette.text.primary,
                }}
              >
                Your Order from {pharmacy.name}
              </Typography>
              <Box sx={{ position: "relative", pl: 2 }}>
                {/* Preparing */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    <CheckCircleIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      Preparing
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      Your order is being prepared
                    </Typography>
                  </Box>
                  {/* Connecting Line */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 20,
                      top: 40,
                      width: 2,
                      height: 80,
                      backgroundColor: theme.palette.grey[300],
                      zIndex: 1,
                    }}
                  />
                </Box>

                {/* Out for Delivery */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.grey[300],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.text.secondary,
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    <LocalShippingIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Out for Delivery
                    </Typography>
                  </Box>
                  {/* Connecting Line */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 20,
                      top: 40,
                      width: 2,
                      height: 80,
                      backgroundColor: theme.palette.grey[300],
                      zIndex: 1,
                    }}
                  />
                </Box>

                {/* Delivered */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.grey[300],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.text.secondary,
                      flexShrink: 0,
                    }}
                  >
                    <RadioButtonUncheckedIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Delivered
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>
      {/* Available Medications */}
      <Box sx={{ mx: "auto", width: "90%", pt: "80px" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            mb: 2,
            color: theme.palette.text.primary,
            textAlign: "center",
          }}
        >
          Available Medications
        </Typography>
        <Grid
          container
          spacing={2}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {pharmacy.products.map((medication) => (
            <Grid item xs={12} sm={6} md={4} key={medication.id}>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={medication.image}
                  alt={medication.name}
                  sx={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    backgroundColor: theme.palette.grey[200],
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x200?text=No+Image";
                  }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", mb: 1, fontSize: "1rem" }}
                  >
                    {medication.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      ${medication.price}
                    </Typography>
                    <Chip
                      label={medication.stock}
                      color={medication.stockColor}
                      size="small"
                      sx={{
                        "& .MuiChip-label": {
                          fontSize: "0.75rem",
                        },
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(medication)}
                    sx={{
                      backgroundColor: theme.palette.primary.light,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default PharmacyProfile;
