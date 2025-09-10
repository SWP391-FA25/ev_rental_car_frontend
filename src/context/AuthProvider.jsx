import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { endpoints } from '../lib/endpoints';

const authContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await apiClient.get(endpoints.auth.me());
        if (res?.success && res?.data?.user) {
          setUser(res.data.user);
        }
      } catch {
        // not logged in or server error; keep user as null
      }
    };
    verifyUser();
  }, []);

  const login = (nextUser) => {
    setUser(nextUser);
  };
  const logout = () => {
    setUser(null);
  };

  return (
    <authContext.Provider value={{ user, login, logout }}>
      {children}
    </authContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(authContext);
}
