import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  IconButton,
  Grid,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import OrderTimeline from "../PharmacyProfile/OrderTimeline";

const CartPage = () => {
  const theme = useTheme();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("Cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }

    // Listen for cart changes
    const handleStorageChange = () => {
      const updatedCart = localStorage.getItem("Cart");
      if (updatedCart) {
        try {
          setCart(JSON.parse(updatedCart));
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      } else {
        setCart([]);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleRemoveFromCart = (itemId) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem("Cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  };

  const handleUpdateQuantity = (itemId, change) => {
    const updatedCart = cart.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("Cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Group cart items by pharmacy
  const cartByPharmacy = cart.reduce((acc, item) => {
    const pharmacyName = item.pharmacyName || "Unknown Pharmacy";
    if (!acc[pharmacyName]) {
      acc[pharmacyName] = [];
    }
    acc[pharmacyName].push(item);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 4,
          color: theme.palette.primary.main,
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        Your Cart
      </Typography>

      <Grid container spacing={3}>
        {/* Left Side - Cart Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          {cart.length === 0 ? (
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                p: 4,
                textAlign: "center",
              }}
            >
              <ShoppingCartIcon
                sx={{
                  fontSize: 80,
                  color: theme.palette.grey[400],
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 1,
                }}
              >
                Your cart is empty
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                }}
              >
                Add items to your cart to see them here
              </Typography>
            </Card>
          ) : (
            Object.entries(cartByPharmacy).map(([pharmacyName, items]) => (
              <Card
                key={pharmacyName}
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  mb: 3,
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    color: theme.palette.primary.main,
                  }}
                >
                  {pharmacyName}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 2,
                      pb: 2,
                      borderBottom: `1px solid ${theme.palette.grey[200]}`,
                      alignItems: "flex-start",
                      "&:last-child": {
                        borderBottom: "none",
                        mb: 0,
                        pb: 0,
                      },
                    }}
                  >
                    <Avatar
                      src={item.image}
                      variant="rounded"
                      sx={{ width: 80, height: 80 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          sx={{
                            border: `1px solid ${theme.palette.grey[300]}`,
                            width: 28,
                            height: 28,
                          }}
                        >
                          <Typography variant="body2">-</Typography>
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 30, textAlign: "center" }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          sx={{
                            border: `1px solid ${theme.palette.grey[300]}`,
                            width: 28,
                            height: 28,
                          }}
                        >
                          <Typography variant="body2">+</Typography>
                        </IconButton>
                      </Box>
                      <Typography
                        variant="h6"
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
              </Card>
            ))
          )}
        </Grid>

        {/* Right Side - Order Summary & Timeline */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              position: { md: "sticky" },
              top: { md: 100 },
            }}
          >
            {/* Order Summary */}
            {cart.length > 0 && (
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  mb: 3,
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
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Subtotal
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ${subtotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Shipping
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    $5.00
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                    ${(subtotal + 5).toFixed(2)}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    py: 1.5,
                    fontWeight: "bold",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Card>
            )}

            {/* Order Timeline */}
            {cart.length > 0 && (
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
                  Order Status
                </Typography>
                <OrderTimeline theme={theme} />
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;

