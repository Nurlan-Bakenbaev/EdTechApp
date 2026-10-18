'use client';

import React, { createContext, useContext, useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('bilim_user');
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('bilim_users') || '[]') as StoredUser[];
      const foundUser = users.find(
        (u: StoredUser) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Неверный email или пароль');
      }

      const userWithoutPassword: AuthUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        image: foundUser.image,
      };
      setUser(userWithoutPassword);
      localStorage.setItem('bilim_user', JSON.stringify(userWithoutPassword));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('bilim_users') || '[]') as StoredUser[];

      if (users.some((u: StoredUser) => u.email === email)) {
        throw new Error('Пользователь с таким email уже существует');
      }

      const newUser: AuthUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name,
      };

      users.push({ ...newUser, password });
      localStorage.setItem('bilim_users', JSON.stringify(users));
      setUser(newUser);
      localStorage.setItem('bilim_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bilim_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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

export function useLocalAuth() {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useLocalAuth must be used within AuthProvider');
  }
  return context;
}
