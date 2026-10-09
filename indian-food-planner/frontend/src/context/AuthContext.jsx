import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);
export function AuthProvider({children}) {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('foodPlannerToken');
    if (!token) return setLoading(false);
    api.get('/auth/me').then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem('foodPlannerToken')).finally(()=>setLoading(false));
  },[]);
  const login = async form => {
    const {data} = await api.post('/auth/login',form);
    localStorage.setItem('foodPlannerToken',data.token); setUser(data.user);
  };
  const register = async form => {
    const {data} = await api.post('/auth/register',form);
    localStorage.setItem('foodPlannerToken',data.token); setUser(data.user);
  };
  const logout = () => { localStorage.removeItem('foodPlannerToken'); setUser(null); };
  return <AuthContext.Provider value={{user,loading,login,register,logout}}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
