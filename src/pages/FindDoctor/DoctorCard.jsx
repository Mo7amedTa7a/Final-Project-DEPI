import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Rating,
  Box,
  Grid,
} from "@mui/material";

const DoctorCard = ({ doctor, onClick }) => {
  return (
    
  <Grid  size={{ xs:12 ,sm:6, md:3 }}  key={doctor.id}>
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
        textAlign: "center",
        p: 2,
        cursor: "pointer",
      }}
      onClick={() => onClick(doctor.id)}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar
          src={doctor.image}
          alt={doctor.name}
          sx={{ width: 100, height: 100, mb: 1, border: `3px solid` }}
        />
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "text.primary", fontSize: "1.1rem" }}
        >
          Dr. {doctor.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontSize: "0.95rem" }}
        >
          {doctor.specialty}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Rating
            value={doctor.rating}
            precision={0.1}
            readOnly
            size="small"
            sx={{ "& .MuiRating-iconFilled": { color: "#FFA500" } }}
          />
          <Typography
            variant="body2"
            sx={{ color: "text.primary", fontWeight: 500, ml: 0.5 }}
          >
            {doctor.rating}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);
}

export default DoctorCard;
