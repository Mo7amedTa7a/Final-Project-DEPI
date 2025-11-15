import React from "react";
import { Box, Typography, Button, Avatar, useTheme } from "@mui/material";
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";

const PharmacyHeader = ({ pharmacy, isFavorite, toggleFavorite }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        p:2,
        mb:3,
        borderRadius:"1rem",
        flexDirection: { xs: "column", md: "row" },
        background: theme.palette.primary.contrastText,
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
        onClick={toggleFavorite}
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
  );
};

export default PharmacyHeader;
