import Link from "next/link"
import { cn } from "@/lib/utils"

export function BrandLogo({
  className,
  href = "/",
  onNavigate,
}: {
  className?: string
  href?: string
  // When provided, the click is intercepted and this runs instead of navigating
  // directly — used inside the dashboard to route through the unsaved-changes guard.
  onNavigate?: (href: string) => void
}) {
  return (
    <Link
      href={href}
      // Only attach a click handler when a navigation guard is supplied (dashboard,
      // a client subtree). Passing an inline function unconditionally breaks any
      // SERVER-rendered usage (e.g. /signup): a Server Component can't hand an event
      // handler to a Client Component (<Link>). undefined is serializable, so the
      // logo stays a zero-JS server component on marketing pages.
      onClick={
        onNavigate
          ? (e) => {
              e.preventDefault()
              onNavigate(href)
            }
          : undefined
      }
      className={cn("inline-flex items-center", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/gigahoo-logo.png" alt="Gigahoo" className="h-[2.4rem] w-auto" />
    </Link>
  )
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}
