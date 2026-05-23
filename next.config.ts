import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Next.js dev server to accept requests from public tunnel domains
  // (ngrok / cloudflared / localtunnel). Dev-only — no effect on prod.
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
    "*.trycloudflare.com",
    "*.loca.lt",
  ],
};

export default nextConfig;
