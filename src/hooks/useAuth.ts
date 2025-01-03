'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Role } from '@prisma/client';

export function useAuth() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === Role.ADMIN;

  return {
    user: session?.user,
    isLoading,
    isAuthenticated,
    isAdmin,
  };
}

export function useAdmin() {
  const { session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  return {
    session,
    status,
    isAdmin: session?.user?.role === "ADMIN",
    isLoading: status === "loading",
    user: session?.user,
  };
} 