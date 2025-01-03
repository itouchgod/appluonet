import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// 邮箱验证函数
export async function validateEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (user) {
    throw new Error('该邮箱已被注册');
  }
}

// 密码验证函数
export function validatePassword(password: string) {
  if (password.length < 6) {
    throw new Error('密码长度至少为6位');
  }
}

// 创建用户函数
export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
}) {
  const { email, password, name } = data;
  
  // 验证邮箱和密码
  await validateEmail(email);
  validatePassword(password);

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: 'USER',
    },
  });

  return user;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("用户不存在");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("密码错误");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  }
}; 