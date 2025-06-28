"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SVGViewerProps {
  svgContent: string
}

export default function SVGViewer({ svgContent }: SVGViewerProps) {
  // Create a data URL for the SVG
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="text-sm text-purple-800 flex items-center gap-2">🎨 SVGプレビュー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-purple-200 rounded-lg p-4 overflow-hidden">
          <div className="flex items-center justify-center min-h-[200px]">
            <img
              src={svgDataUrl || "/placeholder.svg"}
              alt="Generated SVG"
              className="max-w-full max-h-full object-contain"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                width: "auto",
                height: "auto",
              }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">生成されたSVGイラストです</div>
      </CardContent>
    </Card>
  )
}
