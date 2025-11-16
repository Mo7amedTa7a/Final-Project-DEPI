// Mock orders data for pharmacy
export const mockOrders = [
  {
    id: 1,
    patient: "John Doe",
    items: [
      { name: "Aspirin", quantity: 1 },
      { name: "Vitamin C", quantity: 2 },
    ],
    totalPrice: 24.5,
    status: "New",
    date: "Oct 28, 2023 10:30 AM",
  },
  {
    id: 2,
    patient: "Jane Smith",
    items: [{ name: "Ibuprofen", quantity: 1 }],
    totalPrice: 12.99,
    status: "Preparing",
    date: "Oct 28, 2023 09:15 AM",
  },
  {
    id: 3,
    patient: "Mike Johnson",
    items: [
      { name: "Amoxicillin", quantity: 1 },
      { name: "Lip Balm", quantity: 1 },
    ],
    totalPrice: 45.0,
    status: "Ready for Pickup",
    date: "Oct 27, 2023 04:20 PM",
  },
  {
    id: 4,
    patient: "Emily White",
    items: [{ name: "Prescription Refill", quantity: 3 }],
    totalPrice: 112.8,
    status: "Completed",
    date: "Oct 26, 2023 11:00 AM",
  },
  {
    id: 5,
    patient: "Robert Brown",
    items: [
      { name: "Band-Aids", quantity: 1 },
      { name: "Antiseptic", quantity: 1 },
    ],
    totalPrice: 15.25,
    status: "Completed",
    date: "Oct 25, 2023 02:45 PM",
  },
];

