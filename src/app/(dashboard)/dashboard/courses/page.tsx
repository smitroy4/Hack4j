import { BookOpen } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/prisma/client"

export default async function CoursesPage() {
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
  })

  const enrolledCourses = enrollments.map((e) => {
    const totalLessons = e.course.sections.reduce(
      (acc, s) => acc + s.lessons.length, 0
    )
    const completedLessons = progressRecords.filter(
      (p) =>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Courses</h1>
        <p className="text-sm text-muted-foreground">
          All your enrolled courses
        </p>
      </div>

      {enrolledCourses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {course.category}
              </span>
              <h3 className="mt-1 font-medium leading-snug">{course.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {course.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Instructor: {course.instructor}
              </p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No enrolled courses</p>
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
