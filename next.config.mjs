/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CIRCLE_API_KEY: process.env.NEXT_PUBLIC_CIRCLE_API_KEY,
  },
};

export default nextConfig;
