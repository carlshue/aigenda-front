"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  user_id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    const storedToken = localStorage.getItem("genda:token");
    const storedUser = localStorage.getItem("genda:user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("genda:token");
        localStorage.removeItem("genda:user");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error en login");
    }

    const data = await response.json();
    setToken(data.token);
    const userData: User = {
      user_id: data.user_id,
      email: data.email,
      name: data.name,
    };
    setUser(userData);

    localStorage.setItem("genda:token", data.token);
    localStorage.setItem("genda:user", JSON.stringify(userData));
  };

  const register = async (email: string, name: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error en registro");
    }

    const data = await response.json();
    setToken(data.token);
    const userData: User = {
      user_id: data.user_id,
      email: data.email,
      name: data.name,
    };
    setUser(userData);

    localStorage.setItem("genda:token", data.token);
    localStorage.setItem("genda:user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("genda:token");
    localStorage.removeItem("genda:user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
