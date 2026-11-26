import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        let user = null;
        try {
          const email = credentials.email;
          user =
            (await prisma.user.findUnique({ where: { email } })) ??
            (await prisma.user.findUnique({ where: { email: email.toLowerCase() } }));
        } catch (dbError) {
          console.warn("Prisma user lookup error (database might not be connected):", dbError);
        }

        if (user) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordValid) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }

        // Default admin fallback for local development only — never in production
        if (
          process.env.NODE_ENV !== "production" &&
          credentials.email === "admin@ilavio.com" &&
          credentials.password === "admin123"
        ) {
          return {
            id: "default-admin-id",
            email: "admin@ilavio.com",
            name: "Admin Ilavio",
            role: "superadmin",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "admin";
      }
      return session;
    },
  },
  pages: {
    signIn: "/ilv-studio/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
