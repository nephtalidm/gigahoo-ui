/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Dev-only: hosts allowed to load the dev/client assets (tunnels, LAN IPs).
  // Set DEV_ORIGINS in .env.local (gitignored) — comma-separated, no scheme.
  allowedDevOrigins: process.env.DEV_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
}

export default nextConfig
