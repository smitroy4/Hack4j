"use client"

import { BookOpen, Clock, ArrowRight, Compass, TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "motion/react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GoToTop } from "@/components/go-to-top"

interface RecentLesson {
  id: string
  title: string
  courseTitle: string
  courseId: string
  progress: number
  updatedAt: string
}

interface EnrolledCourse {
  id: string
  title: string
  description: string
  instructor: string
  progress: number
  category: string
}

interface DashboardClientProps {
  name: string
  recentLessons: RecentLesson[]
  enrolledCourses: EnrolledCourse[]
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function DashboardClient({ name, recentLessons, enrolledCourses }: DashboardClientProps) {
  return (
    <div className="relative">
      <GoToTop />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.03),transparent_50%)] pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative space-y-8"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your learning progress
          </p>
        </motion.div>

        <section>
          <motion.div variants={itemVariants} className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <TrendingUp className="size-4 text-blue-400" />
              Continue Learning
            </h2>
            <Link
              href="/dashboard/courses"
              className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
          {recentLessons.length > 0 ? (
            <motion.div
              variants={containerVariants}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {recentLessons.map((lesson) => (
                <motion.div key={lesson.id} variants={itemVariants}>
                  <Link
                    href={`/courses/${lesson.courseId}/lessons/${lesson.id}`}
                    className="group block rounded-xl border bg-card p-5 transition-all hover:border-blue-500/20 hover:shadow-md hover:shadow-blue-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {lesson.updatedAt}
                        </span>
                      </div>
                      <span className="text-xs font-medium tabular-nums text-blue-400">
                        {lesson.progress}%
                      </span>
                    </div>
                    <h3 className="mt-2 font-medium leading-snug group-hover:text-blue-400 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lesson.courseTitle}
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lesson.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center"
            >
              <Clock className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No lessons in progress
              </p>
              <Link
                href="/dashboard/courses"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
              >
                Browse Courses
              </Link>
            </motion.div>
          )}
        </section>

        <section>
          <motion.div variants={itemVariants} className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <BookOpen className="size-4 text-blue-400" />
              My Courses
            </h2>
            <Link
              href="/dashboard/courses"
              className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
          {enrolledCourses.length > 0 ? (
            <motion.div
              variants={containerVariants}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {enrolledCourses.map((course) => (
                <motion.div key={course.id} variants={itemVariants}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="group block rounded-xl border bg-card p-5 transition-all hover:border-blue-500/20 hover:shadow-md hover:shadow-blue-500/5"
                  >
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {course.category}
                    </span>
                    <h3 className="mt-2 font-medium leading-snug group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {course.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Instructor: {course.instructor}
                    </p>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium tabular-nums">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center"
            >
              <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No enrolled courses
              </p>
              <Link
                href="/courses"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
              >
                Browse Courses
              </Link>
            </motion.div>
          )}
        </section>
      </motion.div>
    </div>
  )
}
