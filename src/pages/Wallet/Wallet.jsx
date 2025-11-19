import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import FirestoreService from "../../services/FirestoreService";
import { useDataManager } from "../../hooks/useDataManager";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  LocalPharmacy as LocalPharmacyIcon,
} from "@mui/icons-material";

const Wallet = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseTransactions, setFirebaseTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: localStorageTransactions } = useDataManager("WalletTransactions", []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    setCurrentUser(user);

    // Check for success message
    const success = searchParams.get("success");
    const type = searchParams.get("type");
    if (success === "true") {
      if (type === "order") {
        setSuccessMessage("Order placed successfully! Payment has been processed.");
      } else if (type === "appointment") {
        setSuccessMessage("Appointment booked successfully! Payment has been processed.");
      }
      setShowSuccess(true);
      // Clean URL
      navigate("/wallet", { replace: true });
    }

    loadTransactions(user);
  }, [searchParams, navigate]);

  const loadTransactions = async (user) => {
    try {
      setLoading(true);
      let firebaseData = [];
      
      if (user.role === "Pharmacy") {
        firebaseData = await FirestoreService.getWalletTransactions({ pharmacyId: user.email });
      } else if (user.role === "Doctor") {
        firebaseData = await FirestoreService.getWalletTransactions({ doctorId: user.email });
      } else {
        firebaseData = await FirestoreService.getWalletTransactions({ patientId: user.email });
      }
      
      setFirebaseTransactions(firebaseData);
    } catch (error) {
      setFirebaseTransactions([]);
    } finally {
      setLoading(false);
    }
  };

    // Combine Firebase and localStorage transactions, removing duplicates
  const transactions = useMemo(() => {
    if (!currentUser) return [];
    
    const allTransactions = [...(firebaseTransactions || []), ...(localStorageTransactions || [])];
    
    // Remove duplicates
    const uniqueTransactions = new Map();
    allTransactions.forEach(t => {
      const key = t.id || `${t.doctorId || t.pharmacyId || t.patientId}-${t.amount}-${t.date}`;
      if (!uniqueTransactions.has(key)) {
        uniqueTransactions.set(key, t);
      }
    });
    
    let filtered = Array.from(uniqueTransactions.values());
    
    // Filter by user role
    if (currentUser.role === "Pharmacy") {
      filtered = filtered.filter(
        (t) => t.pharmacyId === currentUser.email || t.pharmacyId === currentUser.pharmacyProfile?.name
      );
    } else if (currentUser.role === "Doctor") {
      // Filter by doctor email - check multiple possible formats
      filtered = filtered.filter(
        (t) => {
          const matchesDoctor = t.doctorId === currentUser.email || 
                                t.doctorId === currentUser.doctorProfile?.email ||
                                String(t.doctorId) === String(currentUser.email) ||
                                String(t.doctorId) === String(currentUser.doctorProfile?.email);
          return matchesDoctor;
        }
      );
    } else {
      filtered = filtered.filter(
        (t) => t.patientId === currentUser.email
      );
    }
    
    // Sort by date (newest first)
    const sorted = filtered.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB - dateA;
    });
    
    return sorted;
  }, [firebaseTransactions, localStorageTransactions, currentUser]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpenses;

  const formatDate = (dateValue) => {
    // Handle Firestore Timestamp or string date
    let date;
    if (dateValue?.toDate) {
      date = dateValue.toDate();
    } else if (dateValue?.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      date = new Date(dateValue);
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F5F7FA", py: 4 }}>
      <Container maxWidth="xl">
        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowSuccess(false)}
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <WalletIcon sx={{ fontSize: 40, color: "#1E88E5" }} />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1C1C1C",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              {currentUser?.role === "Pharmacy" || currentUser?.role === "Doctor"
                ? "Wallet"
                : "Payment History"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#757575" }}>
              {currentUser?.role === "Pharmacy" || currentUser?.role === "Doctor"
                ? "View your financial transactions and earnings"
                : "View your payment history"}
            </Typography>
          </Box>
        </Box>

        {/* Summary Cards */}
        {(currentUser?.role === "Pharmacy" || currentUser?.role === "Doctor") && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E0E0E0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#757575", fontSize: "0.875rem", mb: 1, fontWeight: 500 }}
                  >
                    Total Balance
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: "#1C1C1C",
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    ${balance.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E0E0E0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <TrendingUpIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "#757575", fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      Total Income
                    </Typography>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: "#4CAF50",
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    ${totalIncome.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E0E0E0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <TrendingDownIcon sx={{ color: "#F44336", fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "#757575", fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      Total Expenses
                    </Typography>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: "#F44336",
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    ${totalExpenses.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Transactions Table */}
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
              {currentUser?.role === "Pharmacy" || currentUser?.role === "Doctor"
                ? "Transaction History"
                : "Payment History"}
            </Typography>

            {transactions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <WalletIcon sx={{ fontSize: 80, color: "#E0E0E0", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "#757575", mb: 1 }}>
                  No transactions yet
                </Typography>
                <Typography variant="body2" sx={{ color: "#9E9E9E" }}>
                  {currentUser?.role === "Pharmacy" || currentUser?.role === "Doctor"
                    ? "Your transactions will appear here"
                    : "Your payment history will appear here"}
                </Typography>
              </Box>
            ) : isMobile ? (
              // Mobile View - Cards
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {transactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    sx={{
                      border: "1px solid #E0E0E0",
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {transaction.description}
                        </Typography>
                        <Chip
                          label={transaction.type === "income" ? "Income" : "Expense"}
                          color={transaction.type === "income" ? "success" : "error"}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#757575", mb: 1 }}>
                        {formatDate(transaction.date)}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: transaction.type === "income" ? "#4CAF50" : "#F44336",
                        }}
                      >
                        {transaction.type === "income" ? "+" : "-"}${(Number(transaction.amount) || 0).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              // Desktop View - Table
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type === "income" ? "Income" : "Expense"}
                            color={transaction.type === "income" ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: transaction.type === "income" ? "#4CAF50" : "#F44336",
                          }}
                        >
                          {transaction.type === "income" ? "+" : "-"}${(Number(transaction.amount) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status || "Completed"}
                            color={transaction.status === "completed" ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Wallet;

