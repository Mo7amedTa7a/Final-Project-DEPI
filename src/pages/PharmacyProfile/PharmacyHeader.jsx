import React from "react";
import { Box, Typography, Button, Card, CardContent, useTheme, Chip } from "@mui/material";
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import Rating from "@mui/material/Rating";

const PharmacyHeader = ({ pharmacy, isFavorite, toggleFavorite }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        mb: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.main}05 100%)`,
        border: `1px solid ${theme.palette.primary.light}30`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Pharmacy Icon - Same as Home page */}
          <Box
            sx={{
              width: { xs: 100, sm: 120, md: 140 },
              height: { xs: 100, sm: 120, md: 140 },
              borderRadius: "16px",
              backgroundColor: theme.palette.primary.light,
              border: `4px solid ${theme.palette.primary.main}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
            }}
          >
            <LocalPharmacyIcon
              sx={{
                color: theme.palette.primary.contrastText || theme.palette.primary.main,
                fontSize: { xs: 50, sm: 60, md: 70 },
              }}
            />
          </Box>
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "start" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, justifyContent: { xs: "center", md: "flex-start" } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  color: theme.palette.text.primary,
                }}
              >
                {pharmacy.name || pharmacy.pharmacyName}
              </Typography>
              {pharmacy.shortName && (
                <Chip
                  label={pharmacy.shortName}
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 1,
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
            >
              {pharmacy.address || "Address not available"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: { xs: "center", md: "flex-start" } }}>
              <Rating value={pharmacy.rating || 4.5} readOnly precision={0.5} size="small" />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                }}
              >
                ({pharmacy.rating || 4.5})
              </Typography>
            </Box>
          </Box>
          <Button
            variant={isFavorite ? "contained" : "outlined"}
            startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={toggleFavorite}
            sx={{
              borderColor: isFavorite ? "transparent" : theme.palette.error.main,
              backgroundColor: isFavorite ? theme.palette.error.main : "transparent",
              color: isFavorite ? "white" : theme.palette.error.main,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: isFavorite ? theme.palette.error.dark : theme.palette.error.light + "20",
                borderColor: theme.palette.error.main,
              },
            }}
          >
            {isFavorite ? "Favorited" : "Add to Favorites"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PharmacyHeader;
