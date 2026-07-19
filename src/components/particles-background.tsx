"use client"

import { Particles, ParticlesProvider } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { ISourceOptions } from "@tsparticles/engine"

const options: ISourceOptions = {
  background: { color: "transparent" },
  fpsLimit: 60,
  particles: {
    number: { value: 100, density: { enable: true } },
    color: { value: "#3b82f6" },
    links: {
      enable: true,
      color: "#3b82f6",
      opacity: 0.12,
      distance: 150,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.4,
      direction: "none",
      outModes: { default: "bounce" },
    },
    size: { value: { min: 1, max: 2.5 } },
    opacity: { value: 0.25 },
    shape: { type: "circle" },
  },
  detectRetina: true,
}

export function ParticlesBackground({ className }: { className?: string }) {
  return (
    <ParticlesProvider init={async (engine) => { await loadSlim(engine) }}>
      <Particles
        id="bg-particles"
        options={options}
        className={className ?? "pointer-events-none fixed inset-0 z-0"}
      />
    </ParticlesProvider>
  )
}
