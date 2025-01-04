import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials: Partial<Record<"username" | "password", unknown>>) {
        try {
          const username = credentials?.username as string;
          const password = credentials?.password as string;
          
          if (!username || !password) {
            throw new Error("请输入用户名和密码")
          }

          const user = await prisma.user.findUnique({
            where: { username: username }
          })

          if (!user) {
            console.log("用户不存在:", username)
            return null
          }

          const isPasswordValid = await compare(
            password,
            user.password || ''
          )
          if (!isPasswordValid) {
            console.log("密码错误:", username)
            return null
          }

          if (user.status !== "ACTIVE") {
            console.log("用户已禁用:", username)
            return null
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          return {
            id: user.id,
            username: user.username,
            name: user.username
          }
        } catch (error) {
          console.error("认证过程出错:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          username: token.username as string,
          email: '',
          emailVerified: null
        }
      }
      return session
    }
  }
}) 