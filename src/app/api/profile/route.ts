import { prisma } from "@/prisma/client"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        education: true,
        experience: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
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

    const { name, bio, image, githubUrl, linkedinUrl, portfolioUrl, education, experience } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(portfolioUrl !== undefined && { portfolioUrl }),
        ...(education !== undefined && { education }),
        ...(experience !== undefined && { experience }),
      },
      select: {
        name: true,
        email: true,
        image: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        education: true,
        experience: true,
      },
    })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
