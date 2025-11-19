import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, Link } from "react-router";
import userImage from "../../assets/user.svg";

const Account = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [successToast, setSuccessToast] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // الحصول على بيانات المستخدم من localStorage
    const currentUser = localStorage.getItem("CurrentUser");
    if (currentUser) {
      try {
        const parsedData = JSON.parse(currentUser);
        setUserData(parsedData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // التحقق من الحقول
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    // التحقق من كلمة المرور الحالية
    if (passwordData.currentPassword !== userData.password) {
      setError("Current password is incorrect");
      return;
    }

    // التحقق من تطابق كلمة المرور الجديدة
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    // التحقق من أن كلمة المرور الجديدة مختلفة عن القديمة
    if (passwordData.newPassword === passwordData.currentPassword) {
      setError("New password must be different from current password");
      return;
    }

    // تحديث كلمة المرور
    const users = JSON.parse(localStorage.getItem("Users") || "[]");
    const updatedUser = { ...userData, password: passwordData.newPassword };
    
    // تحديث المستخدم في array المستخدمين
    const updatedUsers = users.map((user) =>
      user.email === updatedUser.email ? updatedUser : user
    );
    localStorage.setItem("Users", JSON.stringify(updatedUsers));
    
    // تحديث المستخدم الحالي
    localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));
    setUserData(updatedUser);
    
    setSuccessToast(true);
    setError("");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (!userData) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Container maxWidth="md" sx={{ mx: "auto" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#1E88E5",
            mb: 4,
            textAlign: { xs: "center", sm: "left" },
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
          }}
        >
          Account Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Information Card */}
          <Grid size={12}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                    flexDirection: { xs: "column", sm: "row" },
                    textAlign: { xs: "center", sm: "left" },
                  }}
                >
                  <Avatar
                    src={
                      userData.patientProfile?.profilePicture ||
                      userData.doctorProfile?.profilePicture ||
                      userData.pharmacyProfile?.profilePicture ||
                      userImage
                    }
                    alt={userData.name}
                    sx={{
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      border: "4px solid #E3F2FD",
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        color: "#1C1C1C",
                        mb: 0.5,
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      }}
                    >
                      {userData.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#555555",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      {userData.email}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1E88E5",
                        mt: 1,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      {userData.role}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <Button
                    component={Link}
                    to={
                      userData.role === "Patient"
                        ? "/patient-profile-setup"
                        : userData.role === "Doctor"
                        ? "/doctor-profile-setup"
                        : "/pharmacy-profile-setup"
                    }
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{
                      textTransform: "none",
                      borderColor: "#1E88E5",
                      color: "#1E88E5",
                      "&:hover": {
                        borderColor: "#005CB2",
                        backgroundColor: "#E3F2FD",
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ color: "#1E88E5", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#555555",
                          fontSize: "0.75rem",
                        }}
                      >
                        Full Name
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      value={userData.name}
                      disabled
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <EmailIcon sx={{ color: "#1E88E5", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#555555",
                          fontSize: "0.75rem",
                        }}
                      >
                        Email Address
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      value={userData.email}
                      disabled
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        },
                      }}
                    />
                  </Grid>

                  {/* Patient Profile Fields */}
                  {userData.patientProfile && (
                    <>
                      <Grid size={12}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#555555",
                              fontSize: "0.75rem",
                            }}
                          >
                            Gender
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth
                          value={userData.patientProfile.gender || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#555555",
                              fontSize: "0.75rem",
                            }}
                          >
                            Age
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth
                          value={userData.patientProfile.age || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Doctor Profile Fields */}
                  {userData.doctorProfile && (
                    <>
                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Specialty
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.doctorProfile.specialty || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Experience
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.doctorProfile.experience || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Education
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.doctorProfile.education || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Video Call Price (USD)
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={userData.doctorProfile.videoCallPrice || ""}
                          onChange={(e) => {
                            const updatedUser = {
                              ...userData,
                              doctorProfile: {
                                ...userData.doctorProfile,
                                videoCallPrice: e.target.value,
                              },
                            };
                            setUserData(updatedUser);
                            localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));
                            const users = JSON.parse(localStorage.getItem("Users") || "[]");
                            const updatedUsers = users.map((user) =>
                              user.email === updatedUser.email ? updatedUser : user
                            );
                            localStorage.setItem("Users", JSON.stringify(updatedUsers));
                          }}
                          variant="outlined"
                          placeholder="Enter video call price"
                          inputProps={{ min: 0 }}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                          }}
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          On-site Visit Price (USD)
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={userData.doctorProfile.onsitePrice || ""}
                          onChange={(e) => {
                            const updatedUser = {
                              ...userData,
                              doctorProfile: {
                                ...userData.doctorProfile,
                                onsitePrice: e.target.value,
                              },
                            };
                            setUserData(updatedUser);
                            localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));
                            const users = JSON.parse(localStorage.getItem("Users") || "[]");
                            const updatedUsers = users.map((user) =>
                              user.email === updatedUser.email ? updatedUser : user
                            );
                            localStorage.setItem("Users", JSON.stringify(updatedUsers));
                          }}
                          variant="outlined"
                          placeholder="Enter on-site visit price"
                          inputProps={{ min: 0 }}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                          }}
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          General Consultation Fee (USD) - Optional
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={userData.doctorProfile.consultationFee || ""}
                          onChange={(e) => {
                            const updatedUser = {
                              ...userData,
                              doctorProfile: {
                                ...userData.doctorProfile,
                                consultationFee: e.target.value,
                              },
                            };
                            setUserData(updatedUser);
                            localStorage.setItem("CurrentUser", JSON.stringify(updatedUser));
                            const users = JSON.parse(localStorage.getItem("Users") || "[]");
                            const updatedUsers = users.map((user) =>
                              user.email === updatedUser.email ? updatedUser : user
                            );
                            localStorage.setItem("Users", JSON.stringify(updatedUsers));
                          }}
                          variant="outlined"
                          placeholder="Enter general consultation fee"
                          inputProps={{ min: 0 }}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                          }}
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Address
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.doctorProfile.address || "Not set"}
                          disabled
                          multiline
                          rows={2}
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Pharmacy Profile Fields */}
                  {userData.pharmacyProfile && (
                    <>
                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Pharmacy Name
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.pharmacyProfile.pharmacyName || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Short Name
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.pharmacyProfile.shortName || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Phone Number
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.pharmacyProfile.phoneNumber || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Location
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.pharmacyProfile.location || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Address
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.pharmacyProfile.address || "Not set"}
                          disabled
                          multiline
                          rows={2}
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.75rem",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          Operating Hours
                        </Typography>
                        <TextField
                          fullWidth
                          value={userData.pharmacyProfile.hours || "Not set"}
                          disabled
                          variant="outlined"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Change Password Card */}
          <Grid size={12}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                  <LockIcon sx={{ color: "#1E88E5" }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#1C1C1C",
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                    }}
                  >
                    Change Password
                  </Typography>
                </Box>

                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          },
                        }}
                      />
                    </Grid>

                    {error && (
                      <Grid size={12}>
                        <Alert severity="error" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {error}
                        </Alert>
                      </Grid>
                    )}

                    <Grid size={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                          backgroundColor: "#1E88E5",
                          color: "white",
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          "&:hover": {
                            backgroundColor: "#005CB2",
                          },
                        }}
                      >
                        Update Password
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={successToast}
          autoHideDuration={2000}
          onClose={() => setSuccessToast(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setSuccessToast(false)} severity="success" sx={{ width: "100%" }}>
            Password updated successfully!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Account;

