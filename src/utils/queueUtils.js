/**
 * Utility functions for queue management
 * Handles both new appointments (with queueStatus) and old appointments (without queueStatus)
 */

const DEFAULT_SLOT_DURATION = 60; // 60 minutes default slot

/**
 * Normalize appointment data - add missing queue fields for old appointments
 */
export const normalizeAppointment = (appointment) => {
  const normalized = { ...appointment };
  
  // If appointment doesn't have queueStatus, set it to "waiting" (default)
  if (!normalized.queueStatus) {
    normalized.queueStatus = "waiting";
  }

  // If appointment doesn't have bookingTime, use dateCreated or current time
  if (!normalized.bookingTime) {
    if (normalized.dateCreated) {
      // Handle Firestore timestamp
      if (normalized.dateCreated?.toDate) {
        normalized.bookingTime = normalized.dateCreated.toDate().toISOString();
      } else if (typeof normalized.dateCreated === 'string') {
        normalized.bookingTime = normalized.dateCreated;
      } else {
        normalized.bookingTime = new Date().toISOString();
      }
    } else {
      normalized.bookingTime = new Date().toISOString();
    }
  }

  return normalized;
};

/**
 * Sort appointments by booking time (first-come-first-served)
 */
export const sortAppointmentsByBookingTime = (appointments) => {
  return [...appointments].sort((a, b) => {
    const timeA = a.bookingTime
      ? new Date(a.bookingTime).getTime()
      : a.dateCreated?.toDate
      ? a.dateCreated.toDate().getTime()
      : new Date(a.dateCreated || a.id || 0).getTime();
    
    const timeB = b.bookingTime
      ? new Date(b.bookingTime).getTime()
      : b.dateCreated?.toDate
      ? b.dateCreated.toDate().getTime()
      : new Date(b.dateCreated || b.id || 0).getTime();
    
    return timeA - timeB;
  });
};

/**
 * Get booking time from appointment (handles various formats)
 */
export const getBookingTime = (appointment) => {
  if (appointment.bookingTime) {
    return new Date(appointment.bookingTime).getTime();
  }
  
  if (appointment.dateCreated?.toDate) {
    return appointment.dateCreated.toDate().getTime();
  }
  
  if (appointment.dateCreated) {
    return new Date(appointment.dateCreated).getTime();
  }
  
  return 0;
};

/**
 * Categorize appointments by queue status
 */
export const categorizeByQueueStatus = (appointments) => {
  const waiting = [];
  let inProgress = null;
  const completed = [];

  appointments.forEach((apt) => {
    const normalized = normalizeAppointment(apt);
    const queueStatus = normalized.queueStatus || "waiting";
    
    if (queueStatus === "in-progress") {
      inProgress = normalized;
    } else if (queueStatus === "completed") {
      completed.push(normalized);
    } else {
      waiting.push(normalized);
    }
  });

  return { waiting, inProgress, completed };
};

/**
 * Calculate estimated wait time
 */
export const calculateEstimatedWaitTime = (patientsAhead, hasInProgress = false) => {
  return (patientsAhead + (hasInProgress ? 1 : 0)) * DEFAULT_SLOT_DURATION;
};

export { DEFAULT_SLOT_DURATION };

