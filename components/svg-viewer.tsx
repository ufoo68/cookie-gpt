"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Eye, EyeOff } from "lucide-react"

interface SVGViewerProps {
  svgContent: string
  onDownload?: () => void
}

export function SvgViewer({ svgContent, onDownload }: SVGViewerProps) {
  const [showPreview, setShowPreview] = useState(true)

  const handleDownload = () => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "cookie-design.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    if (onDownload) {
      onDownload()
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
          📐 SVGデザイン
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="ml-auto">
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPreview && (
          <div className="bg-white rounded-lg p-4 border-2 border-blue-100">
            <div
              className="w-full h-64 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        )}

        <Button onClick={handleDownload} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          SVGファイルをダウンロード
        </Button>

        <div className="text-xs text-gray-500 text-center">ベクター形式のデザインファイルです</div>
      </CardContent>
    </Card>
  )
}
