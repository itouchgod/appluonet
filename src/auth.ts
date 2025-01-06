import NextAuth from "next-auth"
import type { DefaultSession, AuthOptions, User } from "next-auth"
import type { Adapter } from "next-auth/adapters"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      isAdmin: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    username: string;
    isAdmin: boolean;
  }
}

export const config = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Record<"username" | "password", string> | undefined): Promise<User | null> {
        if (!credentials?.username || !credentials?.password) {
          console.log("缺少用户名或密码");
          throw new Error("请输入用户名和密码")
        }

        console.log("正在查找用户:", credentials.username);
        const user = await prisma.user.findUnique({
          where: { 
            username: credentials.username
          }
        })

        if (!user) {
          console.log("用户不存在:", credentials.username);
          throw new Error("用户不存在")
        }

        console.log("找到用户:", user.username);

        if (!user.password) {
          console.log("用户密码未设置");
          throw new Error("请先设置密码")
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log("密码验证结果:", isValid);

        if (!isValid) {
          throw new Error("密码错误")
        }

        if (!user.status) {
          console.log("账号已被禁用");
          throw new Error("账号已被禁用")
        }

        console.log("登录成功，返回用户信息");

        return {
          id: user.id,
          email: user.email || "",
          name: user.username,
          username: user.username,
          isAdmin: user.isAdmin,
          image: null,
          emailVerified: null,
        }
      }
    })
  ],
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
    newUser: "/"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === "development",
} satisfies AuthOptions

export const { signIn, signOut } = NextAuth(config) 