"use client"

import { useState, useRef, useCallback } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Gauge,
} from "lucide-react"
import { cn } from "@/lib/utils"

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "00:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2] as const

interface VideoControlsProps {
  playing: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playbackRate: number
  onPlay: () => void
  onPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onMute: () => void
  onPlaybackRateChange: (rate: number) => void
  onFullscreen: () => void
  onPrevious?: () => void
  onNext?: () => void
}

export function VideoControls({
  playing,
  currentTime,
  duration,
  volume,
  muted,
  playbackRate,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMute,
  onPlaybackRateChange,
  onFullscreen,
  onPrevious,
  onNext,
}: VideoControlsProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const seekRef = useRef<HTMLInputElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeekChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value)
      onSeek((value / 100) * duration)
    },
    [duration, onSeek]
  )

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onVolumeChange(Number(e.target.value))
    },
    [onVolumeChange]
  )

  return (
    <div className="absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 data-[playing=true]:opacity-100">
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-pointer"
        onClick={playing ? onPause : onPlay}
        aria-label={playing ? "Pause" : "Play"}
      />

      <div
        className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-3 pt-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <input
            ref={seekRef}
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={handleSeekChange}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white outline-none
              [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
            aria-label="Seek"
          />
        </div>

        <div className="flex items-center gap-2">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
              aria-label="Previous lesson"
            >
              <SkipBack className="size-4" />
            </button>
          )}

          <button
            type="button"
            onClick={playing ? onPause : onPlay}
            className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5 ml-0.5" />
            )}
          </button>

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
              aria-label="Next lesson"
            >
              <SkipForward className="size-4" />
            </button>
          )}

          <span className="ml-1 min-w-[90px] text-xs font-medium text-white/80 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onMute}
              className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
            <input
              ref={volumeRef}
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-white outline-none
                [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu((p) => !p)}
              className={cn(
                "flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors",
                showSpeedMenu
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
              aria-label="Playback speed"
            >
              <Gauge className="size-3.5" />
              {playbackRate}x
            </button>
            {showSpeedMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSpeedMenu(false)}
                />
                <div className="absolute bottom-full right-0 z-50 mb-2 min-w-[72px] overflow-hidden rounded-lg bg-black/90 p-1 shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        onPlaybackRateChange(rate)
                        setShowSpeedMenu(false)
                      }}
                      className={cn(
                        "flex w-full items-center justify-center rounded-md px-3 py-1.5 text-sm transition-colors",
                        playbackRate === rate
                          ? "bg-white/20 font-medium text-white"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onFullscreen}
            className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
            aria-label="Fullscreen"
          >
            <Maximize className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
