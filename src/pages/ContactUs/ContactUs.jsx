import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  useTheme,
  Alert,
  Snackbar,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const ContactUs = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [successToast, setSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would typically send the form data to your backend
      console.log("Form submitted:", formData);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      setSuccessToast(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 30 }} />,
      title: "Email",
      content: "info@curetap.com",
      link: "mailto:info@curetap.com",
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 30 }} />,
      title: "Phone Number",
      content: "+20 123 456 7890",
      link: "tel:+201234567890",
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 30 }} />,
      title: "Address",
      content: "Cairo, Egypt",
      link: null,
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 30 }} />,
      title: "Working Hours",
      content: "24/7 - Available around the clock",
      link: null,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        py: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 4, sm: 6 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main,
              mb: 2,
              fontSize: { xs: "2rem", sm: "3rem", md: "3.5rem" },
            }}
          >
            Contact Us
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: "700px",
              mx: "auto",
              fontSize: { xs: "1rem", sm: "1.25rem" },
              lineHeight: 1.8,
            }}
          >
            We're here to help! If you have any questions or need support, feel free to contact us.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: "sticky", top: 100 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.primary.main,
                  mb: 3,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                Contact Information
              </Typography>
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                      <Box
                        sx={{
                          color: theme.palette.primary.main,
                          mt: 0.5,
                        }}
                      >
                        {info.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: "bold",
                            mb: 0.5,
                            color: "text.primary",
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          }}
                        >
                          {info.title}
                        </Typography>
                        {info.link ? (
                          <Typography
                            component="a"
                            href={info.link}
                            sx={{
                              color: theme.palette.primary.main,
                              textDecoration: "none",
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            {info.content}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            }}
                          >
                            {info.content}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    color: theme.palette.primary.main,
                    mb: 3,
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  Send Us a Message
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        required
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        required
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        error={!!errors.subject}
                        helperText={errors.subject}
                        required
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        error={!!errors.message}
                        helperText={errors.message}
                        required
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting}
                        startIcon={<SendIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          "&:disabled": {
                            backgroundColor: theme.palette.action.disabledBackground,
                          },
                        }}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
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
          autoHideDuration={4000}
          onClose={() => setSuccessToast(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSuccessToast(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            Your message has been sent successfully! We will contact you soon.
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ContactUs;

