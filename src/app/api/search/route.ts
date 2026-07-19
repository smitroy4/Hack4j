import { prisma } from "@/prisma/client"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")

    if (!q || !q.trim()) {
      return NextResponse.json(
        { error: "Missing query parameter: q" },
        { status: 400 }
      )
    }

    const term = q.trim()

    const [courses, lessons, categories] = await Promise.all([
      prisma.course.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { shortDescription: { contains: term, mode: "insensitive" } },
          ],
        },
        include: { category: true },
        take: 5,
      }),
      prisma.lesson.findMany({
        where: {
          title: { contains: term, mode: "insensitive" },
        },
        include: {
          section: {
            select: {
              title: true,
              course: { select: { title: true, slug: true } },
            },
          },
        },
        take: 5,
      }),
      prisma.category.findMany({
        where: {
          name: { contains: term, mode: "insensitive" },
        },
        take: 5,
      }),
    ])

    return NextResponse.json({ courses, lessons, categories })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
