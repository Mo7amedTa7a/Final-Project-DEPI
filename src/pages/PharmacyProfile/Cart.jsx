import React from "react";
import {
  Card,
  Typography,
  Button,
  Box,
  Avatar,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Cart = ({ cart, handleRemoveFromCart, subtotal }) => {
const theme = useTheme();
  return (
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
        sx={{ fontWeight: "bold", mb: 2, color: theme.palette.text.primary }}
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
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
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
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
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
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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
  );
};

export default Cart;
