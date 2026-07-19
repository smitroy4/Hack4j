"use client"

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          height?: string | number
          width?: string | number
          videoId?: string
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: (event: { target: unknown }) => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YTPlayer
      PlayerState: {
        UNSTARTED: -1
        ENDED: 0
        PLAYING: 1
        PAUSED: 2
        BUFFERING: 3
        CUED: 5
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  setVolume: (volume: number) => void
  getVolume: () => number
  getCurrentTime: () => number
  getDuration: () => number
  setPlaybackRate: (rate: number) => void
  getPlaybackRate: () => number
  getPlayerState: () => number
  destroy: () => void
}

export interface YouTubePlayerHandle {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number) => void
  setVolume: (volume: number) => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  setPlaybackRate: (rate: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
}

let apiLoaded = false
let apiLoadingPromise: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (apiLoaded) return Promise.resolve()
  if (apiLoadingPromise) return apiLoadingPromise
  apiLoadingPromise = new Promise((resolve) => {
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    tag.async = true
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true
      prev?.()
      resolve()
    }
    document.head.appendChild(tag)
  })
  return apiLoadingPromise
}

interface YouTubePlayerProps {
  videoId: string
  onReady?: () => void
  onStateChange?: (state: number) => void
  onProgress?: (currentTime: number, duration: number) => void
  className?: string
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ videoId, onReady, onStateChange, onProgress, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<YTPlayer | null>(null)
    const readyCalledRef = useRef(false)
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const instanceIdRef = useRef<string>("")

    useImperativeHandle(
      ref,
      () => ({
        playVideo: () => playerRef.current?.playVideo(),
        pauseVideo: () => playerRef.current?.pauseVideo(),
        seekTo: (seconds: number) => playerRef.current?.seekTo(seconds, true),
        setVolume: (volume: number) => playerRef.current?.setVolume(volume),
        mute: () => playerRef.current?.mute(),
        unMute: () => playerRef.current?.unMute(),
        isMuted: () => playerRef.current?.isMuted() ?? false,
        setPlaybackRate: (rate: number) => playerRef.current?.setPlaybackRate(rate),
        getCurrentTime: () => playerRef.current?.getCurrentTime() ?? 0,
        getDuration: () => playerRef.current?.getDuration() ?? 0,
        getPlayerState: () => playerRef.current?.getPlayerState() ?? -1,
      }),
      []
    )

    const handleReady = useCallback(() => {
      if (!readyCalledRef.current) {
        readyCalledRef.current = true
        onReady?.()
      }
    }, [onReady])

    const handleStateChange = useCallback(
      (event: { data: number }) => {
        onStateChange?.(event.data)
      },
      [onStateChange]
    )

    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      instanceIdRef.current = `yt-player-${Math.random().toString(36).slice(2, 9)}`
      container.id = instanceIdRef.current

      let player: YTPlayer | null = null

      async function init() {
        await loadYouTubeAPI()
        const el = containerRef.current
        if (!el) return
        if (instanceIdRef.current !== el.id) return

        if (playerRef.current) {
          playerRef.current.destroy()
          playerRef.current = null
          readyCalledRef.current = false
        }

        player = new window.YT.Player(el.id, {
          height: "100%",
          width: "100%",
          videoId,
          playerVars: {
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: handleReady,
            onStateChange: handleStateChange,
          },
        })

        playerRef.current = player
      }

      init()

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
        if (player) {
          player.destroy()
          playerRef.current = null
          readyCalledRef.current = false
        }
      }
    }, [videoId, handleReady, handleStateChange])

    useEffect(() => {
      if (!onProgress) return

      progressIntervalRef.current = setInterval(() => {
        const p = playerRef.current
        if (p?.getCurrentTime && p?.getDuration) {
          try {
            const t = p.getCurrentTime()
            const d = p.getDuration()
            if (isFinite(d)) {
              onProgress(t, d)
            }
          } catch {
            // player not ready
          }
        }
      }, 250)

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
      }
    }, [onProgress])

    return (
      <div className={cn("relative aspect-video bg-black overflow-hidden", className)}>
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    )
  }
)

YouTubePlayer.displayName = "YouTubePlayer"
