import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  LocalPharmacy as LocalPharmacyIcon,
} from "@mui/icons-material";
import FirestoreService from "../../services/FirestoreService";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    setCurrentUser(user);
    
    // Get patient identifiers
    const patientId = (user.email || user.patientProfile?.email || "").trim().toLowerCase();
    const patientName = (user.patientProfile?.fullName || user.name || "").trim();

    if (!patientId && !patientName) {
      setPrescriptions([]);
      setFilteredPrescriptions([]);
      return;
    }


    // Subscribe to real-time updates from Firebase
    // Note: We don't use where/orderBy in subscription to avoid index requirements
    // Instead, we filter and sort on client side
    const unsubscribe = FirestoreService.subscribe(
      "prescriptions",
      (firestorePrescriptions) => {
        // Also get from localStorage as backup
        const localPrescriptions = JSON.parse(localStorage.getItem("Prescriptions") || "[]");
        
        // Combine and remove duplicates (prefer Firebase data)
        const allPrescriptions = [...firestorePrescriptions];
        const firebaseIds = new Set(firestorePrescriptions.map(p => p.id));
        
        localPrescriptions.forEach((prescription) => {
          if (!firebaseIds.has(prescription.id)) {
            allPrescriptions.push(prescription);
          }
        });

        // Filter by patientId or patientName on client side
        const patientPrescriptions = allPrescriptions.filter((prescription) => {
          const prescriptionPatientId = (prescription.patientId || "").trim().toLowerCase();
          const prescriptionPatientName = (prescription.patientName || "").trim();
          
          const matches = (
            (patientId && prescriptionPatientId === patientId) ||
            (patientName && prescriptionPatientName === patientName) ||
            (patientId && prescriptionPatientId.includes(patientId)) ||
            (patientName && prescriptionPatientName.includes(patientName))
          );
          
          return matches;
        });

        // Sort by date (newest first) on client side
        patientPrescriptions.sort((a, b) => {
          const getDateValue = (prescription) => {
            const dateValue = prescription.date || prescription.timestamp;
            if (!dateValue) return 0;
            if (dateValue?.toDate) {
              return dateValue.toDate().getTime();
            }
            return new Date(dateValue).getTime();
          };
          
          return getDateValue(b) - getDateValue(a);
        });

        setPrescriptions(patientPrescriptions);
        setFilteredPrescriptions(patientPrescriptions);
      },
      {} // No filters in subscription to avoid index requirements
    );
    
    // Also load initial data
    loadPrescriptions(user);
    
    // Listen for storage changes (when new prescriptions are added locally)
    const handleStorageChange = () => {
      loadPrescriptions(user);
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("prescriptionAdded", handleStorageChange);
    
    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("prescriptionAdded", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [searchTerm, statusFilter, prescriptions]);

  const loadPrescriptions = async (user) => {
    // Get patient identifiers (normalize to lowercase for comparison)
    const patientId = (user.email || user.patientProfile?.email || "").trim().toLowerCase();
    const patientName = (user.patientProfile?.fullName || user.name || "").trim();

    if (!patientId && !patientName) {
      setPrescriptions([]);
      setFilteredPrescriptions([]);
      return;
    }

    try {
      // Try to load from Firebase first
      const firebasePrescriptions = await FirestoreService.getPrescriptions({
        patientId: patientId,
      });

      // Also get from localStorage as backup
      const localPrescriptions = JSON.parse(localStorage.getItem("Prescriptions") || "[]");
      
      // Combine and remove duplicates (prefer Firebase data)
      const allPrescriptions = [...firebasePrescriptions];
      const firebaseIds = new Set(firebasePrescriptions.map(p => p.id));
      
      localPrescriptions.forEach((prescription) => {
        if (!firebaseIds.has(prescription.id)) {
          allPrescriptions.push(prescription);
        }
      });

      // Filter by patientId or patientName
      const patientPrescriptions = allPrescriptions.filter((prescription) => {
        // Normalize prescription patientId for comparison
        const prescriptionPatientId = (prescription.patientId || "").trim().toLowerCase();
        const prescriptionPatientName = (prescription.patientName || "").trim();
        
        // Match by patientId (email) or patientName
        return (
          (patientId && prescriptionPatientId === patientId) ||
          (patientName && prescriptionPatientName === patientName) ||
          (patientId && prescriptionPatientId.includes(patientId)) ||
          (patientName && prescriptionPatientName.includes(patientName))
        );
      });

      setPrescriptions(patientPrescriptions);
      setFilteredPrescriptions(patientPrescriptions);
    } catch (error) {
      // Fallback to localStorage only if Firebase fails
      const allPrescriptions = JSON.parse(localStorage.getItem("Prescriptions") || "[]");
      
      const patientPrescriptions = allPrescriptions.filter((prescription) => {
        const prescriptionPatientId = (prescription.patientId || "").trim().toLowerCase();
        const prescriptionPatientName = (prescription.patientName || "").trim();
        
        return (
          (patientId && prescriptionPatientId === patientId) ||
          (patientName && prescriptionPatientName === patientName) ||
          (patientId && prescriptionPatientId.includes(patientId)) ||
          (patientName && prescriptionPatientName.includes(patientName))
        );
      });
      
      setPrescriptions(patientPrescriptions);
      setFilteredPrescriptions(patientPrescriptions);
    }
  };

  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (prescription) =>
          prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((prescription) => prescription.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const getDateValue = (prescription) => {
        const dateValue = prescription.date || prescription.timestamp;
        if (!dateValue) return 0;
        if (dateValue?.toDate) {
          return dateValue.toDate().getTime();
        }
        return new Date(dateValue).getTime();
      };
      
      return getDateValue(b) - getDateValue(a);
    });

    setFilteredPrescriptions(filtered);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    try {
      let date;
      // Handle Firestore Timestamp
      if (dateValue?.toDate) {
        date = dateValue.toDate();
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const handlePrint = (prescription) => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "completed":
        return "default";
      case "expired":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 1,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            My Prescriptions
          </Typography>
          <Typography variant="body1" sx={{ color: "#757575", fontSize: "0.95rem" }}>
            View and manage all your prescriptions
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            fullWidth
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#757575" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid #E0E0E0",
              p: 6,
              textAlign: "center",
            }}
          >
            <LocalPharmacyIcon sx={{ fontSize: 80, color: "#E0E0E0", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#757575", mb: 1 }}>
              No prescriptions found
            </Typography>
            <Typography variant="body2" sx={{ color: "#9E9E9E" }}>
              {searchTerm
                ? "Try adjusting your search terms"
                : "You don't have any prescriptions yet"}
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredPrescriptions.map((prescription) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={prescription.id || prescription.timestamp}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #E0E0E0",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "#1C1C1C",
                            mb: 0.5,
                            fontSize: "1.1rem",
                          }}
                        >
                          {prescription.medication || "Prescription"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#757575" }}>
                          Dr. {prescription.doctorName || "Unknown"}
                        </Typography>
                      </Box>
                      {prescription.status && (
                        <Chip
                          label={prescription.status}
                          color={getStatusColor(prescription.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Prescription Details */}
                    <Box sx={{ flex: 1, mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={12}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#757575",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Dosage
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 500 }}>
                            {prescription.dosage && prescription.dosageUnit
                              ? `${prescription.dosage} ${prescription.dosageUnit}`
                              : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#757575",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Frequency
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 500 }}>
                            {prescription.frequency || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#757575",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Duration
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 500 }}>
                            {prescription.duration && prescription.durationUnit
                              ? `${prescription.duration} ${prescription.durationUnit}`
                              : "N/A"}
                          </Typography>
                        </Grid>
                        {prescription.specialInstructions && (
                          <Grid size={12}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#757575",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Special Instructions
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 500 }}>
                              {prescription.specialInstructions}
                            </Typography>
                          </Grid>
                        )}
                        {prescription.pharmacy && (
                          <Grid size={12}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#757575",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Pharmacy
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 500 }}>
                              {prescription.pharmacy}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Footer */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" sx={{ color: "#757575" }}>
                        {formatDate(prescription.date || prescription.timestamp)}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<PrintIcon />}
                          onClick={() => handlePrint(prescription)}
                          sx={{
                            textTransform: "none",
                            color: "#1E88E5",
                            fontSize: "0.75rem",
                          }}
                        >
                          Print
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Prescriptions;

