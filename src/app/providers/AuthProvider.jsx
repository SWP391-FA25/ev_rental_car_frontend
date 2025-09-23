import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiClient } from '../../features/shared/lib/apiClient';
import { endpoints } from '../../features/shared/lib/endpoints';

const authContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Decide storage based on remembered flag stored in localStorage
  const getStorage = () => {
    const remembered = localStorage.getItem('remember') === 'true';
    return remembered ? localStorage : sessionStorage;
  };

  const verifyUser = useCallback(async () => {
    try {
      const res = await apiClient.get(endpoints.auth.me());
      if (res?.success && res?.data?.user) {
        setUser(res.data.user);
        // keep storage in sync
        const s = getStorage();
        s.setItem('user', JSON.stringify(res.data.user));
      }
    } catch {
      // not logged in or server error; keep user as null
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: try to rehydrate from storage first, then verify with /me if remembered
  useEffect(() => {
    const storage = getStorage();
    const storedUserJson = storage.getItem('user');
    if (storedUserJson) {
      try {
        const parsed = JSON.parse(storedUserJson);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      } catch {
        // ignore invalid stored user JSON
      }
    }

    const remembered = localStorage.getItem('remember') === 'true';
    if (!remembered) {
      // If not remembered, don't auto-fetch; rely on session-only cookie if exists during this tab life
      setLoading(false);
      return;
    }

    verifyUser();
  }, [verifyUser]);

  const login = (nextUser, options = {}) => {
    const remembered = !!options.remember;
    localStorage.setItem('remember', remembered ? 'true' : 'false');
    const storage = remembered ? localStorage : sessionStorage;

    // Clear previous storage to avoid stale
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');

    storage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    // Clear both storages
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('remember');
    setUser(null);
  };

  return (
    <authContext.Provider value={{ user, login, logout, verifyUser, loading }}>
      {children}
    </authContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(authContext);
}
