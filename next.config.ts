import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Matikan reactCompiler bila shared hosting kehabisan memori/thread saat build:
  reactCompiler: false,
  experimental: {
    // Batasi penggunaan CPU & thread agar tidak terkena limit NPROC/RAM di Hostinger
    cpus: 1,
    workerThreads: false,
  },
  allowedDevOrigins: [
    "192.168.100.201",
    "localhost:3000",
    "ggpdsjwp-3000.asse.devtunnels.ms",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
