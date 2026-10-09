import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'foodPlannerToken';
const USER_KEY = 'foodPlannerUser';

function readCachedUser() {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function saveSessionUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readCachedUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      saveSessionUser(null);
      setUser(null);
      setLoading(false);
      return () => { active = false; };
    }

    // Show the cached session immediately so refreshes don't flash the login page
    // while /auth/me is being checked. Network/server errors must not log users out.
    const cachedUser = readCachedUser();
    if (cachedUser && active) setUser(cachedUser);

    api.get('/auth/me')
      .then(response => {
        if (!active) return;
        const currentUser = response.data.user;
        saveSessionUser(currentUser);
        setUser(currentUser);
      })
      .catch(error => {
        if (!active) return;
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          saveSessionUser(null);
          setUser(null);
        } else if (!cachedUser) {
          // No cached profile and the API is temporarily unavailable; don't
          // discard a potentially valid token. A later reload can retry.
          setUser(null);
        }
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  const login = async form => {
    const { data } = await api.post('/auth/login', form);
    localStorage.setItem(TOKEN_KEY, data.token);
    saveSessionUser(data.user);
    setUser(data.user);
  };

  const register = async form => {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem(TOKEN_KEY, data.token);
    saveSessionUser(data.user);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    saveSessionUser(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
