import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  Container,
  useTheme,
  Typography,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import PharmacyHeader from "./PharmacyHeader";
import ContactInfo from "./ContactInfo";
import Cart from "./Cart";
import MedicationCard from "./MedicationCard";
import OrderTimeline from "./OrderTimeline";
import Data from "../../Data/Pharmacies.json";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PharmacyProfile = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [cart, setCart] = useState([]);
  const pharmacy = Data.find((p) => p.id === Number(id)) || Data[0];

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
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

      <Grid container spacing={3}>
        {/* Left Side */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Map */}
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: 400,
                backgroundColor: theme.palette.grey[200],
              }}
            >
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={
                  "https://www.openstreetmap.org/export/embed.html?bbox=-87.8,41.8,-87.6,42.0&layer=mapnik&marker=41.9,-87.7"
                }
                title="Pharmacy Location"
              />
            </Box>
          </Card>

          {/* Contact Information */}
          <ContactInfo pharmacy={pharmacy} theme={theme} />
        </Grid>

        {/* Right Sidebar */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              position: "sticky",
              top: 80,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Cart */}
            <Cart
              cart={cart}
              handleRemoveFromCart={handleRemoveFromCart}
              subtotal={subtotal}
              theme={theme}
            />

            {/* Order Timeline */}
            <OrderTimeline theme={theme} />
          </Box>
        </Grid>
      </Grid>

      {/* Available Medications */}
      <Box sx={{ mx: "auto", width: "90%", pt: "80px" }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}
        >
          Available Medications
        </Typography>
        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          {pharmacy.products.map((medication) => (
            <Grid size={{ xs: 12, sm: 6 ,md:4}} key={medication.id}>
              <MedicationCard
                medication={medication}
                handleAddToCart={handleAddToCart}
                theme={theme}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default PharmacyProfile;
