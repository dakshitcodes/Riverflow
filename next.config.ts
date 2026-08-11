import type { NextConfig } from "next";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
let appwriteHostname = "fra.cloud.appwrite.io";

if (endpoint) {
  try {
    appwriteHostname = new URL(endpoint).hostname;
  } catch (e) {
    // Fallback if URL parsing fails
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: appwriteHostname,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
