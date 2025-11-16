import React, { useState } from "react";
import { Box, Grid, Typography, TextField, Button, Paper, Alert, Snackbar } from "@mui/material";
import { useNavigate, Link } from "react-router";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Form inputs check
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // الحصول على array المستخدمين من localStorage
    const storedUsers = localStorage.getItem("Users");
    if (!storedUsers) {
      setError("لا يوجد حساب. يرجى التسجيل أولاً.");
      return;
    }

    try {
      const users = JSON.parse(storedUsers);
      // البحث عن المستخدم بالبريد الإلكتروني وكلمة المرور
      const user = users.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // تسجيل الدخول ناجح - حفظ المستخدم الحالي
        localStorage.setItem("CurrentUser", JSON.stringify(user));
        setSuccessToast(true);
        setError("");
        // توجيه المستخدم حسب الـ role واكتمال الملف الشخصي
        setTimeout(() => {
          if (user.role === "Patient" && !user.patientProfile) {
            navigate("/patient-profile-setup");
          } else if (user.role === "Doctor" && !user.doctorProfile) {
            navigate("/doctor-profile-setup");
          } else if (user.role === "Pharmacy" && !user.pharmacyProfile) {
            navigate("/pharmacy-profile-setup");
          } else {
            navigate("/");
            window.location.reload();
          }
        }, 1500);
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch (error) {
      setError("خطأ في قراءة البيانات");
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left side */}
      <Grid
        size={{ xs: 12, md: 6 }}
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
          Welcome Back!
        </Typography>

        <Typography 
          maxWidth={{ xs: "100%", sm: "400px" }}
          fontSize={{ xs: "14px", sm: "16px" }}
          sx={{ px: { xs: 2, sm: 0 } }}
        >
          Sign in to access your health records, connect with doctors, and manage your pharmacy orders.
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
            Sign In to CureTap
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
            Enter your credentials to access your account.
          </Typography>

          <form onSubmit={handleSubmit}>
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: { xs: 2, sm: 2 }, 
                borderRadius: 2, 
                mb: 2,
                py: { xs: 1.5, sm: 1.25 }
              }}
            >
              Sign In
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
              تم تسجيل الدخول بنجاح!
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
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "inherit", textDecoration: "underline" }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

