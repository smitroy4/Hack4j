"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Session } from "next-auth"

interface FooterProps {
  session: Session | null
}

export function Footer({ session }: FooterProps) {
  const pathname = usePathname()
  if (pathname.startsWith("/dashboard")) return null

  const footerLinks = [
    {
      title: "Explore",
      links: [
        { label: "Courses", href: "/courses" },
        { label: "Founder", href: "https://www.smitroy.com/about" },
        { label: "Blogs", href: "https://www.smitroy.com/blogs" },
      ],
    },
    {
      title: "Learn",
      links: session?.user
        ? [
            { label: "My Courses", href: "/dashboard" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Profile", href: "/dashboard/profile" },
          ]
        : [
            { label: "My Courses", href: "/auth/login" },
            { label: "Dashboard", href: "/auth/login" },
            { label: "Profile", href: "/auth/login" },
          ],
    },
    {
      title: "Community",
      links: [
        { label: "Timeline", href: "/community/timeline" },
        { label: "My Threads", href: "/community/threads" },
        { label: "Contribute", href: "/community/register" },
      ],
    },
  ]

  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
              Hack<span className="text-blue-400">4j</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-xs">
              A community that lives 10 years ahead. Free engineering education for the next
              generation of builders.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h4>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => {
                  const isExternal = link.href.startsWith("http")
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border/50 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Hack4j. A community that lives 10 years ahead.
          </p>
        </div>
      </div>
    </footer>
  )
}
