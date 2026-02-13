import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [appContent, setAppContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure Axios base URL
  // Use VITE_API_URL from .env, fallback to localhost if not set
  // Configure Axios base URL
  // Use VITE_API_URL from .env, fallback to localhost if not set
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

  useEffect(() => {
    const fetchAppContent = async () => {
      try {
        const res = await axios.get(`${API_URL}/app-content`);
        setAppContent(res.data);
      } catch (error) {
        console.error("Error fetching app content:", error);
      }
    };

    const checkUser = async () => {
      const storedDeviceId = localStorage.getItem('sugarSpike_deviceId');
      
      if (storedDeviceId) {
        try {
          const res = await axios.get(`${API_URL}/users/${storedDeviceId}`);
          setUser(res.data);
        } catch (error) {
          console.error("Error fetching user:", error);
          // If 404, maybe clear invalid ID? 
          if (error.response && error.response.status === 404) {
            localStorage.removeItem('sugarSpike_deviceId');
          }
        }
      }
      setLoading(false);
    };

    fetchAppContent();
    checkUser();
  }, []);

  const signup = async (userData) => {
    // Generate device ID if not exists (though usually we generate it here)
    const deviceId = uuidv4();
    
    try {
      const res = await axios.post(`${API_URL}/users`, {
        ...userData,
        deviceId
      });
      
      localStorage.setItem('sugarSpike_deviceId', deviceId);
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
     if (!user?.deviceId) return;
     try {
         const res = await axios.get(`${API_URL}/users/${user.deviceId}`);
         setUser(res.data);
     } catch (err) {
         console.error(err);
     }
  }

  const upgradeUser = async (email, password) => {
    if (!user?.deviceId) return;
    try {
      const res = await axios.post(`${API_URL}/users/upgrade`, {
        deviceId: user.deviceId,
        email,
        password
      });
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Error upgrading user:", error);
      throw error;
    }
  };

  const loginUser = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/users/login`, { email, password });
      setUser(res.data);
      localStorage.setItem('sugarSpike_deviceId', res.data.deviceId);
      return res.data;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const value = {
    user,
    appContent,
    loading,
    signup,
    refreshUser,
    upgradeUser,
    loginUser,
    API_URL
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
