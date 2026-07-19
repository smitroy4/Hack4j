import { prisma } from "@/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get("lessonId")
    const courseId = searchParams.get("courseId")

    if (lessonId) {
      const progress = await prisma.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: session.user.id, lessonId } },
      })
      if (!progress) {
        return NextResponse.json({ error: "Progress not found" }, { status: 404 })
      }
      return NextResponse.json(progress)
    }

    if (courseId) {
      const lessons = await prisma.lesson.findMany({
        where: { section: { courseId } },
        select: { id: true },
      })
      const lessonIds = lessons.map((l) => l.id)
      const progress = await prisma.lessonProgress.findMany({
        where: { userId: session.user.id, lessonId: { in: lessonIds } },
      })
      return NextResponse.json(progress)
    }

    return NextResponse.json(
      { error: "Missing query parameter: lessonId or courseId" },
      { status: 400 }
    )
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { lessonId, currentTime, completed, completionPct } = await req.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: "Missing required field: lessonId" },
        { status: 400 }
      )
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    })
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      update: {
        ...(currentTime !== undefined && { currentTime }),
        ...(completed !== undefined && { completed }),
        ...(completionPct !== undefined && { completionPct }),
        lastWatchedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId,
        currentTime: currentTime ?? 0,
        completed: completed ?? false,
        completionPct: completionPct ?? 0,
      },
    })

    return NextResponse.json(progress)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
