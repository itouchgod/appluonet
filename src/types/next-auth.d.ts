import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string | null;
      isAdmin: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    username: string;
    email: string | null;
    isAdmin: boolean;
  }
} 