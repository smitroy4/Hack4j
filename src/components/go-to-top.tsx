"use client"

import { useState, useEffect } from "react"
import { Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

export function GoToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-8 right-8 z-50 flex size-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-background/70 text-blue-400 shadow-lg shadow-blue-500/10 backdrop-blur-xl transition-all duration-500 hover:border-blue-400/40 hover:shadow-blue-500/25 hover:scale-110",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <Rocket className="size-5 -rotate-45 animate-float" />
    </button>
  )
}
