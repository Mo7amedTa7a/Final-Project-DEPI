import React, { useState } from "react";
import { Box,Grid, Typography,TextField,Button,ToggleButton,ToggleButtonGroup,Paper,Alert} from "@mui/material";
import { Padding, Person } from "@mui/icons-material";
import VaccinesRoundedIcon from '@mui/icons-material/VaccinesRounded';
import HealingRoundedIcon from '@mui/icons-material/HealingRounded';
import SpaIcon from '@mui/icons-material/Spa';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setFormData((prev) => ({ ...prev, role: newRole }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();


   // Form inputs check
    if (!formData.name || !formData.email || !formData.password || !formData.role ) {
      setError("Please fill in all fields");
      setResponseMessage("");
      return;
    }

    setResponseMessage("Account created successfully!");
    setError("");
  };

  return (
    <Grid container sx={{ minHeight: "100vh"}}>
      {/* Left side */}
      <Grid item xs={12} md={6} sx={{ backgroundColor: "#E8F0FE", display: "flex",
      flexDirection: "column", justifyContent: "center",
        alignItems: "center", textAlign: "center", p: "70px",
        }}
      >
        <Typography  fontSize="20px" fontWeight="600" gutterBottom>
          <SpaIcon color="primary"/>  MediConnect </Typography>

        <Typography fontSize="30px" fontWeight="bold" gutterBottom>
          Welcome to the Future of Healthcare </Typography>

        <Typography maxWidth="400px" >
          Your seamless connection to doctors, pharmacies, and your health
          records, all in one place. </Typography>
      </Grid>

      {/* Right side */}
      <Grid item p="30px" component={Paper} elevation={3} square
        sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}} >
          
        <Box>
          <Typography fontWeight="bold" fontSize="30px" >
            Create Your MediConnect Account
          </Typography>

          <Typography fontSize="18x" gutterBottom p={"10px"}>
            Connecting patients,doctors,and pharmacies seamlessly.
          </Typography>

          <form onSubmit={handleSubmit} padding="70px">
            <TextField fullWidth label="Full name" name="name" value={formData.name}
              onChange={handleChange} margin="normal" required />

            <TextField fullWidth label="Email" name="email" type="email" value={formData.email}
              onChange={handleChange} margin="normal" required />

            <TextField
            fullWidth label="Password" name="password" type="password" value={formData.password}
              onChange={handleChange} margin="normal" required />

            <Typography fontWeight="700" m={2}>
              Choose your role:
            </Typography>

            <ToggleButtonGroup
              color="primary"
              value={formData.role}
              onChange={handleRoleChange}
              fullWidth
              sx={{ mb: 1 }}
            >
              <ToggleButton value="Patient" sx = {{display:"flex" ,flexDirection :"column" }}>
                <Person color="primary" sx={{ m: 1}} />
                Patient
              </ToggleButton>

              <ToggleButton value="Doctor" sx = {{display:"flex" ,flexDirection :"column" }}>
                <HealingRoundedIcon  sx={{ m: 1 ,color:"green" }} /> Doctor
              </ToggleButton>

              <ToggleButton value="Pharmacy" sx = {{display:"flex" ,flexDirection :"column" }}>
                <VaccinesRoundedIcon  sx={{ m: 1 , color:"skyblue"}} /> Pharmacy
              </ToggleButton>

            </ToggleButtonGroup>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 1, borderRadius: 2, mb:2 }}
            >
              Create Account
            </Button>
          </form>

          {responseMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {responseMessage}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Typography textAlign="center" mt="3px" fontSize="20px">
            Already have an account? <a href="#">Log in</a>
          </Typography>

        </Box>
      </Grid>
    </Grid>
  );
}
