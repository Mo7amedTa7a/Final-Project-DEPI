import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for managing dynamic data from localStorage
 * Provides real-time updates and lifecycle management
 */
export const useDataManager = (dataKey, initialValue = []) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const isUpdatingRef = useRef(false);

  // Load data from localStorage
  const loadData = useCallback(() => {
    if (isUpdatingRef.current) return; // Prevent infinite loops
    
    try {
      isUpdatingRef.current = true;
      const stored = localStorage.getItem(dataKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const newData = Array.isArray(parsed) ? parsed : [parsed];
        setData((prevData) => {
          // Only update if data actually changed
          if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
            return newData;
          }
          return prevData;
        });
      } else {
        setData((prevData) => {
          if (JSON.stringify(prevData) !== JSON.stringify(initialValue)) {
            return initialValue;
          }
          return prevData;
        });
      }
    } catch (error) {
      console.error(`Error loading ${dataKey}:`, error);
      setData(initialValue);
    } finally {
      setLoading(false);
      isUpdatingRef.current = false;
    }
  }, [dataKey, initialValue]);

  // Save data to localStorage
  const saveData = useCallback(
    (newData) => {
      if (isUpdatingRef.current) return; // Prevent infinite loops
      
      try {
        isUpdatingRef.current = true;
        const dataToSave = Array.isArray(newData) ? newData : [newData];
        localStorage.setItem(dataKey, JSON.stringify(dataToSave));
        setData((prevData) => {
          // Only update if data actually changed
          if (JSON.stringify(prevData) !== JSON.stringify(dataToSave)) {
            return dataToSave;
          }
          return prevData;
        });
        // Dispatch custom event for cross-component updates (only, not storage event)
        // This prevents infinite loops since storage events trigger loadData
        window.dispatchEvent(new CustomEvent(`${dataKey}Updated`, { detail: dataToSave }));
      } catch (error) {
        console.error(`Error saving ${dataKey}:`, error);
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [dataKey]
  );

  // Add item to data
  const addItem = useCallback(
    (item) => {
      const newData = Array.isArray(data) ? [...data, item] : [item];
      saveData(newData);
    },
    [data, saveData]
  );

  // Update item in data
  const updateItem = useCallback(
    (id, updates) => {
      const newData = Array.isArray(data)
        ? data.map((item) => (item.id === id ? { ...item, ...updates } : item))
        : [];
      saveData(newData);
    },
    [data, saveData]
  );

  // Remove item from data
  const removeItem = useCallback(
    (id) => {
      const newData = Array.isArray(data) ? data.filter((item) => item.id !== id) : [];
      saveData(newData);
    },
    [data, saveData]
  );

  // Initialize and listen for changes
  useEffect(() => {
    loadData();

    // Listen for storage events (from other tabs/windows only)
    const handleStorageChange = (e) => {
      // Only respond to storage events from other tabs (not same window)
      if ((e.key === dataKey || !e.key) && !isUpdatingRef.current) {
        loadData();
      }
    };

    // Listen for custom events (from same window)
    const handleCustomUpdate = () => {
      if (!isUpdatingRef.current) {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(`${dataKey}Updated`, handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(`${dataKey}Updated`, handleCustomUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  return {
    data,
    loading,
    setData: saveData,
    addItem,
    updateItem,
    removeItem,
    reload: loadData,
  };
};

/**
 * Hook for managing current user data
 */
export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    try {
      const stored = localStorage.getItem("CurrentUser");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    try {
      const updated = { ...currentUser, ...updates };
      localStorage.setItem("CurrentUser", JSON.stringify(updated));
      setCurrentUser(updated);
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Error updating current user:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUser();

    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadUser]);

  return { currentUser, loading, updateUser, reload: loadUser };
};

/**
 * Hook for filtering data based on current user
 */
export const useFilteredData = (dataKey, filterFn) => {
  const { data, loading } = useDataManager(dataKey);
  const { currentUser } = useCurrentUser();
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (currentUser && filterFn) {
      const filtered = data.filter((item) => filterFn(item, currentUser));
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [data, currentUser, filterFn]);

  return { data: filteredData, loading, allData: data };
};

