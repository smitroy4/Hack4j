import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BookOpen, Clock, Play, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { prisma } from "@/prisma/client"
import { EnrollButton } from "@/components/enroll-button"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      sections: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!course) notFound()

  const totalDuration = course.sections.reduce(
    (acc: number, s: { lessons: { duration: number }[] }) =>
      acc + s.lessons.reduce((sum: number, l: { duration: number }) => sum + l.duration, 0),
    0
  )
  const totalLessons = course.sections.reduce(
    (acc: number, s: { lessons: unknown[] }) => acc + s.lessons.length,
    0
  )

  const gradientIndex = courseId.charCodeAt(0) % 6
  const gradients = [
    "from-violet-500/10 to-purple-700/5",
    "from-blue-500/10 to-cyan-600/5",
    "from-emerald-500/10 to-teal-700/5",
    "from-orange-500/10 to-red-600/5",
    "from-pink-500/10 to-rose-700/5",
    "from-indigo-500/10 to-blue-700/5",
  ]
  const headerGradients = [
    "from-violet-500 to-purple-700",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-700",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-700",
    "from-indigo-500 to-blue-700",
  ]

  return (
    <div className="relative min-h-screen">
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", gradients[gradientIndex])} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.03),transparent_50%)] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/courses"
          className={cn(
            buttonVariants({ variant: "ghost", className: "mb-6 gap-2 group" }),
          )}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Courses
        </Link>

        <div className={cn(
          "relative mb-10 overflow-hidden rounded-2xl border p-8 sm:p-10",
          "bg-gradient-to-br",
          headerGradients[gradientIndex]
        )}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative">
            <div className="mb-3 flex items-center gap-2 text-sm">
              {course.category && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-medium text-white/80">
                  <Sparkles className="size-3" />
                  {course.category.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-3 max-w-2xl text-base text-white/80 leading-relaxed">
                {course.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4" />
                {totalLessons} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {Math.round(totalDuration / 60)}h {totalDuration % 60}m
              </span>
            </div>
            <div className="mt-6">
              <EnrollButton courseId={courseId} />
            </div>
          </div>
        </div>

        {course.sections.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Course Content</h2>
            {course.sections.map((section, si) => (
              <div
                key={section.id}
                className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                <div className="border-b px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {si + 1}
                    </span>
                    <div>
                      <h3 className="font-medium">{section.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="divide-y">
                  {section.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/courses/${courseId}/lessons/${lesson.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/50"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10">
                        <Play className="size-3" />
                      </div>
                      <span className="flex-1 font-medium">{lesson.title}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, "0")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <BookOpen className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No lessons have been added yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
