"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import Link from "next/link"
import { CourseCard } from "@/components/course-card"
import { GoToTop } from "@/components/go-to-top"
import { ParticlesBackground } from "@/components/particles-background"

interface CourseData {
  id: string
  title: string
  description: string | null
  shortDescription: string | null
  image: string | null
  category: { id: string; name: string } | null
  published: boolean
}

interface CategoryData {
  id: string
  name: string
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function CourseCatalogPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [courses, setCourses] = useState<CourseData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/categories"),
        ])
        const allCourses: CourseData[] = await coursesRes.json()
        const allCategories: CategoryData[] = await categoriesRes.json()
        setCourses(allCourses.filter((c) => c.published))
        setCategories(allCategories)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = courses.filter((course) => {
    const matchesCategory =
      activeCategory === "All" || course.category?.name === activeCategory
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="relative min-h-screen">
      <GoToTop />
      <ParticlesBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.03),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[image:radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            Courses
          </h1>
          <p className="mt-1 text-muted-foreground">
            Explore our curriculum — from Java fundamentals to distributed systems.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-input bg-background py-2.5 pr-4 pl-10 text-sm outline-none ring-ring transition-all placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:border-blue-400/30"
            />
          </div>
        </motion.div>

        <div className="flex gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="hidden w-48 shrink-0 md:block"
          >
            <nav className="space-y-1 sticky top-24">
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory("All")}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm transition-all",
                  activeCategory === "All"
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                All
              </motion.button>
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveCategory(cat.name)}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-left text-sm transition-all",
                    activeCategory === cat.name
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat.name}
                </motion.button>
              ))}
            </nav>
          </motion.aside>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center"
              >
                <BookOpen className="mb-4 h-10 w-10 text-muted-foreground/40" />
                <h3 className="text-lg font-semibold text-foreground">No courses yet</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Courses are being added by the community. Check back soon or{" "}
                  <Link href="/auth/register" className="text-blue-400 hover:underline">
                    join as a pioneer
                  </Link>{" "}
                  to get notified.
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((course) => (
                  <motion.div key={course.id} variants={itemVariants}>
                    <CourseCard
                      id={course.id}
                      title={course.title}
                      description={course.shortDescription ?? course.description ?? ""}
                      category={course.category?.name ?? "Uncategorized"}
                      image={course.image}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
