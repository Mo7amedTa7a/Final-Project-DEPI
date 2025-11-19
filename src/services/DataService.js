/**
 * DataService - Centralized data management service
 * Handles all data operations with Firebase Firestore and provides real-time updates
 * This service wraps FirestoreService to maintain compatibility with existing code
 */

import FirestoreService from "./FirestoreService";

class DataService {
  constructor() {
    this.listeners = new Map();
    this.firestoreService = FirestoreService;
    // Initialize data in Firestore (async, but we don't wait for it)
    this.firestoreService.initializeData();
  }

  // Subscribe to data changes (maps to Firestore collections)
  subscribe(key, callback) {
    // Map localStorage keys to Firestore collections
    const collectionMap = {
      "doctors": "doctors",
      "pharmacies": "pharmacies",
      "Appointments": "appointments",
      "Orders": "orders",
      "Notifications": "notifications",
      "WalletTransactions": "walletTransactions",
      "Prescriptions": "prescriptions",
      "Messages": "messages",
      "Users": "users",
    };

    const collectionName = collectionMap[key] || key.toLowerCase();
    
    // Use Firestore real-time subscription
    return this.firestoreService.subscribe(collectionName, callback);
  }

  // Notify all listeners of a data change
  notify(key, data) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Generic get method (async wrapper for Firestore)
  async get(key, defaultValue = null) {
    try {
      // Map localStorage keys to Firestore collections
      const collectionMap = {
        "Doctors": "doctors",
        "Pharmacies": "pharmacies",
        "Appointments": "appointments",
        "Orders": "orders",
        "Notifications": "notifications",
        "WalletTransactions": "walletTransactions",
        "Prescriptions": "prescriptions",
        "Messages": "messages",
        "Users": "users",
      };

      const collectionName = collectionMap[key] || key.toLowerCase();
      const data = await this.firestoreService.get(collectionName);
      return data.length > 0 ? data : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return defaultValue;
    }
  }

  // Generic set method (async wrapper - adds new document)
  async set(key, value) {
    try {
      // For arrays, add each item as a document
      if (Array.isArray(value)) {
        const collectionMap = {
          "Doctors": "doctors",
          "Pharmacies": "pharmacies",
          "Appointments": "appointments",
          "Orders": "orders",
          "Notifications": "notifications",
          "WalletTransactions": "walletTransactions",
          "Prescriptions": "prescriptions",
          "Messages": "messages",
          "Users": "users",
        };

        const collectionName = collectionMap[key] || key.toLowerCase();
        
        // Delete existing documents and add new ones
        // Note: This is a simplified approach. In production, you might want to update existing docs
        for (const item of value) {
          if (item.id) {
            await this.firestoreService.add(collectionName, item);
          }
        }
        
        this.notify(key, value);
        return true;
      }
      
      // For single objects
      const collectionMap = {
        "Doctors": "doctors",
        "Pharmacies": "pharmacies",
        "Appointments": "appointments",
        "Orders": "orders",
        "Notifications": "notifications",
        "WalletTransactions": "walletTransactions",
        "Prescriptions": "prescriptions",
        "Messages": "messages",
        "Users": "users",
      };

      const collectionName = collectionMap[key] || key.toLowerCase();
      await this.firestoreService.add(collectionName, value);
      this.notify(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  // Doctors methods (async wrappers)
  async getDoctors() {
    try {
      return await this.firestoreService.getDoctors();
    } catch (error) {
      console.error("Error getting doctors:", error);
      return [];
    }
  }

  async getDoctorById(id) {
    try {
      return await this.firestoreService.getDoctorById(id);
    } catch (error) {
      console.error("Error getting doctor by id:", error);
      return null;
    }
  }

  async updateDoctor(id, updates) {
    try {
      return await this.firestoreService.updateDoctor(id, updates);
    } catch (error) {
      console.error("Error updating doctor:", error);
      return false;
    }
  }

  // Pharmacies methods (async wrappers)
  async getPharmacies() {
    try {
      return await this.firestoreService.getPharmacies();
    } catch (error) {
      console.error("Error getting pharmacies:", error);
      return [];
    }
  }

  async getPharmacyById(id) {
    try {
      return await this.firestoreService.getPharmacyById(id);
    } catch (error) {
      console.error("Error getting pharmacy by id:", error);
      return null;
    }
  }

  async updatePharmacy(id, updates) {
    try {
      return await this.firestoreService.updatePharmacy(id, updates);
    } catch (error) {
      console.error("Error updating pharmacy:", error);
      return false;
    }
  }

  // Appointments methods (async wrappers)
  async getAppointments(filters = {}) {
    try {
      return await this.firestoreService.getAppointments(filters);
    } catch (error) {
      console.error("Error getting appointments:", error);
      return [];
    }
  }

  async addAppointment(appointment) {
    try {
      return await this.firestoreService.addAppointment(appointment);
    } catch (error) {
      console.error("Error adding appointment:", error);
      throw error;
    }
  }

  async updateAppointment(id, updates) {
    try {
      return await this.firestoreService.updateAppointment(id, updates);
    } catch (error) {
      console.error("Error updating appointment:", error);
      return false;
    }
  }

  // Orders methods (async wrappers)
  async getOrders(filters = {}) {
    try {
      return await this.firestoreService.getOrders(filters);
    } catch (error) {
      console.error("Error getting orders:", error);
      return [];
    }
  }

  async addOrder(order) {
    try {
      return await this.firestoreService.addOrder(order);
    } catch (error) {
      console.error("Error adding order:", error);
      throw error;
    }
  }

  async updateOrder(id, updates) {
    try {
      return await this.firestoreService.updateOrder(id, updates);
    } catch (error) {
      console.error("Error updating order:", error);
      return false;
    }
  }

  // Notifications methods (async wrappers)
  async getNotifications(filters = {}) {
    try {
      return await this.firestoreService.getNotifications(filters);
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  async addNotification(notification) {
    try {
      return await this.firestoreService.addNotification(notification);
    } catch (error) {
      console.error("Error adding notification:", error);
      throw error;
    }
  }

  async markNotificationAsRead(id) {
    try {
      return await this.firestoreService.markNotificationAsRead(id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  async markAllNotificationsAsRead(userId) {
    try {
      return await this.firestoreService.markAllNotificationsAsRead(userId);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  // Wallet Transactions methods (async wrappers)
  async getWalletTransactions(filters = {}) {
    try {
      return await this.firestoreService.getWalletTransactions(filters);
    } catch (error) {
      console.error("Error getting wallet transactions:", error);
      return [];
    }
  }

  async addWalletTransaction(transaction) {
    try {
      return await this.firestoreService.addWalletTransaction(transaction);
    } catch (error) {
      console.error("Error adding wallet transaction:", error);
      throw error;
    }
  }

  // Prescriptions methods (async wrappers)
  async getPrescriptions(filters = {}) {
    try {
      return await this.firestoreService.getPrescriptions(filters);
    } catch (error) {
      console.error("Error getting prescriptions:", error);
      return [];
    }
  }

  async addPrescription(prescription) {
    try {
      return await this.firestoreService.addPrescription(prescription);
    } catch (error) {
      console.error("Error adding prescription:", error);
      throw error;
    }
  }

  // Messages methods (async wrappers)
  async getMessages(filters = {}) {
    try {
      return await this.firestoreService.getMessages(filters);
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }

  async addMessage(message) {
    try {
      return await this.firestoreService.addMessage(message);
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }

  async markMessageAsRead(id) {
    try {
      return await this.firestoreService.markMessageAsRead(id);
    } catch (error) {
      console.error("Error marking message as read:", error);
      return false;
    }
  }
}

// Export singleton instance
export default new DataService();

