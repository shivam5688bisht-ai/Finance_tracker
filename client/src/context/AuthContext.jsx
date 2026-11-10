import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("finance_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me").then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("finance_token"))
      .finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("finance_token", data.token); setUser(data.user);
  };
  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("finance_token", data.token); setUser(data.user);
  };
  const logout = () => { localStorage.removeItem("finance_token"); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
