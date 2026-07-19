import { prisma } from "@/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { parseVideoId } from "@/utils/video"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { lessonId } = await params

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: true },
    })

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json(lesson)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.email !== process.env.OWNER_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { lessonId } = await params

    const existing = await prisma.lesson.findUnique({
      where: { id: lessonId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const { title, description, order, videoUrl, videoId, duration, instructorNotes, resources } =
      await req.json()

    const resolvedVideoId =
      videoId ??
      (videoUrl ? parseVideoId(videoUrl) : undefined)

    // Replace resources if provided
    if (resources !== undefined) {
      await prisma.lessonResource.deleteMany({ where: { lessonId } })
      if (resources.length > 0) {
        await prisma.lessonResource.createMany({
          data: resources.map((r: { title: string; url: string; type?: string }) => ({
            title: r.title,
            url: r.url,
            type: r.type ?? "link",
            lessonId,
          })),
        })
      }
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(resolvedVideoId !== undefined && { videoId: resolvedVideoId }),
        ...(duration !== undefined && { duration }),
        ...(instructorNotes !== undefined && { instructorNotes }),
      },
      include: { lessonResources: true },
    })

    return NextResponse.json(lesson)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.email !== process.env.OWNER_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { lessonId } = await params

    const existing = await prisma.lesson.findUnique({
      where: { id: lessonId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    await prisma.lesson.delete({ where: { id: lessonId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
