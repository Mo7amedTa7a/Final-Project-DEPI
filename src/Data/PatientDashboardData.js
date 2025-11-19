// Mock data for Patient Dashboard

export const upcomingAppointments = [
  {
    id: 1,
    doctorName: "Dr. Evelyn Reed",
    specialty: "Cardiology",
    consultationType: "Cardiology Consultation",
    date: "Today",
    time: "2:30 PM",
    status: "Confirmed",
    appointmentType: "video", // "video" or "onsite"
    queueCount: 2,
    queueProgress: 30, // percentage
  },
  {
    id: 2,
    doctorName: "Dr. Ben Carter",
    specialty: "Dermatology",
    consultationType: "Dermatology Consultation",
    date: "Friday, 27 Oct",
    time: "2:00 PM",
    status: "Confirmed",
    appointmentType: "onsite", // "video" or "onsite"
    queueCount: 0,
    queueProgress: 0,
  },
  {
    id: 3,
    doctorName: "Dr. Sarah Johnson",
    specialty: "Pediatrics",
    consultationType: "Pediatrics Consultation",
    date: "Monday, 30 Oct",
    time: "9:00 AM",
    status: "Pending",
    appointmentType: "video", // "video" or "onsite"
    queueCount: 1,
    queueProgress: 50,
  },
  {
    id: 4,
    doctorName: "Dr. Michael Brown",
    specialty: "Orthopedics",
    consultationType: "Orthopedics Consultation",
    date: "Wednesday, 25 Oct",
    time: "11:00 AM",
    status: "Confirmed",
    appointmentType: "onsite", // "video" or "onsite"
    queueCount: 0,
    queueProgress: 0,
  },
];

export const recentOrders = [
  {
    orderId: "#ORD-2023-10-01",
    date: "Oct 21, 2023",
    status: "Delivered",
    statusColor: "success",
  },
  {
    orderId: "#ORD-2023-09-28",
    date: "Oct 19, 2023",
    status: "Shipped",
    statusColor: "warning",
  },
  {
    orderId: "#ORD-2023-09-25",
    date: "Oct 18, 2023",
    status: "Processing",
    statusColor: "info",
  },
];

export const queueData = {
  doctorName: "Dr. Evelyn Reed",
  currentlyServing: 2,
  yourNumber: 5,
  estimatedWaitTime: 15,
  progress: 40, // نسبة التقدم
};

