import Link from "next/link"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CourseCardProps {
  id: string
  title: string
  description: string
  category: string
  image?: string | null
  imageGradient?: string
}

const gradients = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-700",
  "from-indigo-500 to-blue-700",
]

export function CourseCard({
  id,
  title,
  description,
  category,
  image,
  imageGradient,
}: CourseCardProps) {
  const gradient = imageGradient ?? gradients[id.charCodeAt(0) % gradients.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <Link href={`/courses/${id}`} className="block">
        {image ? (
          <div className="relative h-40 overflow-hidden rounded-t-xl">
            <img src={image} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        ) : (
          <div
            className={cn(
              "flex h-40 items-center justify-center rounded-t-xl bg-linear-to-br",
              gradient
            )}
          >
            <span className="text-4xl font-bold text-white/80 select-none">
              {title.charAt(0)}
            </span>
          </div>
        )}
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight text-foreground line-clamp-1">
              {title}
            </h3>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
          <span className="mt-1 inline-flex w-full items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            View Course
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
