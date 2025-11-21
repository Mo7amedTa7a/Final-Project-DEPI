import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import FirestoreService from "../../services/FirestoreService";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  CreditCard as CreditCardIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import userImage from "../../assets/user.svg";
import doctorImage from "../../assets/doctor.svg";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // "products" or "appointment"
  
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    if (!user || !user.email) {
      // User not logged in, redirect to login
      navigate("/login", { replace: true });
      return;
    }
    setCurrentUser(user);

    if (type === "products") {
      // Load cart data
      const cart = JSON.parse(localStorage.getItem("Cart") || "[]");
      if (cart.length === 0) {
        navigate("/cart");
        return;
      }
      
      const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
      const shipping = 5;
      const total = subtotal + shipping;

      setOrderData({
        type: "products",
        items: cart,
        subtotal: Number(subtotal) || 0,
        shipping: Number(shipping) || 0,
        total: Number(total) || 0,
      });
    } else if (type === "appointment") {
      // Load appointment data from sessionStorage or URL params
      const appointmentData = JSON.parse(sessionStorage.getItem("pendingAppointment") || "{}");
      if (!appointmentData.doctorId) {
        navigate("/");
        return;
      }

      setOrderData({
        type: "appointment",
        ...appointmentData,
        price: typeof appointmentData.price === 'string' 
          ? parseFloat(appointmentData.price) || 0 
          : (appointmentData.price || 0),
      });
    } else {
      navigate("/");
    }
  }, [type, navigate]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryDateChange = (e) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleCvvChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    if (v.length <= 3) {
      setCvv(v);
    }
  };

  const validateForm = () => {
    if (paymentMethod === "card") {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
        alert("Please enter a valid card number");
        return false;
      }
      if (!cardName.trim()) {
        alert("Please enter cardholder name");
        return false;
      }
      if (!expiryDate || expiryDate.length < 5) {
        alert("Please enter a valid expiry date");
        return false;
      }
      if (!cvv || cvv.length < 3) {
        alert("Please enter a valid CVV");
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setBookingError(null);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      if (orderData.type === "products") {
        // Save order to Firebase and localStorage
        const FirestoreService = (await import("../../services/FirestoreService")).default;
        
        // Group items by pharmacy
        const itemsByPharmacy = {};
        orderData.items.forEach((item) => {
          // Use pharmacyId (email) as primary identifier, fallback to pharmacyName
          const pharmacyId = item.pharmacyId || item.pharmacyName;
          const pharmacyName = item.pharmacyName || item.pharmacyId;
          if (!itemsByPharmacy[pharmacyId]) {
            itemsByPharmacy[pharmacyId] = {
              items: [],
              pharmacyId: pharmacyId,
              pharmacyName: pharmacyName,
            };
          }
          itemsByPharmacy[pharmacyId].items.push(item);
        });

        // Create separate order for each pharmacy
        const orderPromises = [];
        const orderIds = [];
        
        for (const [pharmacyId, pharmacyData] of Object.entries(itemsByPharmacy)) {
          const pharmacyItems = pharmacyData.items;
          const pharmacyTotal = pharmacyItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const order = {
            id: Date.now() + Math.random(), // Temporary ID, will be replaced by Firebase
            patientId: currentUser.email,
            patientName: currentUser.patientProfile?.fullName || currentUser.name,
            pharmacyId: pharmacyId, // Use pharmacyId (email) as primary identifier
            pharmacyName: pharmacyData.pharmacyName, // Also store pharmacyName for display
            items: pharmacyItems,
            total: pharmacyTotal,
            status: "pending",
            date: new Date().toISOString(),
            paymentMethod,
            paymentStatus: "paid",
          };
          
          // Save to Firebase
          try {
            const savedOrder = await FirestoreService.addOrder(order);
            order.id = savedOrder.id || order.id;
            orderIds.push(order.id);
          } catch (error) {
            console.error("❌ Error saving order to Firebase:", error);
            // Continue with localStorage fallback
          }
          
          // Also save to localStorage for backward compatibility
          const orders = JSON.parse(localStorage.getItem("Orders") || "[]");
          orders.push(order);
          localStorage.setItem("Orders", JSON.stringify(orders));
          
          orderPromises.push(order);
        }

        // Create notification for each pharmacy in Firebase
        for (const order of orderPromises) {
          const pharmacyNotification = {
            type: "order",
            title: "New Order Received",
            message: `${currentUser.patientProfile?.fullName || currentUser.name} placed an order`,
            pharmacyId: order.pharmacyId,
            orderId: order.id,
            read: false,
          };
          
          // Save to Firebase
          try {
            await FirestoreService.addNotification(pharmacyNotification);
          } catch (error) {
            console.error("❌ Error saving notification to Firebase:", error);
          }
          
          // Also save to localStorage for backward compatibility
          const notifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
          notifications.push({ ...pharmacyNotification, id: Date.now() + Math.random(), date: new Date().toISOString() });
          localStorage.setItem("Notifications", JSON.stringify(notifications));
        }

        // Clear cart
        localStorage.removeItem("Cart");
        window.dispatchEvent(new Event("storage"));

        // Save transaction to pharmacy wallet in Firebase
        for (const order of orderPromises) {
          order.items.forEach((item) => {
            const transaction = {
              type: "income",
              amount: item.price * item.quantity,
              description: `Order from ${currentUser.patientProfile?.fullName || currentUser.name}`,
              pharmacyId: order.pharmacyId,
              orderId: order.id,
              status: "completed",
            };
            
            // Save to Firebase
            try {
              FirestoreService.addWalletTransaction(transaction);
            } catch (error) {
              console.error("❌ Error saving wallet transaction to Firebase:", error);
            }
            
            // Also save to localStorage for backward compatibility
            const walletTransactions = JSON.parse(localStorage.getItem("WalletTransactions") || "[]");
            walletTransactions.push({ ...transaction, id: Date.now() + Math.random(), date: new Date().toISOString() });
            localStorage.setItem("WalletTransactions", JSON.stringify(walletTransactions));
          });
        }

        // Navigate based on user role
        const userRole = currentUser?.role;
        if (userRole === "Pharmacy" || userRole === "Doctor") {
          navigate("/wallet?success=true&type=order");
        } else {
          // For patients, navigate to orders page
          navigate("/orders?success=true&type=order");
        }
      } else if (orderData.type === "appointment") {
        // Ensure doctorId is the doctor's email
        const doctorEmail = orderData.doctorId; // Should be email from DoctorProfile
        
        // Check if appointment slot is already booked
        const existingAppointments = await FirestoreService.getAppointments({
          doctorId: doctorEmail,
          status: "confirmed",
        });
        
        // Also check localStorage
        const localAppointments = JSON.parse(localStorage.getItem("Appointments") || "[]");
        const allExistingAppointments = [...existingAppointments, ...localAppointments];
        
        // Check for duplicate appointment (same doctor, date, and time)
        const isDuplicate = allExistingAppointments.some(apt => {
          const sameDoctor = apt.doctorId === doctorEmail || 
                           String(apt.doctorId) === String(doctorEmail) ||
                           apt.doctorId?.toLowerCase() === doctorEmail?.toLowerCase();
          const sameDate = apt.date === orderData.date;
          const sameTime = apt.time === orderData.time;
          // Exclude cancelled or completed appointments from duplicate check
          const isActive = apt.status !== "cancelled" && apt.queueStatus !== "completed";
          
          return sameDoctor && sameDate && sameTime && isActive;
        });
        
        if (isDuplicate) {
          setBookingError("هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.");
          setIsProcessing(false);
          return;
        }
        
        // Save appointment to Firebase
        const bookingTime = new Date().toISOString();
        const appointment = {
          patientId: currentUser.email,
          patientName: currentUser.patientProfile?.fullName || currentUser.name,
          doctorId: doctorEmail, // Use doctor's email as ID
          doctorName: orderData.doctorName,
          doctorSpecialty: orderData.doctorSpecialty, // Added for consistency
          doctorAvatar: orderData.doctorAvatar, // Added for consistency
          appointmentType: orderData.appointmentType,
          date: orderData.date,
          time: orderData.time,
          reason: orderData.reason,
          price: Number(orderData.price) || 0,
          status: "confirmed",
          paymentStatus: "paid",
          // Queue tracking fields
          queueStatus: "waiting", // waiting, in-progress, completed
          bookingTime: bookingTime, // Time when appointment was booked (for queue ordering)
        };
        
        // Video call meeting fields (only for video appointments)
        // Only add these fields for video appointments to avoid undefined values in Firebase
        if (orderData.appointmentType === "video") {
          appointment.meetingStatus = "waiting"; // waiting, started, joined
          // meetingLink will be added when doctor starts the meeting
        }
        
        // Remove undefined values before saving to Firebase
        const cleanAppointment = Object.fromEntries(
          Object.entries(appointment).filter(([_, value]) => value !== undefined)
        );
        
        // Save to Firebase
        const savedAppointment = await FirestoreService.addAppointment(cleanAppointment);
        const appointmentId = savedAppointment.id || Date.now().toString();
        
        // Also save to localStorage for backward compatibility
        // Use cleanAppointment but ensure meetingStatus is set for video appointments
        const appointmentForLocalStorage = {
          ...cleanAppointment,
          id: appointmentId,
          dateCreated: new Date().toISOString(),
          bookingTime: bookingTime, // Ensure bookingTime is included
        };
        
        // Ensure meetingStatus is set for video appointments in localStorage
        if (orderData.appointmentType === "video" && !appointmentForLocalStorage.meetingStatus) {
          appointmentForLocalStorage.meetingStatus = "waiting";
        }
        
        const appointments = JSON.parse(localStorage.getItem("Appointments") || "[]");
        appointments.push(appointmentForLocalStorage);
        localStorage.setItem("Appointments", JSON.stringify(appointments));
        window.dispatchEvent(new Event("storage"));

        // Create notification for doctor in Firebase
        const doctorNotification = {
          type: "appointment",
          title: "New Appointment Booking",
          message: `${currentUser.patientProfile?.fullName || currentUser.name} booked a ${orderData.appointmentType === "video" ? "video call" : "on-site"} appointment`,
          doctorId: orderData.doctorId,
          appointmentId: appointmentId,
          read: false,
        };
        
        // Save to Firebase
        await FirestoreService.addNotification(doctorNotification);
        
        // Also save to localStorage for backward compatibility
        const notifications = JSON.parse(localStorage.getItem("Notifications") || "[]");
        notifications.push({ ...doctorNotification, id: Date.now() + Math.random(), date: new Date().toISOString() });
        localStorage.setItem("Notifications", JSON.stringify(notifications));
        window.dispatchEvent(new Event("storage"));

        // Save transaction to doctor wallet in Firebase
        // Ensure doctorId is the doctor's email (not id)
        // doctorEmail is already declared above
        const transaction = {
          type: "income",
          amount: Number(orderData.price) || 0,
          description: `Appointment booking from ${currentUser.patientProfile?.fullName || currentUser.name}`,
          doctorId: doctorEmail, // Use doctor's email as ID
          appointmentId: appointmentId,
          status: "completed",
        };
        
        // Save to Firebase
        try {
          await FirestoreService.addWalletTransaction(transaction);
        } catch (error) {
          // Error saving wallet transaction to Firebase
        }
        
        // Also save to localStorage for backward compatibility
        const walletTransactions = JSON.parse(localStorage.getItem("WalletTransactions") || "[]");
        walletTransactions.push({ ...transaction, id: Date.now() + Math.random(), date: new Date().toISOString() });
        localStorage.setItem("WalletTransactions", JSON.stringify(walletTransactions));
        window.dispatchEvent(new Event("storage"));

        // Clear pending appointment
        sessionStorage.removeItem("pendingAppointment");

        // Navigate based on user role
        const userRole = currentUser?.role;
        if (userRole === "Pharmacy" || userRole === "Doctor") {
          navigate("/wallet?success=true&type=appointment");
        } else {
          // For patients, navigate to dashboard
          navigate("/dashboard?success=true&type=appointment");
        }
      }
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!orderData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F5F7FA", py: 4 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1C1C1C",
            mb: 4,
            fontSize: { xs: "1.5rem", md: "2rem" },
          }}
        >
          Checkout
        </Typography>

        <Grid container spacing={3}>
          {/* Left Side - Order Summary */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #E0E0E0",
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1C1C1C",
                    mb: 3,
                    fontSize: { xs: "1rem", md: "1.25rem" },
                  }}
                >
                  {orderData.type === "products" ? "Order Summary" : "Appointment Details"}
                </Typography>

                {bookingError && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setBookingError(null)}>
                    {bookingError}
                  </Alert>
                )}

                {orderData.type === "products" ? (
                  <>
                    {orderData.items.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          gap: 2,
                          mb: 2,
                          pb: 2,
                          borderBottom: "1px solid #E0E0E0",
                        }}
                      >
                        <Avatar
                          src={item.image}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#757575" }}>
                            Qty: {item.quantity} × ${item.price}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "#757575" }}>
                        Subtotal
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${orderData.subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="body2" sx={{ color: "#757575" }}>
                        Shipping
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${orderData.shipping.toFixed(2)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Total
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E88E5" }}>
                        ${(Number(orderData.total) || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                      <Avatar
                        src={orderData.doctorAvatar || doctorImage}
                        sx={{ width: 60, height: 60 }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {orderData.doctorName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#757575" }}>
                          {orderData.doctorSpecialty}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CalendarTodayIcon sx={{ color: "#757575", fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: "#757575" }}>
                          Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, ml: 4 }}>
                        {new Date(orderData.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <AccessTimeIcon sx={{ color: "#757575", fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: "#757575" }}>
                          Time
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, ml: 4 }}>
                        {orderData.time}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: "#757575", mb: 1 }}>
                        Type
                      </Typography>
                      <Chip
                        label={orderData.appointmentType === "video" ? "Video Call" : "On-site Visit"}
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Total
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E88E5" }}>
                        ${(Number(orderData.price) || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side - Payment Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #E0E0E0",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1C1C1C",
                    mb: 3,
                    fontSize: { xs: "1rem", md: "1.25rem" },
                  }}
                >
                  Payment Method
                </Typography>

                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CreditCardIcon />
                          <Typography>Credit/Debit Card</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {paymentMethod === "card" && (
                  <Box>
                    <TextField
                      fullWidth
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      inputProps={{ maxLength: 19 }}
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: <CreditCardIcon sx={{ color: "#757575", mr: 1 }} />,
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ color: "#757575", mr: 1 }} />,
                      }}
                    />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          fullWidth
                          label="Expiry Date"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          inputProps={{ maxLength: 5 }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          fullWidth
                          label="CVV"
                          placeholder="123"
                          type="password"
                          value={cvv}
                          onChange={handleCvvChange}
                          inputProps={{ maxLength: 3 }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlePayment}
                  disabled={isProcessing}
                  startIcon={isProcessing ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                  sx={{
                    backgroundColor: "#1E88E5",
                    color: "white",
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "#1565C0",
                    },
                    "&:disabled": {
                      backgroundColor: "#BBDEFB",
                    },
                  }}
                >
                  {isProcessing ? "Processing Payment..." : `Pay $${orderData.type === "products" ? (Number(orderData.total) || 0).toFixed(2) : (Number(orderData.price) || 0).toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Checkout;

