import type { NextConfig } from "next";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

if (!cloudName) {
  throw new Error("CLOUDINARY_CLOUD_NAME is missing");
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${cloudName}/**`,
      },
    ],
  },
};

export default nextConfig;