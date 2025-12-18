import { useState, useEffect, useCallback } from "react";
import DataService from "../services/DataService";
import FirestoreService from "../services/FirestoreService";

/**
 * Custom hook for managing dynamic data with real-time updates
 */
export const useDoctors = (filters = {}) => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DataService.getDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading doctors:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();

    // Subscribe to changes
    const unsubscribe = DataService.subscribe("doctors", loadDoctors);

    // Listen to storage events (cross-tab updates)
    const handleStorageChange = () => {
      loadDoctors();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadDoctors]);

  const getDoctorById = useCallback(
    async (id) => {
      try {
        return await DataService.getDoctorById(id);
      } catch (err) {
        console.error("Error getting doctor by id:", err);
        return null;
      }
    },
    []
  );

  const updateDoctor = useCallback(async (id, updates) => {
    try {
      return await DataService.updateDoctor(id, updates);
    } catch (err) {
      console.error("Error updating doctor:", err);
      return false;
    }
  }, []);

  return { doctors, isLoading, error, getDoctorById, updateDoctor, refresh: loadDoctors };
};

export const usePharmacies = (filters = {}) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPharmacies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DataService.getPharmacies();
      setPharmacies(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading pharmacies:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPharmacies();

    // Subscribe to changes
    const unsubscribe = DataService.subscribe("pharmacies", loadPharmacies);

    // Listen to storage events
    const handleStorageChange = () => {
      loadPharmacies();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadPharmacies]);

  const getPharmacyById = useCallback(
    async (id) => {
      try {
        return await DataService.getPharmacyById(id);
      } catch (err) {
        console.error("Error getting pharmacy by id:", err);
        return null;
      }
    },
    []
  );

  const updatePharmacy = useCallback(async (id, updates) => {
    try {
      return await DataService.updatePharmacy(id, updates);
    } catch (err) {
      console.error("Error updating pharmacy:", err);
      return false;
    }
  }, []);

  return { pharmacies, isLoading, error, getPharmacyById, updatePharmacy, refresh: loadPharmacies };
};

export const useAppointments = (filters = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  // Memoize filters to prevent unnecessary re-renders
  const filtersKey = JSON.stringify(filters);

  // Convert filters to Firestore query format
  const firestoreFilters = useCallback(() => {
    const whereFilters = [];
    if (filters.doctorId) {
      whereFilters.push({ field: "doctorId", operator: "==", value: filters.doctorId });
    }
    if (filters.patientId) {
      whereFilters.push({ field: "patientId", operator: "==", value: filters.patientId });
    }
    if (filters.status) {
      whereFilters.push({ field: "status", operator: "==", value: filters.status });
    }
    if (filters.paymentStatus) {
      whereFilters.push({ field: "paymentStatus", operator: "==", value: filters.paymentStatus });
    }

    // Remove orderBy to avoid index requirement - we'll sort after fetching
    return {
      where: whereFilters,
    };
  }, [filtersKey]);

  const loadAppointments = useCallback(async () => {
    try {
      setError(null);
      const data = await DataService.getAppointments(filters);
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    // Initial load
    loadAppointments();

    // Subscribe to real-time changes from Firestore with filters
    const queryFilters = firestoreFilters();
    const unsubscribe = FirestoreService.subscribe("appointments", (firestoreData) => {
      setFirebaseLoading(false);
      
      // Merge with localStorage data
      const localAppointments = JSON.parse(localStorage.getItem("Appointments") || "[]");
      
      // Combine and remove duplicates (prefer Firestore data)
      const allAppointments = [...firestoreData];
      const localIds = new Set(firestoreData.map(apt => apt.id));
      
      localAppointments.forEach(localApt => {
        if (!localIds.has(localApt.id)) {
          allAppointments.push(localApt);
        }
      });
      
      // Apply filters to combined data
      let filtered = allAppointments;
      if (filters.doctorId) {
        filtered = filtered.filter(apt => 
          apt.doctorId === filters.doctorId || 
          String(apt.doctorId) === String(filters.doctorId) ||
          apt.doctorId?.toLowerCase() === filters.doctorId?.toLowerCase()
        );
      }
      if (filters.patientId) {
        filtered = filtered.filter(apt => 
          apt.patientId === filters.patientId || 
          String(apt.patientId) === String(filters.patientId) ||
          apt.patientId?.toLowerCase() === filters.patientId?.toLowerCase()
        );
      }
      if (filters.status) {
        filtered = filtered.filter(apt => apt.status === filters.status);
      }
      if (filters.paymentStatus) {
        filtered = filtered.filter(apt => apt.paymentStatus === filters.paymentStatus);
      }
      
      // Sort by dateCreated after filtering
      filtered.sort((a, b) => {
        const dateA = a.dateCreated?.toDate 
          ? a.dateCreated.toDate().getTime() 
          : a.dateCreated 
          ? new Date(a.dateCreated).getTime() 
          : 0;
        const dateB = b.dateCreated?.toDate 
          ? b.dateCreated.toDate().getTime() 
          : b.dateCreated 
          ? new Date(b.dateCreated).getTime() 
          : 0;
        return dateB - dateA; // Descending order
      });
      
      setAppointments(filtered);
      setIsLoading(false);
    }, queryFilters);

    // Listen to storage events
    const handleStorageChange = () => {
      loadAppointments();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadAppointments, firestoreFilters, filtersKey]);

  const addAppointment = useCallback(async (appointment) => {
    try {
      return await DataService.addAppointment(appointment);
    } catch (err) {
      console.error("Error adding appointment:", err);
      throw err;
    }
  }, []);

  const updateAppointment = useCallback(async (id, updates) => {
    try {
      return await DataService.updateAppointment(id, updates);
    } catch (err) {
      console.error("Error updating appointment:", err);
      return false;
    }
  }, []);

  return {
    appointments,
    isLoading: isLoading || firebaseLoading,
    firebaseLoading,
    error,
    addAppointment,
    updateAppointment,
    refresh: loadAppointments,
  };
};

export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  // Memoize filters to prevent unnecessary re-renders
  const filtersKey = JSON.stringify(filters);

  // Convert filters to Firestore query format
  const firestoreFilters = useCallback(() => {
    const whereFilters = [];
    if (filters.patientId) {
      whereFilters.push({ field: "patientId", operator: "==", value: filters.patientId });
    }
    if (filters.pharmacyId) {
      whereFilters.push({ field: "pharmacyId", operator: "==", value: filters.pharmacyId });
    }
    if (filters.status) {
      whereFilters.push({ field: "status", operator: "==", value: filters.status });
    }

    return {
      where: whereFilters,
    };
  }, [filtersKey]);

  const loadOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await DataService.getOrders(filters);
      setOrders(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    // Initial load
    loadOrders();

    // Subscribe to real-time changes from Firestore with filters
    const queryFilters = firestoreFilters();
    const unsubscribe = FirestoreService.subscribe("orders", (firestoreData) => {
      setFirebaseLoading(false);
      
      // Merge with localStorage data
      const localOrders = JSON.parse(localStorage.getItem("Orders") || "[]");
      
      // Combine and remove duplicates (prefer Firestore data)
      // Use a Map to ensure uniqueness by ID
      const uniqueOrders = new Map();
      const seenIds = new Set();
      
      // First, add all Firebase orders (they take priority)
      firestoreData.forEach(order => {
        const orderId = String(order.id || "").trim();
        if (orderId && !seenIds.has(orderId)) {
          uniqueOrders.set(orderId, order);
          seenIds.add(orderId);
        }
      });
      
      // Then, add localStorage orders that don't exist in Firebase
      localOrders.forEach(localOrder => {
        const localId = String(localOrder.id || "").trim();
        // Only add if not already in Firebase and not already added
        if (localId && !seenIds.has(localId)) {
          uniqueOrders.set(localId, localOrder);
          seenIds.add(localId);
        }
      });
      
      // Convert Map to Array
      const allOrders = Array.from(uniqueOrders.values());
      
      // Apply filters to combined data
      let filtered = allOrders;
      if (filters.patientId) {
        filtered = filtered.filter(order => 
          order.patientId === filters.patientId || 
          String(order.patientId) === String(filters.patientId) ||
          order.patientId?.toLowerCase() === filters.patientId?.toLowerCase()
        );
      }
      if (filters.pharmacyId) {
        filtered = filtered.filter(order => {
          if (order.pharmacyId) {
            return order.pharmacyId === filters.pharmacyId || 
                   String(order.pharmacyId) === String(filters.pharmacyId) ||
                   order.pharmacyId?.toLowerCase() === filters.pharmacyId?.toLowerCase();
          }
          // Check items if pharmacyId is not directly on order
          if (order.items && Array.isArray(order.items)) {
            return order.items.some(item => {
              const itemPharmacyId = item.pharmacyId || item.pharmacyName;
              return itemPharmacyId === filters.pharmacyId ||
                     String(itemPharmacyId) === String(filters.pharmacyId) ||
                     itemPharmacyId?.toLowerCase() === filters.pharmacyId?.toLowerCase();
            });
          }
          return false;
        });
      }
      if (filters.status) {
        filtered = filtered.filter(order => order.status === filters.status);
      }
      
      // Sort by date after filtering
      filtered.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate().getTime() : a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date?.toDate ? b.date.toDate().getTime() : b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; // Descending order
      });
      
      setOrders(filtered);
      setIsLoading(false);
    }, queryFilters);

    // Listen to storage events
    const handleStorageChange = () => {
      loadOrders();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadOrders, firestoreFilters, filtersKey]);

  const addOrder = useCallback(async (order) => {
    try {
      return await DataService.addOrder(order);
    } catch (err) {
      console.error("Error adding order:", err);
      throw err;
    }
  }, []);

  const updateOrder = useCallback(async (id, updates) => {
    try {
      return await DataService.updateOrder(id, updates);
    } catch (err) {
      console.error("Error updating order:", err);
      return false;
    }
  }, []);

  return { orders, isLoading: isLoading || firebaseLoading, firebaseLoading, error, addOrder, updateOrder, refresh: loadOrders };
};

export const useNotifications = (filters = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DataService.getNotifications(filters);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadNotifications();

    // Subscribe to changes
    const unsubscribe = DataService.subscribe("Notifications", loadNotifications);

    // Listen to storage events
    const handleStorageChange = () => {
      loadNotifications();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadNotifications]);

  const addNotification = useCallback(async (notification) => {
    try {
      return await DataService.addNotification(notification);
    } catch (err) {
      console.error("Error adding notification:", err);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      return await DataService.markNotificationAsRead(id);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (userId) => {
    try {
      return await DataService.markAllNotificationsAsRead(userId);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
};

export const useWalletTransactions = (filters = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DataService.getWalletTransactions(filters);
      setTransactions(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();

    // Subscribe to changes
    const unsubscribe = DataService.subscribe("WalletTransactions", loadTransactions);

    // Listen to storage events
    const handleStorageChange = () => {
      loadTransactions();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadTransactions]);

  const addTransaction = useCallback(async (transaction) => {
    try {
      return await DataService.addWalletTransaction(transaction);
    } catch (err) {
      console.error("Error adding transaction:", err);
      throw err;
    }
  }, []);

  return { transactions, isLoading, error, addTransaction, refresh: loadTransactions };
};

export const usePrescriptions = (filters = {}) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPrescriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DataService.getPrescriptions(filters);
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading prescriptions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPrescriptions();

    // Subscribe to changes
    const unsubscribe = DataService.subscribe("Prescriptions", loadPrescriptions);

    // Listen to storage events
    const handleStorageChange = () => {
      loadPrescriptions();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadPrescriptions]);

  const addPrescription = useCallback(async (prescription) => {
    try {
      return await DataService.addPrescription(prescription);
    } catch (err) {
      console.error("Error adding prescription:", err);
      throw err;
    }
  }, []);

  return { prescriptions, isLoading, error, addPrescription, refresh: loadPrescriptions };
};


