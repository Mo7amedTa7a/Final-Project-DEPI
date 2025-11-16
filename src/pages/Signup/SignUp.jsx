import React, { useState } from "react";
import { Box,Grid, Typography,TextField,Button,ToggleButton,ToggleButtonGroup,Paper,Snackbar,Alert} from "@mui/material";
import { Person } from "@mui/icons-material";
import VaccinesRoundedIcon from '@mui/icons-material/VaccinesRounded';
import HealingRoundedIcon from '@mui/icons-material/HealingRounded';
import { Link, useNavigate } from "react-router";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [successToast, setSuccessToast] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setFormData((prev) => ({ ...prev, role: newRole }));
      if (error) setError("");
    }

  };

  const handleSubmit = (e) => {
    e.preventDefault();


   // Form inputs check
    if (!formData.name || !formData.email || !formData.password || !formData.role ) {
      setError("Please fill in all fields");
      return
    }

    // الحصول على array المستخدمين من localStorage
    const storedUsers = localStorage.getItem("Users");
    let users = storedUsers ? JSON.parse(storedUsers) : [];

    // التحقق من وجود حساب بنفس البريد الإلكتروني
    const existingUser = users.find(user => user.email === formData.email);
    if (existingUser) {
      setError("هذا الحساب موجود بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.");
      return;
    }

    // إنشاء حساب جديد وإضافته للـ array
    const newUser = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };
    
    users.push(newUser);
    localStorage.setItem("Users", JSON.stringify(users));
    
    // حفظ المستخدم الحالي
    localStorage.setItem("CurrentUser", JSON.stringify(newUser));
    setSuccessToast(true);
    setError("");
    // توجيه المستخدم حسب الـ role
    setTimeout(() => {
      if (newUser.role === "Patient") {
        navigate("/patient-profile-setup");
      } else if (newUser.role === "Doctor") {
        navigate("/doctor-profile-setup");
      } else if (newUser.role === "Pharmacy") {
        navigate("/pharmacy-profile-setup");
      } else {
        navigate("/");
        window.location.reload();
      }
    }, 2000);
  };

  return (
    <Grid container sx={{ minHeight: "100vh"}} >

      {/* Left side */}
      <Grid size={{ mobile: 12, tablet: 6, laptop: 6 }} 
      sx={{ backgroundColor: "#E8F0FE", display: "flex",
      flexDirection: "column", justifyContent: "center",
        alignItems: "center", textAlign: "center", p: "70px",
        }}
      >
        <Typography fontSize="28px" fontWeight="600" color="primary" gutterBottom sx={{ mb: 3 }}>
          CureTap
        </Typography>

        <Typography fontSize="30px" fontWeight="bold" gutterBottom>
          Welcome to the Future of Healthcare </Typography>

        <Typography maxWidth="400px" >
          Your seamless connection to doctors, pharmacies, and your health
          records, all in one place. </Typography>
      </Grid>

      {/* Right side */}
      <Grid p="30px" component={Paper} elevation={3} square
      size={{ mobile: 12, tablet: 6, laptop: 6 }} 
        sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}} >
          
        <Box>
          <Typography fontWeight="bold" fontSize="30px" >
            Create Your CureTap Account
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
              exclusive
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
              sx={{ mt: 1, borderRadius: 2, mb:2 }}>
              Create Account
            </Button>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Snackbar
            open={successToast}
            autoHideDuration={2000}
            onClose={() => setSuccessToast(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert onClose={() => setSuccessToast(false)} severity="success" sx={{ width: "100%" }}>
              تم إنشاء الحساب بنجاح!
            </Alert>
          </Snackbar>

          <Typography textAlign="center" mt="3px" fontSize="20px">
            Already have an account?{" "}
            <Link to="/login" style={{ color: "inherit", textDecoration: "underline" }}>
              Log in
            </Link>
          </Typography>

        </Box>
      </Grid>
    </Grid>
  );
}   


