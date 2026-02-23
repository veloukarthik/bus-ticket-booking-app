"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession, SessionProvider, signOut } from "next-auth/react";

type User = { id: number; email: string; name?: string; isAdmin?: boolean; organizationId?: number } | null;

const UserContext = createContext<{ user: User; setUser: (u: User) => void; logout: () => void }>({ user: null, setUser: () => {}, logout: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  function hydrateUserFromToken(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.userId, email: payload.email, isAdmin: payload.isAdmin, organizationId: payload.organizationId });
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateUser() {
      const token = localStorage.getItem("token");
      if (token && hydrateUserFromToken(token)) return;

      const session = await getSession();
      if (cancelled) return;
      if (!session?.appToken) return;

      localStorage.setItem("token", session.appToken);
      hydrateUserFromToken(session.appToken);
    }

    hydrateUser();
    return () => {
      cancelled = true;
    };
  }, []);

  function logout() {
    localStorage.removeItem("token");
    signOut({ redirect: false }).catch(() => {});
    setUser(null);
  }

  return (
    <SessionProvider>
      <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>
    </SessionProvider>
  );
}

export const useUser = () => useContext(UserContext);
