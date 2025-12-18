import React from "react";
import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";
import Grid from '@mui/material/Grid';
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";

const ContactInfo = ({ pharmacy }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        mb: 3,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
          <BusinessIcon />
          Contact Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F9FAFB",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#F0F4F8",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "50%",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 40,
                  height: 40,
                }}
              >
                <PhoneIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  Phone Number
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mt: 0.5,
                    color: theme.palette.text.primary,
                  }}
                >
                  {pharmacy.phone || "Not available"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F9FAFB",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#F0F4F8",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "50%",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 40,
                  height: 40,
                }}
              >
                <EmailIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  Email Address
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mt: 0.5,
                    color: theme.palette.text.primary,
                    wordBreak: "break-word",
                  }}
                >
                  {pharmacy.email || "Not available"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F9FAFB",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#F0F4F8",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "50%",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 40,
                  height: 40,
                }}
              >
                <AccessTimeIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  Operating Hours
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mt: 0.5,
                    color: theme.palette.text.primary,
                  }}
                >
                  {pharmacy.hours || "Not available"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F9FAFB",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#F0F4F8",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "50%",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 40,
                  height: 40,
                }}
              >
                <LocationOnIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  Address
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mt: 0.5,
                    color: theme.palette.text.primary,
                  }}
                >
                  {pharmacy.address || "Not available"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F9FAFB",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#F0F4F8",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "50%",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 40,
                  height: 40,
                }}
              >
                <LocationOnIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  Location
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mt: 0.5,
                    color: theme.palette.text.primary,
                  }}
                >
                  {pharmacy.location || "Not available"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ContactInfo;
