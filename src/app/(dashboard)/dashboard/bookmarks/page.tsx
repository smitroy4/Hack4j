import { Bookmark, BookOpen, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/prisma/client"

export default async function BookmarksPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const dbBookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      lesson: {
        include: {
          section: {
            include: { course: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
        <p className="text-sm text-muted-foreground">
          Lessons you&apos;ve saved for later
        </p>
      </div>

      {dbBookmarks.length > 0 ? (
        <div className="space-y-3">
          {dbBookmarks.map((bookmark: { id: string; lesson: { id: string; title: string; section: { course: { id: string; title: string } } }; createdAt: Date }) => (
            <div
              key={bookmark.id}
              className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Bookmark className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium leading-snug">
                  {bookmark.lesson.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {bookmark.lesson.section.course.title}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(bookmark.createdAt)}
                </div>
                <Link
                  href={`/courses/${bookmark.lesson.section.course.id}/lessons/${bookmark.lesson.id}`}
                  className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No bookmarks yet</p>
          <Link
            href="/courses"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  )
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}
