// Mock data for Patient Dashboard

export const upcomingAppointments = [
  {
    id: 1,
    doctorName: "Dr. Evelyn Reed",
    specialty: "Cardiology",
    date: "Tuesday, 24 Oct",
    time: "10:30 AM",
  },
  {
    id: 2,
    doctorName: "Dr. Ben Carter",
    specialty: "Dermatology",
    date: "Friday, 27 Oct",
    time: "2:00 PM",
  },
  {
    id: 3,
    doctorName: "Dr. Sarah Johnson",
    specialty: "Pediatrics",
    date: "Monday, 30 Oct",
    time: "9:00 AM",
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

