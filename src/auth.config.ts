// Edge-safe Auth.js config. NO Prisma / bcrypt here — this is loaded by
// proxy.ts (edge) as well as the full Node-side auth.ts.
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/"]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname === "/login") return true;
  return false;
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // real provider lives in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: string }).role;
        token.orgId = (user as { orgId: string }).orgId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.orgId = token.orgId as string;
      }
      return session;
    },

    authorized({ request, auth }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // /login: if already signed in, redirect to dashboard.
      if (path === "/login") {
        if (isLoggedIn) {
          return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isPublic(path)) return true;
      if (!isLoggedIn) return false; // → redirect to /login
      return true;
    },
  },
};
