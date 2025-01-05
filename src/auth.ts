import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { User } from "next-auth"

const authConfig = {
  adapter: PrismaAdapter(prisma) as unknown as NextAuthConfig["adapter"],
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("请输入用户名和密码")
        }

        const user = await prisma.user.findUnique({
          where: { 
            username: credentials.username as string
          }
        })

        if (!user) {
          throw new Error("用户不存在")
        }

        if (!user.password) {
          throw new Error("请先设置密码")
        }

        const isValid = await bcrypt.compare(
          credentials.password as string, 
          user.password as string
        )

        if (!isValid) {
          throw new Error("密码错误")
        }

        if (!user.status) {
          throw new Error("账号已被禁用")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          username: user.username,
          isAdmin: user.isAdmin
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    }
  },
  cookies: {
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig) 