// src/services/FirestoreService.js
/**
 * FirestoreService - Centralized data management service using Firebase Firestore
 * Handles all data operations with Firestore and provides real-time updates
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

class FirestoreService {
  constructor() {
    this.listeners = new Map();
    this.unsubscribes = new Map();
    this.initializeData();
  }

  // Initialize data from JSON if Firestore collections are empty
  // Note: We're now only using registered users from Firestore, not JSON data
  async initializeData() {
    // No longer initializing from JSON - only using registered users from Firestore
    // This method is kept for backward compatibility but does nothing
    return;
  }

  // Helper: Convert Firestore timestamp to ISO string
  convertTimestamp(timestamp) {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toISOString();
    }
    return timestamp || new Date().toISOString();
  }

  // Helper: Convert nested Timestamps in objects
  convertNestedTimestamps(obj) {
    if (!obj || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertNestedTimestamps(item));
    }
    const converted = {};
    for (const key in obj) {
      if (obj[key] && obj[key].toDate) {
        converted[key] = obj[key].toDate().toISOString();
      } else if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        converted[key] = this.convertNestedTimestamps(obj[key]);
      } else if (Array.isArray(obj[key])) {
        converted[key] = obj[key].map((item) => this.convertNestedTimestamps(item));
      } else {
        converted[key] = obj[key];
      }
    }
    return converted;
  }

  // Subscribe to data changes with real-time updates
  subscribe(collectionName, callback, filters = {}) {
    try {
      let q = query(collection(db, collectionName));

      // Apply filters
      if (filters.where && filters.where.length > 0) {
        filters.where.forEach((filter) => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }

      if (filters.orderBy && filters.orderBy.length > 0) {
        filters.orderBy.forEach((order) => {
          q = query(q, orderBy(order.field, order.direction || "asc"));
        });
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...this.convertNestedTimestamps(doc.data()) });
          });
          callback(data);
        },
        (error) => {
          console.error(`خطأ في الاستماع لتغييرات ${collectionName}:`, error);
          callback([]);
        }
      );

      // Store unsubscribe function
      const key = `${collectionName}_${JSON.stringify(filters)}`;
      if (!this.unsubscribes.has(key)) {
        this.unsubscribes.set(key, []);
      }
      this.unsubscribes.get(key).push(unsubscribe);

      // Return unsubscribe function
      return () => {
        unsubscribe();
        const unsubs = this.unsubscribes.get(key);
        if (unsubs) {
          const index = unsubs.indexOf(unsubscribe);
          if (index > -1) unsubs.splice(index, 1);
        }
      };
    } catch (error) {
      console.error(`خطأ في الاشتراك بـ ${collectionName}:`, error);
      return () => {};
    }
  }

  // Generic get method (async)
  async get(collectionName, filters = {}) {
    try {
      let q = query(collection(db, collectionName));

      if (filters.where && filters.where.length > 0) {
        filters.where.forEach((filter) => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }

      if (filters.orderBy && filters.orderBy.length > 0) {
        filters.orderBy.forEach((order) => {
          q = query(q, orderBy(order.field, order.direction || "asc"));
        });
      }

      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...this.convertNestedTimestamps(doc.data()) });
      });
      return data;
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      return [];
    }
  }

  // Generic set method (async) - adds a new document
  async add(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error adding to ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic update method (async)
  async update(collectionName, docId, updates) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error(`Error updating ${collectionName}/${docId}:`, error);
      throw error;
    }
  }

  // Generic delete method (async)
  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting ${collectionName}/${docId}:`, error);
      throw error;
    }
  }

  // Get document by ID
  async getById(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...this.convertNestedTimestamps(docSnap.data()) };
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${collectionName}/${docId}:`, error);
      return null;
    }
  }

  // Notify all listeners of a data change (for compatibility)
  notify(key, data) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Doctors methods
  async getDoctors() {
    try {
      // Get doctors from Firestore doctors collection
      const doctorsFromCollection = await this.get("doctors");
      
      // Get registered doctors from users collection in Firestore
      const users = await this.get("users", {
        where: [{ field: "role", operator: "==", value: "Doctor" }],
      });

      const registeredDoctors = users
        .filter((user) => user.doctorProfile)
        .map((user) => {
          const profile = user.doctorProfile;
          const doctor = {
            id: user.email || user.id,
            name: profile.fullName || user.name || "Unknown",
            specialty: profile.specialty || "General Practitioner",
            rating: profile.rating || 4.5,
            experience: profile.experience || "0",
            location: profile.address || profile.location || "Unknown",
            image: profile.profilePicture || null,
            bio: profile.bio || "",
            phoneNumber: profile.phoneNumber || "",
            email: profile.email || user.email,
            education: profile.education || "",
            videoCallPrice: profile.videoCallPrice || "",
            onsitePrice: profile.onsitePrice || "",
            consultationFee: profile.consultationFee || "",
            clinicImages: profile.clinicImages || [],
            clinics: (profile.clinics || []).map(clinic => ({
              ...clinic,
              images: clinic.images || [],
            })),
            isRegistered: true,
          };
          return doctor;
        });

      // Combine and remove duplicates based on id or email
      // Priority: registered doctors (from users) override doctors from collection
      const uniqueDoctors = new Map();
      
      // First, add all doctors from doctors collection
      for (const doctor of doctorsFromCollection) {
        const id = doctor.id?.toString();
        const email = doctor.email?.toLowerCase();
        const key = id || email || `doctor-${Math.random()}`;
        if (!uniqueDoctors.has(key)) {
          uniqueDoctors.set(key, doctor);
        }
      }
      
      // Then, add/override with registered doctors (they have priority)
      for (const doctor of registeredDoctors) {
        const id = doctor.id?.toString();
        const email = doctor.email?.toLowerCase();
        const key = id || email || `doctor-${Math.random()}`;
        uniqueDoctors.set(key, doctor); // Override if exists
      }

      const result = Array.from(uniqueDoctors.values());
      return result;
    } catch (error) {
      console.error("Error getting doctors:", error);
      return [];
    }
  }

  async getDoctorById(id) {
    try {
      const doctors = await this.getDoctors();
      let found = doctors.find((d) => d.id === id || d.id === id.toString());

      if (!found) {
        found = doctors.find((d) => String(d.id) === String(id));
      }

      if (!found && !isNaN(id)) {
        found = doctors.find((d) => Number(d.id) === Number(id));
      }

      return found || null;
    } catch (error) {
      console.error("Error getting doctor by id:", error);
      return null;
    }
  }

  async updateDoctor(id, updates) {
    try {
      // Try to find in users collection first
      const users = await this.get("users", {
        where: [
          { field: "role", operator: "==", value: "Doctor" },
          { field: "email", operator: "==", value: id },
        ],
      });

      if (users.length > 0) {
        const user = users[0];
        const updatedProfile = {
          ...user.doctorProfile,
          ...updates,
        };
        await this.update("users", user.id, {
          doctorProfile: updatedProfile,
        });
        return true;
      }

      // Try to update in doctors collection
      const doctor = await this.getById("doctors", id);
      if (doctor) {
        await this.update("doctors", id, updates);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error updating doctor:", error);
      return false;
    }
  }

  // Pharmacies methods
  async getPharmacies() {
    try {
      // Get pharmacies from Firestore pharmacies collection
      const pharmaciesFromCollection = await this.get("pharmacies");
      
      // Get registered pharmacies from users collection in Firestore
      const users = await this.get("users", {
        where: [{ field: "role", operator: "==", value: "Pharmacy" }],
      });

      const registeredPharmacies = users
        .filter((user) => user.pharmacyProfile)
        .map((user) => {
          const profile = user.pharmacyProfile;
          const pharmacy = {
            id: user.email || user.id,
            name: profile.pharmacyName,
            shortName: profile.shortName || profile.pharmacyName,
            location: profile.location,
            address: profile.address,
            phone: profile.phoneNumber,
            email: profile.email || user.email,
            hours: profile.hours,
            rating: profile.rating || 4.5,
            reviews: profile.reviews || 0,
            image: profile.profilePicture || null,
            products: profile.products || [],
            isRegistered: true,
          };
          return pharmacy;
        });

      // Combine and remove duplicates based on id or email
      // Priority: registered pharmacies (from users) override pharmacies from collection
      const uniquePharmacies = new Map();
      
      // First, add all pharmacies from pharmacies collection
      for (const pharmacy of pharmaciesFromCollection) {
        const id = pharmacy.id?.toString();
        const email = pharmacy.email?.toLowerCase();
        const key = id || email || `pharmacy-${Math.random()}`;
        if (!uniquePharmacies.has(key)) {
          uniquePharmacies.set(key, pharmacy);
        }
      }
      
      // Then, add/override with registered pharmacies (they have priority)
      for (const pharmacy of registeredPharmacies) {
        const id = pharmacy.id?.toString();
        const email = pharmacy.email?.toLowerCase();
        const key = id || email || `pharmacy-${Math.random()}`;
        uniquePharmacies.set(key, pharmacy); // Override if exists
      }

      return Array.from(uniquePharmacies.values());
    } catch (error) {
      console.error("Error getting pharmacies:", error);
      return [];
    }
  }

  async getPharmacyById(id) {
    try {
      const pharmacies = await this.getPharmacies();
      let found = pharmacies.find((p) => p.id === id || p.id === id.toString());

      if (!found) {
        found = pharmacies.find((p) => String(p.id) === String(id));
      }

      if (!found && !isNaN(id)) {
        found = pharmacies.find((p) => Number(p.id) === Number(id));
      }

      return found || null;
    } catch (error) {
      console.error("Error getting pharmacy by id:", error);
      return null;
    }
  }

  async updatePharmacy(id, updates) {
    try {
      const users = await this.get("users", {
        where: [
          { field: "role", operator: "==", value: "Pharmacy" },
          { field: "email", operator: "==", value: id },
        ],
      });

      if (users.length > 0) {
        const user = users[0];
        const updatedProfile = {
          ...user.pharmacyProfile,
          ...updates,
        };
        await this.update("users", user.id, {
          pharmacyProfile: updatedProfile,
        });
        return true;
      }

      const pharmacy = await this.getById("pharmacies", id);
      if (pharmacy) {
        await this.update("pharmacies", id, updates);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error updating pharmacy:", error);
      return false;
    }
  }

  // Appointments methods
  async getAppointments(filters = {}) {
    try {
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

      // Get appointments without orderBy to avoid index requirement
      // We'll sort them after fetching
      const appointments = await this.get("appointments", {
        where: whereFilters,
        // Remove orderBy to avoid index requirement
      });

      // Sort by dateCreated after fetching
      appointments.sort((a, b) => {
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

      return appointments;
    } catch (error) {
      console.error("Error getting appointments:", error);
      return [];
    }
  }

  async addAppointment(appointment) {
    try {
      const newAppointment = {
        ...appointment,
        dateCreated: serverTimestamp(),
      };
      return await this.add("appointments", newAppointment);
    } catch (error) {
      console.error("Error adding appointment:", error);
      throw error;
    }
  }

  async updateAppointment(id, updates) {
    return await this.update("appointments", id, updates);
  }

  // Orders methods
  async getOrders(filters = {}) {
    try {
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

      const orders = await this.get("orders", {
        where: whereFilters,
        orderBy: [{ field: "date", direction: "desc" }],
      });

      return orders;
    } catch (error) {
      console.error("Error getting orders:", error);
      return [];
    }
  }

  async addOrder(order) {
    try {
      const newOrder = {
        ...order,
        date: serverTimestamp(),
      };
      return await this.add("orders", newOrder);
    } catch (error) {
      console.error("Error adding order:", error);
      throw error;
    }
  }

  async updateOrder(id, updates) {
    return await this.update("orders", id, updates);
  }

  // Notifications methods
  async getNotifications(filters = {}) {
    try {
      const whereFilters = [];
      if (filters.userId) {
        // Check for pharmacyId, doctorId, or patientId
        whereFilters.push(
          { field: "pharmacyId", operator: "==", value: filters.userId },
          { field: "doctorId", operator: "==", value: filters.userId },
          { field: "patientId", operator: "==", value: filters.userId }
        );
      }
      if (filters.read !== undefined) {
        whereFilters.push({ field: "read", operator: "==", value: filters.read });
      }

      // Get all notifications and filter client-side for userId (since Firestore doesn't support OR queries easily)
      let notifications = await this.get("notifications", {
        orderBy: [{ field: "date", direction: "desc" }],
      });

      // Filter by userId if provided
      if (filters.userId) {
        notifications = notifications.filter(
          (notif) =>
            notif.pharmacyId === filters.userId ||
            notif.doctorId === filters.userId ||
            notif.patientId === filters.userId
        );
      }

      // Filter by read status if provided
      if (filters.read !== undefined) {
        notifications = notifications.filter((notif) => notif.read === filters.read);
      }

      return notifications;
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  async addNotification(notification) {
    try {
      const newNotification = {
        ...notification,
        date: serverTimestamp(),
        read: false,
      };
      return await this.add("notifications", newNotification);
    } catch (error) {
      console.error("Error adding notification:", error);
      throw error;
    }
  }

  async markNotificationAsRead(id) {
    return await this.update("notifications", id, { read: true });
  }

  async markAllNotificationsAsRead(userId) {
    try {
      const notifications = await this.getNotifications({ userId, read: false });
      const updates = notifications.map((notif) =>
        this.update("notifications", notif.id, { read: true })
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  // Wallet Transactions methods
  async getWalletTransactions(filters = {}) {
    try {
      const whereFilters = [];
      if (filters.pharmacyId) {
        whereFilters.push({ field: "pharmacyId", operator: "==", value: filters.pharmacyId });
      }
      if (filters.doctorId) {
        whereFilters.push({ field: "doctorId", operator: "==", value: filters.doctorId });
      }
      if (filters.patientId) {
        whereFilters.push({ field: "patientId", operator: "==", value: filters.patientId });
      }
      if (filters.type) {
        whereFilters.push({ field: "type", operator: "==", value: filters.type });
      }

      // Get transactions without orderBy to avoid index requirement
      // We'll sort in the application code instead
      const transactions = await this.get("walletTransactions", {
        where: whereFilters,
        // Removed orderBy to avoid index requirement - will sort in code
      });

      // Sort by date (newest first) in application code
      const sortedTransactions = transactions.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : (a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date || 0));
        const dateB = b.date?.toDate ? b.date.toDate() : (b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date || 0));
        return dateB - dateA; // Descending order (newest first)
      });

      return sortedTransactions;
    } catch (error) {
      console.error("Error getting wallet transactions:", error);
      return [];
    }
  }

  async addWalletTransaction(transaction) {
    try {
      const newTransaction = {
        ...transaction,
        date: serverTimestamp(),
        status: transaction.status || "completed",
      };
      return await this.add("walletTransactions", newTransaction);
    } catch (error) {
      console.error("Error adding wallet transaction:", error);
      throw error;
    }
  }

  // Prescriptions methods
  async getPrescriptions(filters = {}) {
    try {
      // Get all prescriptions first (without filters to avoid index requirements)
      let prescriptions = await this.get("prescriptions", {});

      // Apply filters on client side
      if (filters.patientId) {
        prescriptions = prescriptions.filter(
          (prescription) =>
            (prescription.patientId || "").trim().toLowerCase() ===
            filters.patientId.trim().toLowerCase()
        );
      }
      if (filters.doctorId) {
        prescriptions = prescriptions.filter(
          (prescription) =>
            (prescription.doctorId || "").trim().toLowerCase() ===
            filters.doctorId.trim().toLowerCase()
        );
      }

      // Sort by date (newest first) on client side
      prescriptions.sort((a, b) => {
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

      return prescriptions;
    } catch (error) {
      console.error("Error getting prescriptions:", error);
      return [];
    }
  }

  async addPrescription(prescription) {
    try {
      const newPrescription = {
        ...prescription,
        date: serverTimestamp(),
        timestamp: serverTimestamp(),
        status: prescription.status || "active",
      };
      return await this.add("prescriptions", newPrescription);
    } catch (error) {
      console.error("Error adding prescription:", error);
      throw error;
    }
  }

  // Messages methods
  async getMessages(filters = {}) {
    try {
      if (filters.senderId && filters.receiverId) {
        // Get messages between two users
        const sentMessages = await this.get("messages", {
          where: [
            { field: "senderId", operator: "==", value: filters.senderId },
            { field: "receiverId", operator: "==", value: filters.receiverId },
          ],
        });

        const receivedMessages = await this.get("messages", {
          where: [
            { field: "senderId", operator: "==", value: filters.receiverId },
            { field: "receiverId", operator: "==", value: filters.senderId },
          ],
        });

        const allMessages = [...sentMessages, ...receivedMessages];
        return allMessages.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.date || 0);
          const dateB = new Date(b.timestamp || b.date || 0);
          return dateA - dateB;
        });
      }

      return await this.get("messages", {
        orderBy: [{ field: "timestamp", direction: "asc" }],
      });
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }

  async addMessage(message) {
    try {
      const newMessage = {
        ...message,
        timestamp: serverTimestamp(),
        read: false,
      };
      return await this.add("messages", newMessage);
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }

  async markMessageAsRead(id) {
    return await this.update("messages", id, { read: true });
  }

  // Users methods (for CurrentUser - still using localStorage for now)
  async getCurrentUser() {
    try {
      const currentUserStr = localStorage.getItem("CurrentUser");
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        // Try to get updated data from Firestore
        const userDoc = await this.getById("users", currentUser.email || currentUser.id);
        if (userDoc) {
          return userDoc;
        }
        return currentUser;
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async updateCurrentUser(updates) {
    try {
      const currentUserStr = localStorage.getItem("CurrentUser");
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        const userId = currentUser.email || currentUser.id;
        
        // Update in Firestore
        await this.update("users", userId, updates);
        
        // Update in localStorage
        const updated = { ...currentUser, ...updates };
        localStorage.setItem("CurrentUser", JSON.stringify(updated));
        
        return updated;
      }
      return null;
    } catch (error) {
      console.error("Error updating current user:", error);
      throw error;
    }
  }

  async addUser(userData) {
    try {
      const user = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "users"), user);
      return { id: docRef.id, ...userData };
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  }

  async updateUser(email, updates) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }
      
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const updated = { ...user, ...updates };
      
      // If doctor profile is updated, also add/update in doctors collection
      if (updated.doctorProfile) {
        await this.addOrUpdateDoctor(updated.email, updated.doctorProfile);
      }
      
      // If pharmacy profile is updated, also add/update in pharmacies collection
      if (updated.pharmacyProfile) {
        await this.addOrUpdatePharmacy(updated.email, updated.pharmacyProfile);
      }
      
      return updated;
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  }

  async addOrUpdateDoctor(email, doctorProfile) {
    try {
      // Check if doctor already exists in doctors collection
      const existingDoctors = await this.get("doctors", {
        where: [{ field: "email", operator: "==", value: email }],
      });
      
      const doctorData = {
        id: email,
        name: doctorProfile.fullName || "Unknown",
        specialty: doctorProfile.specialty || "General Practitioner",
        rating: doctorProfile.rating || 4.5,
        experience: doctorProfile.experience || "0",
        location: doctorProfile.address || doctorProfile.location || "Unknown",
        image: doctorProfile.profilePicture || null,
        bio: doctorProfile.bio || "",
        phoneNumber: doctorProfile.phoneNumber || "",
        email: email,
        education: doctorProfile.education || "",
        videoCallPrice: doctorProfile.videoCallPrice || "",
        onsitePrice: doctorProfile.onsitePrice || "",
        consultationFee: doctorProfile.consultationFee || "",
        clinicImages: doctorProfile.clinicImages || [],
        clinics: doctorProfile.clinics || [],
        isRegistered: true,
        updatedAt: serverTimestamp(),
      };
      
      if (existingDoctors.length > 0) {
        // Update existing doctor
        const doctorDoc = existingDoctors[0];
        const doctorRef = doc(db, "doctors", doctorDoc.id);
        await updateDoc(doctorRef, doctorData);
      } else {
        // Add new doctor using email as document ID
        const doctorRef = doc(db, "doctors", email);
        await setDoc(doctorRef, {
          ...doctorData,
          createdAt: serverTimestamp(),
        }, { merge: true }); // Use merge to create if doesn't exist
      }
    } catch (error) {
      console.error("❌ Error adding/updating doctor in doctors collection:", error);
      // Don't throw - we don't want to fail the user update if this fails
    }
  }

  async addOrUpdatePharmacy(email, pharmacyProfile) {
    try {
      // Check if pharmacy already exists in pharmacies collection
      const existingPharmacies = await this.get("pharmacies", {
        where: [{ field: "email", operator: "==", value: email }],
      });
      
      const pharmacyData = {
        id: email,
        name: pharmacyProfile.pharmacyName,
        shortName: pharmacyProfile.shortName || pharmacyProfile.pharmacyName,
        location: pharmacyProfile.location,
        address: pharmacyProfile.address,
        phone: pharmacyProfile.phoneNumber,
        email: email,
        hours: pharmacyProfile.hours,
        rating: pharmacyProfile.rating || 4.5,
        reviews: pharmacyProfile.reviews || 0,
        image: pharmacyProfile.profilePicture || null,
        products: pharmacyProfile.products || [],
        isRegistered: true,
        updatedAt: serverTimestamp(),
      };
      
      if (existingPharmacies.length > 0) {
        // Update existing pharmacy
        const pharmacyDoc = existingPharmacies[0];
        const pharmacyRef = doc(db, "pharmacies", pharmacyDoc.id);
        await updateDoc(pharmacyRef, pharmacyData);
      } else {
        // Add new pharmacy using email as document ID
        const pharmacyRef = doc(db, "pharmacies", email);
        await setDoc(pharmacyRef, {
          ...pharmacyData,
          createdAt: serverTimestamp(),
        }, { merge: true }); // Use merge to create if doesn't exist
      }
    } catch (error) {
      console.error("❌ Error adding/updating pharmacy in pharmacies collection:", error);
      // Don't throw - we don't want to fail the user update if this fails
    }
  }
}

// Export singleton instance
export default new FirestoreService();

