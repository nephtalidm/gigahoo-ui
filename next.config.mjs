/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Dev-only: hosts allowed to load the dev/client assets (tunnels, LAN IPs).
  // Set DEV_ORIGINS in .env.local (gitignored) — comma-separated, no scheme.
  allowedDevOrigins: process.env.DEV_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
  // Old dashboard URLs (bookmarks, stale emails) land on the renamed routes.
  // NOTE: /dashboard/billing is NOT redirected — it is now the payment-methods page;
  // the page formerly at /dashboard/billing (plans) lives at /dashboard/plan.
  async redirects() {
    return [
      { source: '/dashboard/settings', destination: '/dashboard/general-settings', permanent: true },
      { source: '/dashboard/voice', destination: '/dashboard/voice-agent', permanent: true },
      { source: '/dashboard/calls', destination: '/dashboard/call-history', permanent: true },
      { source: '/dashboard/billing-methods', destination: '/dashboard/billing', permanent: true },
    ]
  },
}

export default nextConfig
