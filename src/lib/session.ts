import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function requireAuth() {
  const isAuthed = await isAuthenticated();
  if (!isAuthed) {
    throw new Error("认证失败");
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("需要管理员权限");
  }
} 