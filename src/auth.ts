import NextAuth, { type DefaultSession, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId: string;
      organizationName: string;
      branchId: string | null;
      branchName: string | null;
      role: "SUPER_ADMIN" | "DIRECTOR" | "MANAGER" | "STAFF" | "DOCTOR";
      modules: {
        grow: boolean;
        connect: boolean;
        operate: boolean;
        intelligence: boolean;
      };
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            organization: {
              select: {
                name: true,
                moduleGrow: true,
                moduleConnect: true,
                moduleOperate: true,
                moduleIntelligence: true,
              },
            },
            branch: {
              select: {
                name: true,
              },
            },
          },
        });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organizationId,
          organizationName: user.organization.name,
          branchId: user.branchId,
          branchName: user.branch?.name ?? null,
          role: user.role,
          modules: {
            grow: user.organization.moduleGrow,
            connect: user.organization.moduleConnect,
            operate: user.organization.moduleOperate,
            intelligence: user.organization.moduleIntelligence,
          },
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as unknown as {
          id: string;
          organizationId: string;
          organizationName: string;
          branchId: string | null;
          branchName: string | null;
          role: string;
          modules: {
            grow: boolean;
            connect: boolean;
            operate: boolean;
            intelligence: boolean;
          };
        };
        token.id = customUser.id;
        token.organizationId = customUser.organizationId;
        token.organizationName = customUser.organizationName;
        token.branchId = customUser.branchId;
        token.branchName = customUser.branchName;
        token.role = customUser.role;
        token.modules = customUser.modules;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string;
        session.user.organizationName = (token.organizationName as string) ?? "Klinik Gigi";
        session.user.branchId = (token.branchId as string | null) ?? null;
        session.user.branchName = (token.branchName as string | null) ?? null;
        session.user.role = token.role as Session["user"]["role"];
        session.user.modules = (token.modules as Session["user"]["modules"]) ?? {
          grow: true,
          connect: true,
          operate: false,
          intelligence: false,
        };
      }
      return session;
    },
  },
});
