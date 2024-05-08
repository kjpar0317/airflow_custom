/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/airflow-api/:path*",
        destination: `${process.env.NEXT_PUBLIC_AIRFLOW_URL}/api/v1/:path*`,
      },
      {
        source: "/test-api/:path*",
        destination: `${process.env.NEXT_PUBLIC_TABCLOUDIT_URL}/api/v2/test/:path*`,
      },
    ];
  },
};

export default nextConfig;
