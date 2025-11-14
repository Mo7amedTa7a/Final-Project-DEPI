import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const OrderTimeline = () => {
    const theme = useTheme();

  return (
    <Box sx={{ position: "relative", pl: 2, pt: 3 }}>
      {/* Timeline stages */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, alignItems: "center" }}>
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
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
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
      </Box>
      
      {/* Connecting Line */}
      <Box
        sx={{
          position: "absolute",
          left: 20,
          top: 50,
          width: 2,
          height: 80,
          backgroundColor: theme.palette.grey[300],
          zIndex: 1,
        }}
      />
      
      {/* Out for Delivery */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, alignItems: "center", position: "relative" }}>
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
            sx={{ fontWeight: "bold", color: theme.palette.text.secondary }}
          >
            Out for Delivery
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            Your order is on the way
          </Typography>
        </Box>
        
        {/* Connecting Line */}
        <Box
          sx={{
            position: "absolute",
            left: 20,
            top: 50,
            width: 2,
            height: 80,
            backgroundColor: theme.palette.grey[300],
            zIndex: 1,
          }}
        />
      </Box>

      {/* Delivered */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
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
            sx={{ fontWeight: "bold", color: theme.palette.text.secondary }}
          >
            Delivered
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            Your order has been delivered
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderTimeline;
