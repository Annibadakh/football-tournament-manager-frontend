import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const tokenExpiry = sessionStorage.getItem("tokenExpiry");

    if (storedUser && tokenExpiry && Date.now() > tokenExpiry) {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("tokenExpiry");
      return null;
    }

    return storedUser;
  });

  const login = (userData, tokenExpiryDuration = 60 * 60 * 1000) => {
    const expiryTime = Date.now() + tokenExpiryDuration; // Set expiry time (default 30 minutes)
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("tokenExpiry", expiryTime);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("tokenExpiry");
    setUser(null);
  };

  
  useEffect(() => {
    const interval = setInterval(() => {
      const tokenExpiry = sessionStorage.getItem("tokenExpiry");
      if (tokenExpiry && Date.now() > tokenExpiry) {
        logout();
      }
    }, 60 * 1000); // Check every 1 minute

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
