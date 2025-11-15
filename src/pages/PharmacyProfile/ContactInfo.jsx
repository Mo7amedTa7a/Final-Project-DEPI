import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import Grid from '@mui/material/Grid';
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";

const ContactInfo = ({ pharmacy }) => {
  const theme = useTheme();
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
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
    </Box>
  );
};

export default ContactInfo;
