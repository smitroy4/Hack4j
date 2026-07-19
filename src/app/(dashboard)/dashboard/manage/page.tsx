"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Loader2, List, BookOpen, ChevronRight, ChevronDown, X } from "lucide-react"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  shortDescription: string | null
  image: string | null
  price: number
  published: boolean
  categoryId: string | null
  category: { id: string; name: string } | null
  _count: { sections: number; enrollments: number }
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { courses: number }
}

export default function ManagePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [courseDialog, setCourseDialog] = useState<{
    open: boolean
    edit: Course | null
  }>({ open: false, edit: null })

  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean
    edit: Category | null
  }>({ open: false, edit: null })

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "course" | "category"
    id: string
    title: string
  } | null>(null)

  const [contentDialog, setContentDialog] = useState<{
    open: boolean
    courseId: string
    courseTitle: string
  } | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/categories"),
      ])
      if (coursesRes.ok) setCourses(await coursesRes.json())
      if (categoriesRes.ok) setCategories(await categoriesRes.json())
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  async function saveCourse(data: {
    title: string
    slug: string
    description: string
    shortDescription: string
    image: string
    published: boolean
    categoryId: string | null
  }) {
    const isEdit = courseDialog.edit
    const url = isEdit ? `/api/courses/${isEdit.id}` : "/api/courses"
    const method = isEdit ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save")
      }
      toast.success(isEdit ? "Course updated" : "Course created")
      setCourseDialog({ open: false, edit: null })
      fetchData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save course")
    }
  }

  async function saveCategory(data: {
    name: string
    slug: string
    description: string
  }) {
    const isEdit = categoryDialog.edit
    const url = isEdit
      ? `/api/categories/${isEdit.id}`
      : "/api/categories"
    const method = isEdit ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save")
      }
      toast.success(isEdit ? "Category updated" : "Category created")
      setCategoryDialog({ open: false, edit: null })
      fetchData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save category")
    }
  }

  async function deleteItem(type: "course" | "category", id: string) {
    const url = type === "course" ? `/api/courses/${id}` : `/api/categories/${id}`

    try {
      const res = await fetch(url, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to delete")
      }
      toast.success(`${type === "course" ? "Course" : "Category"} deleted`)
      setDeleteConfirm(null)
      fetchData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manage</h1>
        <p className="text-sm text-muted-foreground">
          Owner-only administration panel
        </p>
      </div>

      {/* ───── Courses ───── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Manage Courses</h2>
          <Dialog
            open={courseDialog.open}
            onOpenChange={(open) => {
              if (!open) setCourseDialog({ open: false, edit: null })
            }}
          >
            <CourseFormDialog
              edit={courseDialog.edit}
              categories={categories}
              onSave={saveCourse}
            />
          </Dialog>
          <Button
            size="sm"
            onClick={() =>
              setCourseDialog({ open: true, edit: null })
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Course
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-center font-medium">Sections</th>
                <th className="px-4 py-3 text-center font-medium">Students</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No courses yet
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{course.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {course.category?.name ?? "Uncategorized"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {course._count?.sections ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {course._count?.enrollments ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          course.published
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Manage content"
                          onClick={() =>
                            setContentDialog({
                              open: true,
                              courseId: course.id,
                              courseTitle: course.title,
                            })
                          }
                        >
                          <List className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            setCourseDialog({ open: true, edit: course })
                          }
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            setDeleteConfirm({
                              type: "course",
                              id: course.id,
                              title: course.title,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ───── Categories ───── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Manage Categories</h2>
          <Dialog
            open={categoryDialog.open}
            onOpenChange={(open) => {
              if (!open) setCategoryDialog({ open: false, edit: null })
            }}
          >
            <CategoryFormDialog
              edit={categoryDialog.edit}
              onSave={saveCategory}
              slugify={slugify}
            />
          </Dialog>
          <Button
            size="sm"
            onClick={() =>
              setCategoryDialog({ open: true, edit: null })
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Category
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.length === 0 ? (
            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No categories yet
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {category._count?.courses ?? 0} courses
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      setCategoryDialog({ open: true, edit: category })
                    }
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      setDeleteConfirm({
                        type: "category",
                        id: category.id,
                        title: category.name,
                      })
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ───── Course Content Dialog ───── */}
      <Dialog
        open={contentDialog !== null}
        onOpenChange={(open) => {
          if (!open) setContentDialog(null)
        }}
      >
        {contentDialog && (
          <CourseContentDialog
            courseId={contentDialog.courseId}
            courseTitle={contentDialog.courseTitle}
            onClose={() => setContentDialog(null)}
            onRefresh={() => fetchData()}
          />
        )}
      </Dialog>

      {/* ───── Delete Confirmation Dialog ───── */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteConfirm?.type === "course" ? "Course" : "Category"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteConfirm?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm) {
                  deleteItem(deleteConfirm.type, deleteConfirm.id)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ──────────────────────────────────────────
   Course Form Dialog
   ────────────────────────────────────────── */

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function CourseFormDialog({
  edit,
  categories,
  onSave,
}: {
  edit: Course | null
  categories: Category[]
  onSave: (data: {
    title: string
    slug: string
    description: string
    shortDescription: string
    image: string
    published: boolean
    categoryId: string | null
  }) => Promise<void>
}) {
  const [title, setTitle] = useState(edit?.title ?? "")
  const [slug, setSlug] = useState(edit?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(!!edit)
  const [description, setDescription] = useState(edit?.description ?? "")
  const [shortDescription, setShortDescription] = useState(
    edit?.shortDescription ?? ""
  )
  const [image, setImage] = useState(edit?.image ?? "")
  const [published, setPublished] = useState(edit?.published ?? false)
  const [categoryId, setCategoryId] = useState(edit?.categoryId ?? "")
  const [saving, setSaving] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true)
    setSlug(value)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    onSave({
      title,
      slug: slug || slugify(title),
      description,
      shortDescription,
      image,
      published,
      categoryId: categoryId || null,
    }).finally(() => setSaving(false))
  }

  return (
    <DialogContent showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{edit ? "Edit Course" : "Add Course"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="Auto-generated from title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/course-image.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                {categoryId
                  ? categories.find((c) => c.id === categoryId)?.name
                  : "Select category"}
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="published">Published</Label>
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : edit ? "Update Course" : "Create Course"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

/* ──────────────────────────────────────────
   Category Form Dialog
   ────────────────────────────────────────── */

function CategoryFormDialog({
  edit,
  onSave,
  slugify: slugifyFn,
}: {
  edit: Category | null
  onSave: (data: { name: string; slug: string; description: string }) => Promise<void>
  slugify: (text: string) => string
}) {
  const [name, setName] = useState(edit?.name ?? "")
  const [slug, setSlug] = useState(edit?.slug ?? "")
  const [description, setDescription] = useState(edit?.description ?? "")
  const [saving, setSaving] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    if (!edit) setSlug(slugifyFn(value))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    onSave({
      name,
      slug: slug || slugifyFn(name),
      description,
    }).finally(() => setSaving(false))
  }

  return (
    <DialogContent showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{edit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto-generated from name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-description">Description</Label>
            <textarea
              id="cat-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : edit ? "Update Category" : "Create Category"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

/* ──────────────────────────────────────────
   Course Content Dialog (Sections + Lessons)
   ────────────────────────────────────────── */

interface SectionWithLessons {
  id: string
  title: string
  order: number
  lessons: LessonData[]
}

interface LessonData {
  id: string
  title: string
  description: string | null
  order: number
  videoId: string
  duration: number
  instructorNotes: string | null
  lessonResources: ResourceData[]
}

interface ResourceData {
  id: string
  title: string
  url: string
  type: string
}

function CourseContentDialog({
  courseId,
  courseTitle,
  onClose,
  onRefresh,
}: {
  courseId: string
  courseTitle: string
  onClose: () => void
  onRefresh: () => void
}) {
  const [sections, setSections] = useState<SectionWithLessons[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const [sectionForm, setSectionForm] = useState<{
    open: boolean
    edit: SectionWithLessons | null
  }>({ open: false, edit: null })

  const [lessonForm, setLessonForm] = useState<{
    open: boolean
    edit: LessonData | null
    sectionId: string
  }>({ open: false, edit: null, sectionId: "" })

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "section" | "lesson"
    id: string
    title: string
  } | null>(null)

  const fetchSections = useCallback(async () => {
    try {
      const res = await fetch(`/api/sections?courseId=${courseId}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to load sections")
      }
      setSections(await res.json())
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load sections")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  async function saveSection(data: { title: string; order: number }) {
    const isEdit = sectionForm.edit
    const url = isEdit ? `/api/sections/${isEdit.id}` : "/api/sections"
    const method = isEdit ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, courseId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save section")
      }
      toast.success(isEdit ? "Section updated" : "Section created")
      setSectionForm({ open: false, edit: null })
      fetchSections()
      onRefresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save section")
    }
  }

  async function saveLesson(data: {
    title: string
    description: string
    order: number
    videoUrl: string
    duration: number
    instructorNotes: string
    resources: { title: string; url: string; type: string }[]
  }) {
    const isEdit = lessonForm.edit
    const url = isEdit ? `/api/lessons/${isEdit.id}` : "/api/lessons"
    const method = isEdit ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          order: data.order,
          sectionId: lessonForm.sectionId,
          videoUrl: data.videoUrl,
          duration: data.duration,
          instructorNotes: data.instructorNotes,
          resources: data.resources,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save lesson")
      }
      toast.success(isEdit ? "Lesson updated" : "Lesson created")
      setLessonForm({ open: false, edit: null, sectionId: "" })
      fetchSections()
      onRefresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save lesson")
    }
  }

  async function deleteItem(type: "section" | "lesson", id: string) {
    const url = type === "section" ? `/api/sections/${id}` : `/api/lessons/${id}`

    try {
      const res = await fetch(url, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to delete")
      }
      toast.success(`${type === "section" ? "Section" : "Lesson"} deleted`)
      setDeleteConfirm(null)
      fetchSections()
      onRefresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{courseTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{courseTitle}</DialogTitle>
        <DialogDescription>Manage sections and lessons</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Sections ({sections.length})</h3>
          <Button
            size="xs"
            onClick={() =>
              setSectionForm({ open: true, edit: null })
            }
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Section
          </Button>
        </div>

        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <BookOpen className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No sections yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((section) => {
              const isOpen = expandedSections.has(section.id)
              return (
                <div key={section.id} className="rounded-lg border">
                  <div className="flex items-center justify-between px-3 py-2">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {section.title}
                      <span className="text-xs text-muted-foreground">
                        ({section.lessons.length})
                      </span>
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setLessonForm({
                            open: true,
                            edit: null,
                            sectionId: section.id,
                          })
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setSectionForm({ open: true, edit: section })
                        }
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setDeleteConfirm({
                            type: "section",
                            id: section.id,
                            title: section.title,
                          })
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t divide-y">
                      {section.lessons.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-muted-foreground">
                          No lessons yet
                        </div>
                      ) : (
                        section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-4 py-2 text-sm"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="truncate">{lesson.title}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {Math.floor(lesson.duration / 60)}m
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  setLessonForm({
                                    open: true,
                                    edit: lesson,
                                    sectionId: section.id,
                                  })
                                }
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: "lesson",
                                    id: lesson.id,
                                    title: lesson.title,
                                  })
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>

      {/* Section Form Dialog */}
      <Dialog
        open={sectionForm.open}
        onOpenChange={(open) => {
          if (!open) setSectionForm({ open: false, edit: null })
        }}
      >
        <SectionFormDialog
          edit={sectionForm.edit}
          nextOrder={sections.length + 1}
          onSave={saveSection}
        />
      </Dialog>

      {/* Lesson Form Dialog */}
      <Dialog
        open={lessonForm.open}
        onOpenChange={(open) => {
          if (!open) setLessonForm({ open: false, edit: null, sectionId: "" })
        }}
      >
        <LessonFormDialog
          edit={lessonForm.edit}
          onSave={saveLesson}
        />
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {deleteConfirm?.type === "section" ? "Section" : "Lesson"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteConfirm?.title}&rdquo;? This will also
              remove all lessons inside it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm) deleteItem(deleteConfirm.type, deleteConfirm.id)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContent>
  )
}

/* ──────────────────────────────────────────
   Section Form Dialog
   ────────────────────────────────────────── */

function SectionFormDialog({
  edit,
  nextOrder,
  onSave,
}: {
  edit: SectionWithLessons | null
  nextOrder: number
  onSave: (data: { title: string; order: number }) => Promise<void>
}) {
  const [title, setTitle] = useState(edit?.title ?? "")
  const [saving, setSaving] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    onSave({ title, order: edit?.order ?? nextOrder }).finally(() =>
      setSaving(false)
    )
  }

  return (
    <DialogContent showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{edit ? "Edit Section" : "Add Section"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : edit ? "Update Section" : "Create Section"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

/* ──────────────────────────────────────────
   Lesson Form Dialog
   ────────────────────────────────────────── */

function LessonFormDialog({
  edit,
  onSave,
}: {
  edit: LessonData | null
  onSave: (data: {
    title: string
    description: string
    order: number
    videoUrl: string
    duration: number
    instructorNotes: string
    resources: { title: string; url: string; type: string }[]
  }) => Promise<void>
}) {
  const [title, setTitle] = useState(edit?.title ?? "")
  const [description, setDescription] = useState(edit?.description ?? "")
  const [videoUrl, setVideoUrl] = useState(
    edit?.videoId ? `https://youtube.com/watch?v=${edit.videoId}` : ""
  )
  const [duration, setDuration] = useState(edit?.duration ?? 0)
  const [instructorNotes, setInstructorNotes] = useState(edit?.instructorNotes ?? "")
  const [resources, setResources] = useState<{ title: string; url: string; type: string }[]>(
    edit?.lessonResources?.map((r) => ({ title: r.title, url: r.url, type: r.type })) ?? []
  )
  const [saving, setSaving] = useState(false)

  function addResource() {
    setResources((prev) => [...prev, { title: "", url: "", type: "link" }])
  }

  function updateResource(index: number, field: "title" | "url" | "type", value: string) {
    setResources((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function removeResource(index: number) {
    setResources((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    onSave({
      title,
      description,
      order: edit?.order ?? 1,
      videoUrl,
      duration,
      instructorNotes,
      resources,
    }).finally(() => setSaving(false))
  }

  return (
    <DialogContent showCloseButton={false} className="sm:max-w-xl">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{edit ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Title</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-description">Description</Label>
            <textarea
              id="lesson-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-video">YouTube URL or Video ID</Label>
            <Input
              id="lesson-video"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or video ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-duration">Duration (seconds)</Label>
            <Input
              id="lesson-duration"
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Instructor Notes</Label>
            <RichTextEditor
              value={instructorNotes}
              onChange={setInstructorNotes}
              placeholder="Write instructor notes here..."
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Resources</Label>
              <Button type="button" variant="outline" size="sm" onClick={addResource}>
                <Plus className="mr-1 h-3 w-3" /> Add Resource
              </Button>
            </div>
            {resources.map((r, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Title"
                    value={r.title}
                    onChange={(e) => updateResource(i, "title", e.target.value)}
                    required
                  />
                  <Input
                    placeholder="URL"
                    value={r.url}
                    onChange={(e) => updateResource(i, "url", e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 shrink-0"
                  onClick={() => removeResource(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : edit ? "Update Lesson" : "Create Lesson"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
