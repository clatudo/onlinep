import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"], // Removendo possível warning de bcryptjs
  // serverActions: {
  //   allowedOrigins: [
  //     "localhost:3000",
  //     "*.ngrok-free.dev",
  //     "*.ngrok.io",
  //     "*.vercel.app",
  //     "onlineproducoes.com.br",
  //     "*.onlineproducoes.com.br"
  //   ]
  // }
};

export default nextConfig;
