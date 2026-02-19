"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../providers/UserProvider";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      // not logged in yet — send to login
      router.replace('/login');
    } else if (user && !user.isAdmin) {
      // logged in but not admin
      router.replace('/');
    }
  }, [user]);

  // while redirecting or checking, render children conditionally
  if (!user || !user.isAdmin) return null;
  return <>{children}</>;
}
