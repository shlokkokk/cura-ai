import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vps_user');
    return saved ? JSON.parse(saved) : null;
  });

  const saveUser = (userData) => {
    if (userData) {
      localStorage.setItem('vps_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('vps_user');
    }
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, saveUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
