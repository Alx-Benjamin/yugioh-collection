/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: 'build',
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**', // Allow all hostnames 
          port: '',
          pathname: '**', // Allow all paths
        },
      ],
    },
  };
  
  module.exports = nextConfig;