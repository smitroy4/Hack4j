import { prisma } from "@/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        sections: {
          include: {
            lessons: {
              include: { lessonResources: true },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.email !== process.env.OWNER_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { courseId } = await params

    const existing = await prisma.course.findUnique({
      where: { id: courseId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const {
      title,
      slug,
      description,
      shortDescription,
      image,
      price,
      published,
      categoryId,
    } = await req.json()

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(image !== undefined && { image }),
        ...(price !== undefined && { price }),
        ...(published !== undefined && { published }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: { category: true },
    })

    return NextResponse.json(course)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.email !== process.env.OWNER_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { courseId } = await params

    const existing = await prisma.course.findUnique({
      where: { id: courseId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    await prisma.course.delete({ where: { id: courseId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
