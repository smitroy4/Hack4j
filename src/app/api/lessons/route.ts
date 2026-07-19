import { prisma } from "@/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { parseVideoId } from "@/utils/video"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sectionId = searchParams.get("sectionId")

    if (!sectionId) {
      return NextResponse.json(
        { error: "Missing query parameter: sectionId" },
        { status: 400 }
      )
    }

    const lessons = await prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(lessons)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.email !== process.env.OWNER_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const {
      title,
      description,
      order,
      sectionId,
      videoUrl,
      videoId,
      duration,
      instructorNotes,
      resources,
    } = await req.json()

    if (!title || order === undefined || !sectionId) {
      return NextResponse.json(
        { error: "Missing required fields: title, order, sectionId" },
        { status: 400 }
      )
    }

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
    })
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    const resolvedVideoId = videoId ?? (videoUrl ? parseVideoId(videoUrl) : null)

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        order,
        sectionId,
        videoId: resolvedVideoId ?? "",
        duration: duration ?? 0,
        instructorNotes,
        lessonResources:
          resources && resources.length > 0
            ? {
                create: resources.map((r: { title: string; url: string; type?: string }) => ({
                  title: r.title,
                  url: r.url,
                  type: r.type ?? "link",
                })),
              }
            : undefined,
      },
      include: { lessonResources: true },
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
