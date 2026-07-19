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
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json(
        { error: "Missing query parameter: courseId" },
        { status: 400 }
      )
    }

    const sections = await prisma.section.findMany({
      where: { courseId },
      include: {
        lessons: {
          include: { lessonResources: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(sections)
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

    const { title, order, courseId } = await req.json()

    if (!title || order === undefined || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields: title, order, courseId" },
        { status: 400 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const section = await prisma.section.create({
      data: { title, order, courseId },
      include: { lessons: { orderBy: { order: "asc" } } },
    })

    return NextResponse.json(section, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
