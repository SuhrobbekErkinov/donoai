// Next.js 16 renamed middleware.ts → proxy.ts. The function signature is
// identical, so Auth.js's `auth` helper (which IS the middleware function)
// can be used directly as the default export.
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Match everything EXCEPT: api routes, Next internals, static files,
  // and any path with a file extension (favicon, images, etc.).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
