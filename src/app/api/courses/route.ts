import { prisma } from "@/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        category: true,
        _count: { select: { sections: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(courses)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Something went wrong" }, { status: 500 })
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
      slug,
      description,
      shortDescription,
      image,
      price,
      published,
      categoryId,
    } = await req.json()

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug" },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        shortDescription,
        image,
        price: price ?? 0,
        published: published ?? false,
        categoryId: categoryId || null,
      },
      include: { category: true },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Something went wrong" }, { status: 500 })
  }
}
