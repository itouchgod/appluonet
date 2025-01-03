'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [requireAuth, status, router]);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user,
    isAdmin: session?.user?.role === "ADMIN",
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