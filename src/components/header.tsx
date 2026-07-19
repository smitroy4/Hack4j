"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react"

interface HeaderProps {
  session: Session | null
}

const navLinks = [
  { label: "Lobby", href: "/" },
  { label: "Blogs", href: "https://www.smitroy.com/blogs", external: true },
  { label: "Courses", href: "/courses" },
]

export function Header({ session }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null | undefined>(session?.user?.image)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    setProfileImage(session.user.image)
    let cancelled = false
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled && data?.image) setProfileImage(data.image) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [session?.user?.id])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // profileImage is fetched from state above

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Hack4j"
            width={24}
            height={24}
            className="hidden dark:block"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none"
            }}
          />
          <Image
            src="/logo-dark.svg"
            alt="Hack4j"
            width={24}
            height={24}
            className="hidden dark:hidden"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none"
            }}
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Hack<span className="text-blue-400">4j</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => {
            const classes = cn(
              "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              !link.external && pathname === link.href
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )
            if (link.external) {
              return (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={classes}>
                  {link.label}
                </a>
              )
            }
            return (
              <Link key={link.href} href={link.href} className={classes}>
                {link.label}
              </Link>
            )
          })}
          {session && (
            <Link
              href="/dashboard"
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith("/dashboard")
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              Dashboard
            </Link>
          )}
          <ThemeToggle />
          {session ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex size-8 items-center justify-center overflow-hidden rounded-full ring-1 ring-border transition-colors hover:ring-foreground/30"
              >
                {profileImage ? (
                  <img src={profileImage} alt="" className="size-full object-cover" />
                ) : (
                  <User className="size-4 text-muted-foreground" />
                )}
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-lg border bg-background p-1 shadow-lg">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <User className="size-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <LayoutDashboard className="size-4" />
                      My Courses
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              Sign In
            </Link>
          )}
        </nav>

        <button
          className="flex items-center justify-center sm:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border/50 bg-background sm:hidden"
        >
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => {
              const mobileClasses = "block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              if (link.external) {
                return (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={mobileClasses}>
                    {link.label}
                  </a>
                )
              }
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={mobileClasses}>
                  {link.label}
                </Link>
              )
            })}
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
