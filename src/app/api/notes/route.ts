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

    if (!lessonId) {
      return NextResponse.json(
        { error: "Missing query parameter: lessonId" },
        { status: 400 }
      )
    }

    const notes = await prisma.note.findMany({
      where: { userId: session.user.id, lessonId },
      orderBy: { timestamp: "asc" },
    })

    return NextResponse.json(notes)
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

    const { lessonId, timestamp, content } = await req.json()

    if (!lessonId || timestamp === undefined || !content) {
      return NextResponse.json(
        { error: "Missing required fields: lessonId, timestamp, content" },
        { status: 400 }
      )
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    })
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        lessonId,
        timestamp,
        content,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    let noteId = searchParams.get("id")

    if (!noteId) {
      const body = await req.json().catch(() => ({}))
      noteId = body.id
    }

    if (!noteId) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      )
    }

    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }
    if (note.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.note.delete({ where: { id: noteId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
