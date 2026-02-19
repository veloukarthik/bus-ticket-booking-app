"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = { id: number; email: string; name?: string; isAdmin?: boolean } | null;

const UserContext = createContext<{ user: User; setUser: (u: User) => void; logout: () => void }>({ user: null, setUser: () => {}, logout: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (!token) return;
    // naive decode: token payload is base64 in the middle
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.userId, email: payload.email, isAdmin: payload.isAdmin });
    } catch (e) {}
  }, []);

  function logout(){
    localStorage.removeItem('token');
    setUser(null);
  }

  return <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
