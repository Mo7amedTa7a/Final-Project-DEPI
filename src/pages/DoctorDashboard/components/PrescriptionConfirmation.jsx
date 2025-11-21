import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Divider,
  Button,
  Grid,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";

const PrescriptionConfirmation = ({ open, onClose, prescriptionData, onReturnToDashboard }) => {
  if (!prescriptionData) return null;

  const formatDate = () => {
    const now = new Date();
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return now.toLocaleDateString("en-US", options);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableScrollLock
      disableEscapeKeyDown={false}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "#E8F5E9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 50, color: "#4CAF50" }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 1,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            Prescription Successfully Sent
          </Typography>
          <Typography variant="body1" sx={{ color: "#757575", fontSize: "0.95rem" }}>
            The prescription details have been successfully sent to the selected pharmacy.
          </Typography>
        </Box>

        {/* Prescription Summary Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1C1C1C",
              mb: 3,
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            Prescription Summary
          </Typography>

          <Grid container spacing={3}>
            {/* Left Column - Patient Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #E0E0E0" }}>
                  <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>
                    Patient Name
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 600 }}>
                    {prescriptionData.patientName || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #E0E0E0" }}>
                  <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 600 }}>
                    {prescriptionData.patientDOB || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #E0E0E0" }}>
                  <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>
                    Patient ID
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 600 }}>
                    {prescriptionData.patientId || "P-123456789"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5 }}>
                  <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>
                    Date Issued
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 600 }}>
                    {formatDate()}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Column - Medication Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #E0E0E0" }}>
                  <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>
                    Medication
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 600, textAlign: "right" }}>
                    {prescriptionData.medication || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #E0E0E0" }}>
                  <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>
                    Dosage
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 600, textAlign: "right" }}>
                    {prescriptionData.dosage && prescriptionData.dosageUnit
                      ? `${prescriptionData.dosage} ${prescriptionData.dosageUnit}`
                      : "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #E0E0E0" }}>
                  <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>
                    Frequency
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 600, textAlign: "right" }}>
                    {prescriptionData.frequency || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5 }}>
                  <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>
                    Duration
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 600, textAlign: "right" }}>
                    {prescriptionData.duration && prescriptionData.durationUnit
                      ? `For ${prescriptionData.duration} ${prescriptionData.durationUnit.toLowerCase()}`
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Special Instructions Section */}
        {prescriptionData.specialInstructions && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1C1C1C",
                mb: 2,
                fontSize: { xs: "1rem", md: "1.25rem" },
              }}
            >
              Special Instructions
            </Typography>
            <Box
              sx={{
                p: 2.5,
                backgroundColor: "#F5F5F5",
                borderRadius: 2,
                border: "1px solid #E0E0E0",
              }}
            >
              <Typography variant="body2" sx={{ color: "#1C1C1C", lineHeight: 1.6 }}>
                {prescriptionData.specialInstructions}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Pharmacy Section */}
        {prescriptionData.pharmacy && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1C1C1C",
                mb: 2,
                fontSize: { xs: "1rem", md: "1.25rem" },
              }}
            >
              Pharmacy
            </Typography>
            <Box
              sx={{
                p: 2.5,
                backgroundColor: "#F5F5F5",
                borderRadius: 2,
                border: "1px solid #E0E0E0",
              }}
            >
              <Typography variant="body2" sx={{ color: "#1C1C1C", fontWeight: 500 }}>
                {prescriptionData.pharmacy}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            mt: 4,
            pt: 3,
            borderTop: "1px solid #E0E0E0",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              flex: 1,
              textTransform: "none",
              borderColor: "#E0E0E0",
              color: "#1C1C1C",
              fontWeight: 600,
              py: 1.5,
              "&:hover": {
                borderColor: "#1E88E5",
                backgroundColor: "#E3F2FD",
              },
            }}
          >
            Print Prescription
          </Button>
          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onClick={onClose}
            sx={{
              flex: 1,
              textTransform: "none",
              borderColor: "#E0E0E0",
              color: "#1C1C1C",
              fontWeight: 600,
              py: 1.5,
              "&:hover": {
                borderColor: "#1E88E5",
                backgroundColor: "#E3F2FD",
              },
            }}
          >
            View Patient Records
          </Button>
          <Button
            variant="contained"
            startIcon={<DashboardIcon />}
            onClick={onReturnToDashboard}
            sx={{
              flex: 1,
              textTransform: "none",
              backgroundColor: "#1E88E5",
              color: "white",
              fontWeight: 600,
              py: 1.5,
              "&:hover": {
                backgroundColor: "#1565C0",
              },
            }}
          >
            Return to Dashboard
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionConfirmation;

