import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "github") return true;
      if (!user.email) return false;

      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existing) {
        const generatedPassword = crypto.randomBytes(32).toString("hex");
        const hashed = await bcrypt.hash(generatedPassword, 10);
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name ?? user.email.split("@")[0],
            password: hashed,
            userType: "CUSTOMER",
          },
        });
      } else if (!existing.name && user.name) {
        await prisma.user.update({ where: { id: existing.id }, data: { name: user.name } });
      }

      return true;
    },
    async jwt({ token, user }) {
      const email = (user?.email ?? token.email) as string | undefined;
      if (!email) return token;

      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) return token;

      token.appUserId = dbUser.id;
      token.appUserEmail = dbUser.email;
      token.appIsAdmin = dbUser.isAdmin;
      token.appUserType = dbUser.userType;
      token.appToken = signToken({ userId: dbUser.id, email: dbUser.email, isAdmin: dbUser.isAdmin, userType: dbUser.userType });
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: typeof token.appUserId === "number" ? token.appUserId : undefined,
        email: (token.appUserEmail as string | undefined) ?? session.user?.email ?? undefined,
        isAdmin: Boolean(token.appIsAdmin),
        userType: (token.appUserType as string | undefined) ?? undefined,
      };
      session.appToken = token.appToken as string | undefined;
      return session;
    },
  },
};
