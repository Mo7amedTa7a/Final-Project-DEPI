import React from "react";
import {
  Card,
  Box,
  Typography,
  Button,
  Chip,
  CardContent,
  useTheme,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const MedicationCard = ({ medication, handleAddToCart }) => {
    const theme = useTheme();

  return (
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
          e.target.src = "https://placehold.co/600x400"; // استخدام الرابط الصحيح
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
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
          >
            ${medication.price}
          </Typography>
          <Chip
            label={medication.stock}
            color={medication.stockColor}
            size="small"
            sx={{ "& .MuiChip-label": { fontSize: "0.75rem" } }}
          />
        </Box>
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCartIcon />}
          onClick={() => handleAddToCart(medication)}
          sx={{
            backgroundColor: theme.palette.primary.light,
            "&:hover": { backgroundColor: theme.palette.primary.main },
          }}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default MedicationCard;
