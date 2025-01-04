import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

export const { auth, handlers: { GET, POST } } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('请输入用户名和密码');
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string }
        });

        if (!user) {
          throw new Error('用户名或密码错误');
        }

        if (user.status === 'INACTIVE') {
          throw new Error('账号已被禁用');
        }

        const isPasswordValid = await compare(
          credentials.password as string, 
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('用户名或密码错误');
        }

        // 更新最后登录时间
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          username: user.username,
        };
      }
    })
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url === '/') {
        return '/tools';
      }
      return url;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}); 