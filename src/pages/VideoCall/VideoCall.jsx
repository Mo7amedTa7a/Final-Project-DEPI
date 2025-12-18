import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import doctorImage from "../../assets/doctor.svg";
import userImage from "../../assets/user.svg";

// Components
import VideoCallHeader from "./components/VideoCallHeader";
import VideoPanel from "./components/VideoPanel";
import RightPanel from "./components/RightPanel";
import PrescriptionModal from "../DoctorDashboard/components/PrescriptionModal";

// ============================================
// Constants
// ============================================
const DEFAULT_PATIENT_DATA = {
  name: "John Doe",
  age: 34,
  dob: "05/12/1990",
  avatar: userImage,
  gender: "Male",
  phone: "+1 234-567-8900",
  email: "john.doe@example.com",
  address: "123 Main Street, New York, NY 10001",
  bloodType: "O+",
  allergies: "None",
  medications: "Aspirin 81mg daily",
  emergencyContact: "Jane Doe - +1 234-567-8901",
};

const DEFAULT_DOCTOR_DATA = {
  name: "Dr. Emily Carter",
  specialty: "Cardiology",
  avatar: doctorImage,
};

// ============================================
// Helper Functions
// ============================================
const calculateDOB = (age) => {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - parseInt(age || 0);
  return `01/01/${birthYear}`;
};

// ============================================
// Main Component
// ============================================
const VideoCall = () => {
  // Hooks
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);

  // ============================================
  // Data Loading Functions
  // ============================================
  const loadPatientData = (currentUser) => {
    if (currentUser.role === "Patient" && currentUser.patientProfile) {
      const profile = currentUser.patientProfile;
      return {
        name: profile.fullName || currentUser.name || "Patient",
        age: profile.age || "N/A",
        dob: profile.dob || calculateDOB(profile.age),
        avatar: profile.profilePicture || userImage,
        gender: profile.gender || "Not specified",
        phone: profile.phoneNumber || "Not provided",
        email: profile.email || currentUser.email || "Not provided",
        address: profile.address || "Not provided",
        bloodType: profile.bloodType || "Not specified",
        allergies: profile.allergies || profile.chronicConditions || "None",
        medications: profile.medications || "None",
        emergencyContact: profile.emergencyContact || "Not provided",
      };
    }
    return DEFAULT_PATIENT_DATA;
  };

  const loadDoctorData = (currentUser, doctorId) => {
    if (currentUser.role === "Doctor" && currentUser.doctorProfile) {
      const profile = currentUser.doctorProfile;
      return {
        name: profile.fullName || currentUser.name || "Dr. Unknown",
        specialty: profile.specialty || "General Practitioner",
        avatar: profile.profilePicture || doctorImage,
      };
    }

    // Try to find doctor by id from URL
    const users = JSON.parse(localStorage.getItem("Users") || "[]");
    const foundDoctor = users.find(
      (user) =>
        user.role === "Doctor" &&
        (user.email === doctorId || user.doctorProfile?.email === doctorId)
    );

    if (foundDoctor?.doctorProfile) {
      const profile = foundDoctor.doctorProfile;
      return {
        name: profile.fullName || foundDoctor.name || "Dr. Unknown",
        specialty: profile.specialty || "General Practitioner",
        avatar: profile.profilePicture || doctorImage,
      };
    }

    return DEFAULT_DOCTOR_DATA;
  };

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser") || "{}");
    setPatientData(loadPatientData(currentUser));
    setDoctorData(loadDoctorData(currentUser, id));
  }, [id]);


  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // Event Handlers
  // ============================================
  const handleEndCall = () => {
    if (window.confirm("Are you sure you want to end the consultation?")) {
      navigate(-1);
    }
  };


  // ============================================
  // Main Render
  // ============================================
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F8F9FA",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <VideoCallHeader callDuration={callDuration} doctorData={doctorData} />

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Center Video Panel */}
        <VideoPanel
          patientData={patientData}
          doctorData={doctorData}
          isVideoOff={isVideoOff}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleVideo={() => setIsVideoOff(!isVideoOff)}
          onEndCall={handleEndCall}
        />

        {/* Right Panel */}
        <RightPanel
          patientData={patientData}
          onPrescribeMedication={() => setPrescriptionModalOpen(true)}
        />
      </Box>

      {/* Prescription Modal */}
      <PrescriptionModal
        open={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        patientData={patientData}
      />
    </Box>
  );
};

export default VideoCall;
