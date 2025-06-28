"use client"

import { Download, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SVGViewerProps {
  svgContent: string
  onDownload: () => void
}

export default function SVGViewer({ svgContent, onDownload }: SVGViewerProps) {
  const [showCode, setShowCode] = useState(false)

  const downloadSVG = () => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cookie-shape-${Date.now()}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-amber-900">📐 生成されたSVG形状</h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSVG}
            className="text-amber-700 border-amber-300 hover:bg-amber-100 bg-transparent"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SVG Preview */}
      <div className="bg-white p-4 rounded-lg border-2 border-amber-200 flex items-center justify-center min-h-[200px]">
        <div className="max-w-full max-h-[180px]" dangerouslySetInnerHTML={{ __html: svgContent }} />
      </div>

      {/* SVG Code */}
      {showCode && (
        <div className="bg-gray-100 p-3 rounded-lg border border-amber-200">
          <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">{svgContent}</pre>
        </div>
      )}
    </div>
  )
}
