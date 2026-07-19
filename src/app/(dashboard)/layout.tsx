import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "./_components/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const isOwner = session?.user?.email === process.env.OWNER_EMAIL

  return (
    <DashboardShell user={session.user} isOwner={isOwner}>
      {children}
    </DashboardShell>
  )
}
