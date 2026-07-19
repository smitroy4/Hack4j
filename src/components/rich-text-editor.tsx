"use client"

import { useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const buttons = [
  { label: "B", cmd: "bold" },
  { label: "I", cmd: "italic" },
  { label: "U", cmd: "underline" },
  { label: "H1", cmd: "formatBlock", value: "h2" },
  { label: "H2", cmd: "formatBlock", value: "h3" },
  { label: "•", cmd: "insertUnorderedList" },
  { label: "1.", cmd: "insertOrderedList" },
  { label: "Code", cmd: "formatBlock", value: "pre" },
]

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    const el = editorRef.current
    if (el && !el.innerHTML) {
      el.innerHTML = value
    }
  }, [])

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    onChange(editorRef.current?.innerHTML ?? "")
  }, [onChange])

  const handleInput = useCallback(() => {
    onChange(editorRef.current?.innerHTML ?? "")
  }, [onChange])

  return (
    <div className={cn("rounded-lg border border-input bg-background", className)}>
      <div className="flex flex-wrap gap-0.5 border-b bg-muted/30 px-1.5 py-1">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              exec(btn.cmd, btn.value)
            }}
            className="rounded px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[120px] px-3 py-2 text-sm outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:text-xs [&_ul]:pl-4 [&_ol]:pl-4"
        data-placeholder={placeholder ?? ""}
      />
    </div>
  )
}
