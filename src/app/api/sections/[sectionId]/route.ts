import { prisma } from "@/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.email !== process.env.OWNER_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { sectionId } = await params

    const existing = await prisma.section.findUnique({
      where: { id: sectionId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    const { title, order } = await req.json()

    const section = await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(title !== undefined && { title }),
        ...(order !== undefined && { order }),
      },
      include: { lessons: { orderBy: { order: "asc" } } },
    })

    return NextResponse.json(section)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.email !== process.env.OWNER_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { sectionId } = await params

    const existing = await prisma.section.findUnique({
      where: { id: sectionId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    await prisma.section.delete({ where: { id: sectionId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
