"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ChevronDown, ChevronRight, Loader2, FileText, Link, Video, ExternalLink, GripVertical, CheckSquare, Square, Play, Pause, Volume2, VolumeX, Maximize, Gauge, RotateCcw, RotateCw, Subtitles, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

interface LessonResource {
  id: string
  title: string
  url: string
  type: string
}

interface LessonData {
  id: string
  title: string
  description: string | null
  duration: number
  videoId: string
  instructorNotes: string | null
  lessonResources: LessonResource[]
}

interface SectionData {
  id: string
  title: string
  lessons: LessonData[]
}

interface CourseData {
  id: string
  title: string
  sections: SectionData[]
  totalLessons: number
}

const SIDEBAR_MIN = 200
const SIDEBAR_MAX = 500
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

let ytApiPromise: Promise<void> | null = null

function loadYTAPI(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve() }
    const s = document.createElement("script")
    s.src = "https://www.youtube.com/iframe_api"
    s.async = true
    document.head.appendChild(s)
  })
  return ytApiPromise
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "00:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedNotes, setExpandedNotes] = useState(false)
  const [expandedResources, setExpandedResources] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(288)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const sidebarRef = useRef<HTMLElement>(null)
  const isDraggingRef = useRef(false)

  const playerContainerRef = useRef<HTMLDivElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const captionsEnabledRef = useRef(false)

  const allLessons = useMemo(
    () => course?.sections.flatMap((s) => s.lessons) ?? [],
    [course?.sections]
  )
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId)
  const currentLesson = allLessons[currentLessonIndex]

  const handleMouseDown = useCallback(() => {
    isDraggingRef.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDraggingRef.current || !sidebarRef.current) return
      const next = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, e.clientX))
      sidebarRef.current.style.width = `${next}px`
    }
    function onMouseUp() {
      if (isDraggingRef.current && sidebarRef.current) {
        const w = parseInt(sidebarRef.current.style.width)
        if (!isNaN(w)) setSidebarWidth(w)
      }
      isDraggingRef.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  useEffect(() => {
    if (!playerContainerRef.current || !currentLesson?.videoId) return
    const container = playerContainerRef.current
    const instanceId = `yt-${lessonId}`
    container.id = instanceId
    let destroyed = false

    async function init() {
      await loadYTAPI()
      if (destroyed) return
      if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null }
      const p = new window.YT.Player(instanceId, {
        height: "100%",
        width: "100%",
        videoId: currentLesson.videoId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1, autoplay: 1 },
        events: {
          onReady: () => { setPlayerReady(true) },
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT.PlayerState.PLAYING) setPlaying(true)
            else if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) setPlaying(false)
          },
          onApiChange: () => {
            if (!captionsEnabledRef.current) return
            let attempts = 0
            function trySetTrack() {
              if (attempts > 3) return
              attempts++
              setTimeout(() => {
                try {
                  playerRef.current?.setOption("captions", "track", { languageCode: "en", fontSize: 0.65 })
                } catch {
                  trySetTrack()
                }
              }, 400)
            }
            trySetTrack()
          },
        } as any,
      })
      playerRef.current = p
    }
    init()
    return () => { destroyed = true; if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null } }
  }, [currentLesson?.videoId, lessonId])

  useEffect(() => {
    if (!playerReady) return
    const interval = setInterval(() => {
      const p = playerRef.current
      if (!p) return
      try {
        const t = p.getCurrentTime()
        const d = p.getDuration()
        if (isFinite(t)) setCurrentTime(t)
        if (isFinite(d)) setVideoDuration(d)
      } catch {}
    }, 250)
    return () => clearInterval(interval)
  }, [playerReady])

  function showControlsTemporarily() {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000)
  }

  const togglePlay = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (p.getPlayerState() === window.YT.PlayerState.PLAYING) { p.pauseVideo(); setPlaying(false) }
    else { p.playVideo(); setPlaying(true) }
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const p = playerRef.current
    if (!p) return
    const val = Number(e.target.value)
    p.seekTo((val / 100) * videoDuration, true)
    setCurrentTime((val / 100) * videoDuration)
  }, [videoDuration])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    const p = playerRef.current
    if (!p) return
    p.setVolume(v)
    setVolume(v)
    if (v > 0 && muted) setMuted(false)
  }, [muted])

  const toggleMute = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (muted) { p.unMute(); setMuted(false) }
    else { p.mute(); setMuted(true) }
  }, [muted])

  const handleFullscreen = useCallback(() => {
    const el = videoContainerRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen()
  }, [])

  const handleSpeedChange = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate)
    setPlaybackRate(rate)
    setShowSpeedMenu(false)
  }, [])

  const handleRewind = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    const t = Math.max(0, p.getCurrentTime() - 5)
    p.seekTo(t, true)
  }, [])

  const handleFastForward = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    const t = Math.min(p.getDuration(), p.getCurrentTime() + 5)
    p.seekTo(t, true)
  }, [])

  const [captionsEnabled, setCaptionsEnabled] = useState(false)
  const toggleCaptions = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    setCaptionsEnabled((prev) => {
      const next = !prev
      captionsEnabledRef.current = next
      try {
        if (next) {
          p.loadModule("captions")
          let attempts = 0
          function trySetTrack() {
            if (attempts > 6) return
            attempts++
            setTimeout(() => {
              try {
                p.setOption("captions", "track", { languageCode: "en", fontSize: 0.65 })
              } catch {
                trySetTrack()
              }
            }, 600)
          }
          trySetTrack()
        } else {
          p.unloadModule("captions")
        }
      } catch {}
      return next
    })
  }, [])

  const QUALITY_OPTIONS = ["auto", "hd1080", "hd720", "large", "medium", "small"] as const
  const QUALITY_LABELS: Record<string, string> = { auto: "Auto", hd1080: "1080p", hd720: "720p", large: "480p", medium: "360p", small: "240p" }
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [currentQuality, setCurrentQuality] = useState("auto")
  const handleQualityChange = useCallback((q: string) => {
    const p = playerRef.current
    if (!p) return
    p.setPlaybackQuality(q)
    setCurrentQuality(q)
    setShowQualityMenu(false)
  }, [])

  useEffect(() => {
    return () => {
      if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null }
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const p = playerRef.current
      if (!p) return
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        const t = Math.max(0, p.getCurrentTime() - 5)
        p.seekTo(t, true)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        const t = Math.min(p.getDuration(), p.getCurrentTime() + 5)
        p.seekTo(t, true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  useEffect(() => {
    fetchProgress()
  }, [courseId])

  async function fetchCourse() {
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      if (!res.ok) return
      const data = await res.json()
      setCourse({
        id: data.id,
        title: data.title,
        totalLessons: data.sections.reduce((acc: number, s: { lessons: LessonData[] }) => acc + s.lessons.length, 0),
        sections: data.sections.map((s: { id: string; title: string; lessons: LessonData[] }) => ({
          id: s.id,
          title: s.title,
          lessons: s.lessons.map((l: LessonData) => ({
            id: l.id,
            title: l.title,
            description: l.description ?? null,
            duration: l.duration,
            videoId: l.videoId,
            instructorNotes: l.instructorNotes ?? null,
            lessonResources: l.lessonResources ?? [],
          })),
        })),
      })
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function fetchProgress() {
    try {
      const res = await fetch(`/api/progress?courseId=${courseId}`)
      if (!res.ok) return
      const data = await res.json()
      setCompletedLessons(new Set(data.filter((p: { completed: boolean }) => p.completed).map((p: { lessonId: string }) => p.lessonId)))
    } catch {}
  }

  async function toggleCompletion(lessonId: string, completed: boolean) {
    setCompletedLessons((prev) => {
      const next = new Set(prev)
      if (completed) next.add(lessonId)
      else next.delete(lessonId)
      return next
    })
    try {
      await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed }),
      })
    } catch {}
  }

  const progress = course?.totalLessons ? Math.round((completedLessons.size / course.totalLessons) * 100) : 0

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Lesson not found
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ─── Sidebar ─── */}
      <aside
        ref={sidebarRef}
        className="hidden shrink-0 overflow-y-auto border-r bg-card md:block"
        style={{ width: sidebarWidth }}
      >
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="flex-1 truncate text-sm font-semibold">{course.title}</h2>
            <div className="relative flex size-9 shrink-0 items-center justify-center">
              <svg className="size-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={100}
                  strokeDashoffset={100 - progress}
                />
              </svg>
              <span className="absolute text-[11px] font-semibold tabular-nums">{progress}%</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {completedLessons.size}/{course.totalLessons} lessons
          </p>
        </div>
        <nav className="p-2">
          {course.sections.map((section) => {
            const isOpen = expandedSections.has(section.id)
            return (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  {isOpen ? (
                    <ChevronDown className="size-3 shrink-0" />
                  ) : (
                    <ChevronRight className="size-3 shrink-0" />
                  )}
                  {section.title}
                </button>
                {isOpen && (
                  <div className="ml-1 space-y-0.5">
                    {section.lessons.map((lesson) => {
                      const isActive = lesson.id === lessonId
                      const isCompleted = completedLessons.has(lesson.id)
                      return (
                        <div key={lesson.id}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleCompletion(lesson.id, !isCompleted)
                              }}
                              className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                              title={isCompleted ? "Mark incomplete" : "Mark complete"}
                            >
                              {isCompleted ? (
                                <CheckSquare className="size-4 text-blue-500" />
                              ) : (
                                <Square className="size-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setExpandedNotes(false)
                                setExpandedResources(false)
                                router.push(`/courses/${courseId}/lessons/${lesson.id}`)
                              }}
                              className={cn(
                                "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                                isActive
                                  ? "bg-primary/10 font-medium text-primary"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <Video className={cn("size-3 shrink-0", isActive ? "text-primary" : "opacity-50")} />
                              <span className="flex-1 truncate">{lesson.title}</span>
                              <span className="shrink-0 opacity-50">{Math.floor(lesson.duration / 60)}m</span>
                            </button>
                          </div>
                          {isActive && (
                            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-2">
                              <button
                                onClick={() => setExpandedNotes((p) => !p)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                {expandedNotes ? (
                                  <ChevronDown className="size-3 shrink-0" />
                                ) : (
                                  <ChevronRight className="size-3 shrink-0" />
                                )}
                                <FileText className="size-3 shrink-0 opacity-50" />
                                Notes
                              </button>
                              {expandedNotes && currentLesson.instructorNotes && (
                                <div className="ml-2 rounded-md border bg-muted/30 p-2 text-xs leading-relaxed text-muted-foreground [&_pre]:rounded [&_pre]:bg-background [&_pre]:p-2 [&_pre]:text-[10px] [&_ul]:pl-3 [&_ol]:pl-3"
                                  dangerouslySetInnerHTML={{ __html: currentLesson.instructorNotes }}
                                />
                              )}
                              {expandedNotes && !currentLesson.instructorNotes && (
                                <div className="ml-2 rounded-md border bg-muted/30 p-2 text-xs text-muted-foreground">
                                  No notes for this lesson
                                </div>
                              )}
                              <button
                                onClick={() => setExpandedResources((p) => !p)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                {expandedResources ? (
                                  <ChevronDown className="size-3 shrink-0" />
                                ) : (
                                  <ChevronRight className="size-3 shrink-0" />
                                )}
                                <Link className="size-3 shrink-0 opacity-50" />
                                Resources
                              </button>
                              {expandedResources && currentLesson.lessonResources.length > 0 && (
                                <div className="ml-2 flex flex-col gap-1">
                                  {currentLesson.lessonResources.map((r) => (
                                    <a
                                      key={r.id}
                                      href={r.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                      <ExternalLink className="size-3 shrink-0" />
                                      <span className="flex-1 truncate">{r.title}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              {expandedResources && currentLesson.lessonResources.length === 0 && (
                                <div className="ml-2 rounded-md border bg-muted/30 p-2 text-xs text-muted-foreground">
                                  No resources for this lesson
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ─── Drag Handle ─── */}
      <div
        className="hidden w-1.5 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-blue-500/30 active:bg-blue-500/50 md:block"
        onMouseDown={handleMouseDown}
      >
        <div className="flex h-full items-center justify-center">
          <GripVertical className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 flex-col min-w-0">
        <div
          ref={videoContainerRef}
          className="group relative aspect-video bg-black"
          onMouseMove={showControlsTemporarily}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => { setShowControls(false); if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }}
        >
          {currentLesson.videoId ? (
            <>
              <div ref={playerContainerRef} className="absolute inset-0" />
              <button
                type="button"
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
              />
              {!playing && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                    <Play className="ml-1 size-6 text-white" />
                  </div>
                </div>
              )}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-200",
                  showControls ? "opacity-100" : "pointer-events-none opacity-0"
                )}
              >
                <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-2 pt-10">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}
                    onChange={handleSeek}
                    className="mb-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white outline-none
                      [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
                      [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={handleRewind} className="flex size-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white" aria-label="Rewind 5 seconds">
                      <RotateCcw className="size-3.5" />
                    </button>
                    <button type="button" onClick={togglePlay} className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30" aria-label={playing ? "Pause" : "Play"}>
                      {playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
                    </button>
                    <button type="button" onClick={handleFastForward} className="flex size-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white" aria-label="Forward 5 seconds">
                      <RotateCw className="size-3.5" />
                    </button>
                    <span className="min-w-[80px] text-xs font-medium text-white/70 tabular-nums">
                      {formatTime(currentTime)} / {formatTime(videoDuration)}
                    </span>
                    <div className="flex-1" />
                    <button type="button" onClick={toggleCaptions} className={cn("flex size-8 items-center justify-center rounded-full transition-colors", captionsEnabled ? "text-blue-400 hover:text-blue-300" : "text-white/60 hover:text-white")} aria-label="Captions">
                      <Subtitles className="size-4" />
                    </button>
                    <button type="button" onClick={toggleMute} className="flex size-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white" aria-label={muted ? "Unmute" : "Mute"}>
                      {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/20 accent-white outline-none
                        [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
                        [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <div className="relative">
                      <button type="button" onClick={() => setShowSpeedMenu((p) => !p)} className={cn("flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors", showSpeedMenu ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10 hover:text-white")}>
                        <Gauge className="size-3.5" />
                        {playbackRate}x
                      </button>
                      {showSpeedMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowSpeedMenu(false)} />
                          <div className="absolute bottom-full right-0 z-50 mb-2 min-w-[72px] overflow-hidden rounded-lg bg-black/90 p-1 shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
                            {PLAYBACK_RATES.map((rate) => (
                              <button key={rate} type="button" onClick={() => handleSpeedChange(rate)} className={cn("flex w-full items-center justify-center rounded-md px-3 py-1.5 text-sm transition-colors", playbackRate === rate ? "bg-white/20 font-medium text-white" : "text-white/60 hover:bg-white/10 hover:text-white")}>
                                {rate}x
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="relative">
                      <button type="button" onClick={() => setShowQualityMenu((p) => !p)} className={cn("flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors", showQualityMenu ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10 hover:text-white")}>
                        <Monitor className="size-3.5" />
                        <span className="hidden sm:inline">{QUALITY_LABELS[currentQuality]}</span>
                      </button>
                      {showQualityMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowQualityMenu(false)} />
                          <div className="absolute bottom-full right-0 z-50 mb-2 min-w-[80px] overflow-hidden rounded-lg bg-black/90 p-1 shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
                            {QUALITY_OPTIONS.map((q) => (
                              <button key={q} type="button" onClick={() => handleQualityChange(q)} className={cn("flex w-full items-center justify-center rounded-md px-3 py-1.5 text-sm transition-colors", currentQuality === q ? "bg-white/20 font-medium text-white" : "text-white/60 hover:bg-white/10 hover:text-white")}>
                                {QUALITY_LABELS[q]}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <button type="button" onClick={handleFullscreen} className="flex size-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white" aria-label="Fullscreen">
                      <Maximize className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p className="text-sm">No video URL configured for this lesson</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={lessonId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl font-bold tracking-tight">
              {currentLesson.title}
            </h1>
            {currentLesson.description && (
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {currentLesson.description}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
