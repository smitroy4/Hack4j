"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import {
  ArrowRight,
  Brain,
  LayoutGrid,
  Cloud,
  Compass,
  Users,
  Rocket,
  Zap,
  Cpu,
  Network,
  Box,
  Activity,
  ChevronRight,
  Star,
  Sparkles,
} from "lucide-react"
import { GoToTop } from "@/components/go-to-top"
import { ParticlesBackground } from "@/components/particles-background"

const milestones = [
  { title: "First Bean Wired", category: "Spring Boot Foundations", icon: Zap },
  { title: "Thread-Safe", category: "Concurrency & JVM", icon: Cpu },
  { title: "Service Decomposed", category: "Microservices", icon: Box },
  { title: "Consensus Reached", category: "Distributed Systems", icon: Network },
  { title: "Cluster Ready", category: "Cloud-Native", icon: Cloud },
  { title: "Production Hardened", category: "Observability", icon: Activity },
]

const pillars = [
  {
    title: "AI-Integrated Systems",
    description:
      "Embed intelligence into every layer — from LLM-powered backends to autonomous agents and real-time ML pipelines that learn and adapt.",
    icon: Brain,
  },
  {
    title: "System Design & Scale",
    description:
      "Architect systems that serve millions. Distributed consensus, event sourcing, CQRS, sharding, and the patterns that power planetary-scale engineering.",
    icon: LayoutGrid,
  },
  {
    title: "Full-Stack Cloud & DevOps",
    description:
      "Java, Spring Boot, React, Kubernetes, Istio, Terraform — full ownership from IDE to production with GitOps, observability, and chaos engineering.",
    icon: Cloud,
  },
  {
    title: "10 Years Ahead",
    description:
      "We don't just learn today's stack. We study where the industry is heading — WebAssembly at the edge, serverless databases, AI-native architectures, and beyond.",
    icon: Compass,
  },
]

function MilestoneCard({ title, category, icon: Icon }: { title: string; category: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-shadow duration-300 hover:border-blue-500/30 hover:shadow-[0_0_40px_-8px_rgba(59,130,246,0.2)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ maskImage: "linear-gradient(to bottom, black, transparent)" }} />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <Icon className="size-4 text-blue-400" />
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide text-blue-400">
            {category}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <ChevronRight className="mt-2 size-4 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-blue-400" />
      </div>
    </motion.div>
  )
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
} as const

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <GoToTop />
      <ParticlesBackground />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
            alt=""
            className="size-full object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)]" />
          {/* floating particles */}
          <div className="absolute left-1/4 top-1/3 size-2 rounded-full bg-blue-400/30 animate-breathe" />
          <div className="absolute right-1/3 top-1/4 size-1.5 rounded-full bg-indigo-400/25 animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute left-1/3 bottom-1/4 size-2 rounded-full bg-blue-300/20 animate-orbit" />
          <div className="absolute right-1/4 bottom-1/3 size-1 rounded-full bg-purple-400/20 animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 sm:pb-32 sm:pt-32 lg:px-8"
        >
          <motion.div variants={itemVariants} className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5 text-xs font-medium text-blue-300">
              <Sparkles className="size-3.5" />
              A community that lives 10 years ahead
            </div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Hack<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent animate-gradient-shift">4j</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl"
            >
              We explore Java, Spring Boot, React, DevOps, and Cloud — then push further into
              AI-integrated systems, advanced distributed architecture, and engineering that scales
              to millions.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ className: "h-10 px-6 text-sm gap-2" }),
                  "group relative overflow-hidden",
                )}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  Join the Community
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                href="/courses"
                className={cn(
                  buttonVariants({ variant: "outline", className: "h-10 px-6 text-sm gap-2" }),
                  "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white",
                )}
              >
                <Star className="size-3.5" />
                Explore Courses
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ───── Our Pillars ───── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative overflow-hidden border-b border-border/40 bg-background py-24 sm:py-28"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1920&q=80"
            alt=""
            className="size-full object-cover opacity-[0.04]"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Pillars
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The four foundations of engineering excellence.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <motion.div
                  key={pillar.title}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-shadow duration-300 hover:border-blue-500/20 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Icon className="size-5 text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-300" />
                    </div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">{pillar.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ───── Milestones ───── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        id="milestones"
        className="relative overflow-hidden border-b border-border/40 bg-background py-24 sm:py-28"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=80"
            alt=""
            className="size-full object-cover opacity-[0.03]"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Milestones
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Key achievements on your journey from Java novice to production-ready engineer.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {milestones.map((m) => (
              <motion.div key={m.title} variants={itemVariants}>
                <MilestoneCard {...m} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ───── Community CTA ───── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative overflow-hidden border-b border-border/40 bg-background py-24 sm:py-28"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt=""
            className="size-full object-cover opacity-[0.04]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent_60%)]" />
        </div>
        <div className="absolute left-1/2 bottom-0 h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div variants={itemVariants}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400">
              <Users className="size-3.5" />
              Open. Community-Driven.
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Not a platform. A community.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Everyone contributes — video content, projects, discussions.
              Grow from learner to publisher as you earn your place in the community.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ className: "h-10 px-6 text-sm gap-2" }),
                  "group",
                )}
              >
                <Rocket className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                Become a Pioneer
              </Link>
              <Link
                href="/courses"
                className={cn(
                  buttonVariants({ variant: "outline", className: "h-10 px-6 text-sm" }),
                )}
              >
                Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ───── FAQ ───── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="border-b border-border/40 py-24 sm:py-28"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <motion.div variants={containerVariants} className="space-y-3">
            {[
              {
                q: "Is Hack4j really a community?",
                a: "Yes. Every member contributes — courses, projects, discussions. We're not a marketplace, we're builders teaching builders.",
              },
              {
                q: "How do I become a publisher?",
                a: "Start by learning and contributing. Active community members are promoted to publisher roles where they can publish video content and courses.",
              },
              {
                q: "What makes this different from other platforms?",
                a: "We're a community, not a marketplace. Content is created by members for members. We focus on deep engineering — not just today's tools but where the industry is heading.",
              },
              {
                q: "Do I need experience to join?",
                a: "Not at all. Our curriculum starts from Java fundamentals and scales all the way to distributed systems and AI integration.",
              },
            ].map((faq, i) => (
              <motion.details
                key={faq.q}
                variants={itemVariants}
                className="group rounded-xl border border-border bg-card transition-all duration-200 open:border-blue-500/20"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-card-foreground">
                  {faq.q}
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="border-t border-border/50 px-5 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </motion.section>

    </div>
  )
}
