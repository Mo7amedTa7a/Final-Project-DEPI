// Mock data for Doctor Profile

export const availableSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "01:00 PM",
  "01:30 PM",
];

export const mockClinics = [
  {
    id: 1,
    name: "Main Clinic",
    address: "123 Health St, Wellness City, 10101",
    consultationFee: 150,
    queueData: {
      nowServing: 12,
      estimatedWait: 15,
      lastUpdated: "just now",
    },
  },
  {
    id: 2,
    name: "Branch Clinic",
    address: "456 Medical Ave, Health District, 20202",
    consultationFee: 120,
    queueData: {
      nowServing: 5,
      estimatedWait: 8,
      lastUpdated: "2 min ago",
    },
  },
];

export const clinicImages = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400",
];

export const symptoms = [
  "Chest Pain",
  "Heart Palpitations",
  "High Blood Pressure",
  "Shortness of Breath",
  "Irregular Heartbeat",
  "Cardiac Arrhythmia",
];

export const services = [
  "ECG/EKG",
  "Echocardiogram",
  "Stress Test",
  "Cardiac Consultation",
  "Blood Pressure Monitoring",
  "Heart Health Assessment",
];

export const initialReviews = [
  {
    id: 1,
    patientName: "John Doe",
    rating: 5,
    comment: "Excellent doctor! Very professional and caring.",
    date: "2023-10-15",
  },
  {
    id: 2,
    patientName: "Jane Smith",
    rating: 4,
    comment: "Great experience, would recommend to others.",
    date: "2023-10-10",
  },
  {
    id: 3,
    patientName: "Mike Johnson",
    rating: 5,
    comment: "Very knowledgeable and patient. Explained everything clearly.",
    date: "2023-10-05",
  },
];

