import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  providers: [], // auth.ts fills in the Credentials provider
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Public surfaces: patient web (GROW/CONNECT) stays open.
      const isPublic =
        pathname === "/" || pathname.startsWith("/book") || pathname.startsWith("/s/");

      if (isPublic) return true;
      if (isLoggedIn) return true;
      return false; // redirect to login
    },
  },
} satisfies NextAuthConfig;
