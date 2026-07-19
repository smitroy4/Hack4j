import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/prisma/client"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          category: true,
          sections: {
            include: { lessons: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const progressRecords = await prisma.lessonProgress.findMany({
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
    orderBy: { lastWatchedAt: "desc" },
    take: 10,
  })

  const recentLessons = progressRecords.map((p: { lesson: { id: string; title: string; section: { course: { id: string; title: string } } }; completionPct: number; lastWatchedAt: Date }) => ({
    id: p.lesson.id,
    title: p.lesson.title,
    courseTitle: p.lesson.section.course.title,
    courseId: p.lesson.section.course.id,
    progress: Math.round(p.completionPct),
    updatedAt: timeAgo(p.lastWatchedAt),
  }))

  const enrolledCourses = enrollments.map((e: { course: { id: string; title: string; slug: string; description: string | null; shortDescription: string | null; image: string | null; category: { name: string } | null; sections: { lessons: { id: string }[] }[] } }) => {
    const totalLessons = e.course.sections.reduce(
      (acc: number, s: { lessons: unknown[] }) => acc + s.lessons.length, 0
    )
    const completedLessons = progressRecords.filter(
      (p: { lesson: { section: { course: { id: string } } }; completed: boolean }) =>
        p.lesson.section.course.id === e.course.id && p.completed
    ).length
    const progress = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    return {
      id: e.course.id,
      title: e.course.title,
      description: e.course.shortDescription ?? e.course.description ?? "",
      instructor: "Community",
      progress,
      category: e.course.category?.name ?? "Uncategorized",
    }
  })

  const name = session.user.name?.split(" ")[0] ?? "there"

  return (
    <DashboardClient
      name={name}
      recentLessons={recentLessons}
      enrolledCourses={enrolledCourses}
    />
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
