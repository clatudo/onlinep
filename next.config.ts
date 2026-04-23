import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "onlinep-phi.vercel.app",
        "*.vercel.app",
        "onlineproducoes.com.br",
        "www.onlineproducoes.com.br",
        "*.onlineproducoes.com.br",
      ],
    },
  },
};

export default nextConfig;
