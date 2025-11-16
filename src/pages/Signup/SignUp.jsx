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
      <Grid size={{ xs: 12, md: 6 }} 
      sx={{ 
        backgroundColor: "#E8F0FE", 
        display: "flex",
        flexDirection: "column", 
        justifyContent: "center",
        alignItems: "center", 
        textAlign: "center", 
        p: { xs: 3, sm: 4, md: 5, lg: 7 },
        order: { xs: 2, md: 1 }
      }}
      >
        <Typography 
          fontSize={{ xs: "24px", sm: "26px", md: "28px" }} 
          fontWeight="600" 
          color="primary" 
          gutterBottom 
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          CureTap
        </Typography>

        <Typography 
          fontSize={{ xs: "22px", sm: "26px", md: "30px" }} 
          fontWeight="bold" 
          gutterBottom
          sx={{ mb: { xs: 1, md: 2 } }}
        >
          Welcome to the Future of Healthcare 
        </Typography>

        <Typography 
          maxWidth={{ xs: "100%", sm: "400px" }}
          fontSize={{ xs: "14px", sm: "16px" }}
          sx={{ px: { xs: 2, sm: 0 } }}
        >
          Your seamless connection to doctors, pharmacies, and your health
          records, all in one place. 
        </Typography>
      </Grid>

      {/* Right side */}
      <Grid 
        size={{ xs: 12, md: 6 }} 
        component={Paper} 
        elevation={3} 
        square
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center",
          p: { xs: 3, sm: 4, md: 5 },
          order: { xs: 1, md: 2 }
        }}
      >
          
        <Box sx={{ width: "100%", maxWidth: { xs: "100%", sm: "500px" } }}>
          <Typography 
            fontWeight="bold" 
            fontSize={{ xs: "22px", sm: "26px", md: "30px" }}
            textAlign={{ xs: "center", sm: "left" }}
            sx={{ mb: 1 }}
          >
            Create Your CureTap Account
          </Typography>

          <Typography 
            fontSize={{ xs: "14px", sm: "16px", md: "18px" }} 
            gutterBottom 
            sx={{ 
              p: { xs: "5px", sm: "10px" },
              textAlign: { xs: "center", sm: "left" },
              mb: 2
            }}
          >
            Connecting patients,doctors,and pharmacies seamlessly.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField 
              fullWidth 
              label="Full name" 
              name="name" 
              value={formData.name}
              onChange={handleChange} 
              margin="normal" 
              required
              size="medium"
            />

            <TextField 
              fullWidth 
              label="Email" 
              name="email" 
              type="email" 
              value={formData.email}
              onChange={handleChange} 
              margin="normal" 
              required
              size="medium"
            />

            <TextField
              fullWidth 
              label="Password" 
              name="password" 
              type="password" 
              value={formData.password}
              onChange={handleChange} 
              margin="normal" 
              required
              size="medium"
            />

            <Typography 
              fontWeight="700" 
              sx={{ 
                m: { xs: 1.5, sm: 2 },
                fontSize: { xs: "14px", sm: "16px" }
              }}
            >
              Choose your role:
            </Typography>

            <ToggleButtonGroup
              color="primary"
              exclusive
              value={formData.role}
              onChange={handleRoleChange}
              fullWidth
              orientation="horizontal"
              sx={{ 
                mb: 1,
                flexDirection: { xs: "column", sm: "row" },
                "& .MuiToggleButton-root": {
                  flex: { xs: "1 1 100%", sm: "1 1 auto" },
                  minWidth: { xs: "100%", sm: "auto" },
                  mb: { xs: 1, sm: 0 }
                }
              }}
            >
              <ToggleButton 
                value="Patient" 
                sx={{
                  display: "flex", 
                  flexDirection: { xs: "row", sm: "column" },
                  gap: { xs: 1, sm: 0 },
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                <Person color="primary" sx={{ m: { xs: 0, sm: 1 }}} />
                <span>Patient</span>
              </ToggleButton>

              <ToggleButton 
                value="Doctor" 
                sx={{
                  display: "flex", 
                  flexDirection: { xs: "row", sm: "column" },
                  gap: { xs: 1, sm: 0 },
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                <HealingRoundedIcon sx={{ m: { xs: 0, sm: 1 }, color: "green" }} /> 
                <span>Doctor</span>
              </ToggleButton>

              <ToggleButton 
                value="Pharmacy" 
                sx={{
                  display: "flex", 
                  flexDirection: { xs: "row", sm: "column" },
                  gap: { xs: 1, sm: 0 },
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                <VaccinesRoundedIcon sx={{ m: { xs: 0, sm: 1 }, color: "skyblue" }} /> 
                <span>Pharmacy</span>
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: { xs: 2, sm: 1 }, 
                borderRadius: 2, 
                mb: 2,
                py: { xs: 1.5, sm: 1.25 }
              }}
            >
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

          <Typography 
            textAlign="center" 
            sx={{ 
              mt: "3px", 
              fontSize: { xs: "16px", sm: "18px", md: "20px" },
              px: { xs: 1, sm: 0 }
            }}
          >
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


