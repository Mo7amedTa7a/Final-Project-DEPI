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
        size={{ mobile: 12, tablet: 6, laptop: 6 }}
        sx={{
          backgroundColor: "#E8F0FE",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          p: "70px",
        }}
      >
        <Typography fontSize="28px" fontWeight="600" color="primary" gutterBottom sx={{ mb: 3 }}>
          CureTap
        </Typography>

        <Typography fontSize="30px" fontWeight="bold" gutterBottom>
          Welcome Back!
        </Typography>

        <Typography maxWidth="400px">
          Sign in to access your health records, connect with doctors, and manage your pharmacy orders.
        </Typography>
      </Grid>

      {/* Right side */}
      <Grid
        p="30px"
        component={Paper}
        elevation={3}
        square
        size={{ mobile: 12, tablet: 6, laptop: 6 }}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography fontWeight="bold" fontSize="30px">
            Sign In to CureTap
          </Typography>

          <Typography fontSize="18px" gutterBottom p={"10px"}>
            Enter your credentials to access your account.
          </Typography>

          <form onSubmit={handleSubmit} padding="70px">
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
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
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, borderRadius: 2, mb: 2 }}
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

          <Typography textAlign="center" mt="3px" fontSize="20px">
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

