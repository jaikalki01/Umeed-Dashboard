import React, { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL } from '@/config';
interface User {
  id: string;
  email: string;
  name: string;
  gender: string;
  dob: string;
  age: number;
  maritalStatus: string;
  education: string;
  occupation: string;
  language: string;
  height: string;
  diet: string;
  smoke: string;
  drink: string;
  city_name: string;
  postal: string;
  state: string;
  country: string;
  mobile: string;
  mobilecode: string;
  partnerExpectations: string;
  bio: string;
  status: string;
  memtype: string;
  membershipExpiryDate: string;
  photo1: string;
  photo2: string;
  lastSeen: string;
  verify_status: boolean;
  phone: string;
  phonehide: boolean;
  [key: string]: any; // Allow additional properties
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  saveAuthAndRedirect: (access_token: string, user?: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const login = async (email: string, password: string) => {
  setLoading(true);
  setError(null);
  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();

    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  } catch (err: any) {
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};
 const saveAuthAndRedirect = (access_token: string, user?: any) => {
    setToken(access_token);
    if (user) {
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
    localStorage.setItem("token", access_token);
   // window.location.href = "/"; // Redirect to home or dashboard
   
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, saveAuthAndRedirect, logout, loading, error, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};