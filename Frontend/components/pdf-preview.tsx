"use client"

import { useEffect, useRef, useState } from "react"

interface PdfPreviewProps {
  url: string
  className?: string
  scale?: number
}

export function PdfPreview({ url, className, scale = 0.4 }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function renderFirstPage() {
      try {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs")
        // Use ESM worker and let bundler resolve the URL
        // @ts-ignore
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url)

        const loadingTask = pdfjs.getDocument({ url })
        const pdf = await loadingTask.promise
        if (cancelled) return
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext("2d")
        if (!context) return
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: context, viewport }).promise
      } catch (e) {
        console.error("PDF preview error:", e)
        setFailed(true)
      }
    }

    renderFirstPage()
    return () => {
      cancelled = true
    }
  }, [url, scale])

  if (failed) {
    return (
      <div className={`w-full h-40 bg-gray-100 text-gray-500 text-xs flex items-center justify-center ${className || ""}`}>
        Aperçu PDF non disponible
      </div>
    )
  }

  return <canvas ref={canvasRef} className={className} />
}

export default PdfPreview


