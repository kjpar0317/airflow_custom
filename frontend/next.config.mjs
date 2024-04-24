/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/airflow-api/:path*",
        destination: "http://localhost:8081/api/v1/:path*",
      },
      {
        source: "/cmp-api/:path*",
        destination: "http://localhost:8080/api/v2/cmp/:path*",
      },
    ];
  },
};

export default nextConfig;
