"use client"

import { useRef } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type FileUploadProps = {
  accept: string
  maxSize: number
  onUpload: (file: File) => void
  uploading?: boolean
  children: React.ReactNode
}

export function FileUpload({
  accept,
  maxSize,
  onUpload,
  uploading,
  children,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so the same file can be re-selected
    e.target.value = ""

    const allowedTypes = accept.split(",").map((t) => t.trim())
    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type not allowed. Accepted: ${accept}`)
      return
    }

    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / 1024 / 1024)
      toast.error(`File too large. Maximum size is ${maxMB}MB.`)
      return
    }

    onUpload(file)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative cursor-pointer disabled:cursor-not-allowed"
      >
        {children}
        {uploading && (
          <div className="bg-background/60 absolute inset-0 flex items-center justify-center rounded-full">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}
      </button>
    </>
  )
}
