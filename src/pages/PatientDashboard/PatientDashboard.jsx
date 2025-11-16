import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  upcomingAppointments,
  recentOrders,
  queueData,
} from "../../Data/PatientDashboardData";
import doctorImage from "../../assets/doctor.svg";

const PatientDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // الحصول على اسم المستخدم من localStorage
    const currentUser = localStorage.getItem("CurrentUser");
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        setUserName(userData.name || "Patient");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Shipped":
        return "warning";
      case "Processing":
        return "info";
      default:
        return "default";
    }
  };

    return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl" sx={{ mx: "auto", px: { xs: 1, sm: 2 } }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: { xs: 3, sm: 4 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#1E88E5",
            fontSize: { xs: "1.5rem", sm: "1.875rem", md: "2.125rem" },
            textAlign: { xs: "center", sm: "left" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Welcome back, {userName || "Patient"}!
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth={isMobile}
          sx={{
            backgroundColor: "#1E88E5",
            color: "white",
            px: { xs: 2, sm: 3 },
            py: { xs: 1.25, sm: 1.5 },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: "0.875rem", sm: "1rem" },
            "&:hover": {
              backgroundColor: "#005CB2",
            },
          }}
        >
          Book New Appointment
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ justifyContent: "center" }}>
        {/* Right Column - Live Queue Tracker (يظهر أولاً في الموبايل) */}
        <Grid 
          size={{ xs: 12, lg: 4 }}
          sx={{
            order: { xs: 1, lg: 2 },
          }}
        >
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              position: { lg: "sticky" },
              top: { lg: 100 },
              backgroundColor: "white",
              border: "1px solid #E0E0E0",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mb: 1.5,
                  color: "#1C1C1C",
                  fontSize: "1.25rem",
                }}
              >
                Live Queue Tracker
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#555555",
                  mb: 4,
                  fontSize: "0.875rem",
                }}
              >
                For your appointment with {queueData.doctorName}.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: { xs: 3, sm: 4 },
                  gap: { xs: 1, sm: 2 },
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                    flex: 1,
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#555555",
                      mb: { xs: 1, sm: 1.5 },
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      fontWeight: 500,
                    }}
                  >
                    Currently Serving
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: "bold",
                      color: "#1E88E5",
                      fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                    }}
                  >
                    {queueData.currentlyServing}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    textAlign: "center",
                    flex: 1,
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#555555",
                      mb: { xs: 1, sm: 1.5 },
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      fontWeight: 500,
                    }}
                  >
                    Your Number
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: "bold",
                      color: "#1E88E5",
                      fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                    }}
                  >
                    {queueData.yourNumber}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#E3F2FD",
                  borderRadius: 2,
                  p: { xs: 1.5, sm: 2 },
                  mb: { xs: 2, sm: 3 },
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#1E88E5",
                    fontWeight: 600,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  Estimated wait time: {queueData.estimatedWaitTime} minutes
                </Typography>
              </Box>

              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <LinearProgress
                  variant="determinate"
                  value={queueData.progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#E0E0E0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#1E88E5",
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: "#555555",
                  textAlign: "center",
                  fontStyle: "italic",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                }}
              >
                Please be ready. You will be notified when it's your turn.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Left Column - Main Content */}
        <Grid 
          size={{ xs: 12, lg: 8 }}
          sx={{
            order: { xs: 2, lg: 1 },
            maxWidth: { lg: "100%" },
          }}
        >
          {/* Upcoming Appointments Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
                color: "#1C1C1C",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Upcoming Appointments
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}>
              {upcomingAppointments.map((appointment) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={appointment.id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: { xs: "none", sm: "translateY(-4px)" },
                        boxShadow: { xs: "0 2px 10px rgba(0,0,0,0.05)", sm: "0 4px 20px rgba(0,0,0,0.1)" },
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        <Avatar
                          src={doctorImage}
                          alt={appointment.doctorName}
                          sx={{
                            width: { xs: 70, sm: 80 },
                            height: { xs: 70, sm: 80 },
                            mb: { xs: 1.5, sm: 2 },
                            border: "3px solid #E3F2FD",
                          }}
                        />
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            color: "#1C1C1C",
                          }}
                        >
                          {appointment.doctorName}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#555555",
                            mb: 1.5,
                          }}
                        >
                          {appointment.specialty}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 0.5,
                            justifyContent: "center",
                          }}
                        >
                          <CalendarTodayIcon
                            sx={{ fontSize: 16, color: "#555555" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {appointment.date}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 2,
                            justifyContent: "center",
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 16, color: "#555555" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {appointment.time}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            textTransform: "none",
                            borderColor: "#E0E0E0",
                            color: "#555555",
                            "&:hover": {
                              borderColor: "#1E88E5",
                              backgroundColor: "#E3F2FD",
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Recent Medicine Orders Section */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
                color: "#1C1C1C",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Recent Medicine Orders
            </Typography>
            
            {/* Mobile View - Cards */}
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              {recentOrders.map((order, index) => (
                <Card
                  key={index}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.7rem",
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          ORDER ID
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "#1C1C1C",
                          }}
                        >
                          {order.orderId}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          borderRadius: 1,
                          fontSize: "0.7rem",
                          height: "24px",
                        }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#555555",
                            fontSize: "0.7rem",
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          DATE
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.875rem",
                            color: "#1C1C1C",
                          }}
                        >
                          {order.date}
                        </Typography>
                      </Box>
                      <Button
                        variant="text"
                        size="small"
                        sx={{
                          textTransform: "none",
                          color: "#1E88E5",
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          px: 1.5,
                          "&:hover": {
                            backgroundColor: "#E3F2FD",
                          },
                        }}
                      >
                        Track Order
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Desktop View - Table */}
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                display: { xs: "none", sm: "block" },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>ORDER ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#F9FAFB",
                        },
                      }}
                    >
                      <TableCell sx={{ fontSize: "0.875rem" }}>{order.orderId}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>{order.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="text"
                          size="small"
                          sx={{
                            textTransform: "none",
                            color: "#1E88E5",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            "&:hover": {
                              backgroundColor: "#E3F2FD",
                            },
                          }}
                        >
                          Track Order
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

      </Grid>
      </Container>
    </Box>
    );
};

export default PatientDashboard;
