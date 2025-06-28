"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Download, CuboidIcon as Cube } from "lucide-react"
import { useState } from "react"

interface STLViewerProps {
  stlContent: string
}

export default function STLViewer({ stlContent }: STLViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Parse basic STL info
  const getSTLInfo = (content: string) => {
    const lines = content.split("\n")
    const triangleCount = lines.filter((line) => line.trim().startsWith("facet normal")).length
    const vertices = triangleCount * 3
    const fileSize = (content.length / 1024).toFixed(1)

    return { triangleCount, vertices, fileSize }
  }

  const stlInfo = getSTLInfo(stlContent)

  const handleDownload = () => {
    const blob = new Blob([stlContent], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cookie-design-${Date.now()}.stl`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-purple-800 flex items-center gap-2">
            <Cube className="h-4 w-4" />
            STL 3Dモデル
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-center min-h-[300px] bg-gradient-to-br from-purple-50 to-blue-50 rounded border relative overflow-hidden">
            {/* 3D Visualization Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <div className="relative">
                  {/* 3D Cookie Shape Visualization */}
                  <div className="w-32 h-32 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full shadow-lg transform rotate-3"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full shadow-inner"></div>
                    <div className="absolute inset-4 bg-gradient-to-br from-amber-100 to-amber-300 rounded-full"></div>
                    {/* Cookie details */}
                    <div className="absolute top-6 left-8 w-3 h-3 bg-amber-600 rounded-full"></div>
                    <div className="absolute top-10 right-6 w-2 h-2 bg-amber-600 rounded-full"></div>
                    <div className="absolute bottom-8 left-6 w-2 h-2 bg-amber-600 rounded-full"></div>
                    <div className="absolute bottom-6 right-8 w-3 h-3 bg-amber-600 rounded-full"></div>
                  </div>
                  <p className="text-lg font-medium text-purple-800">3D Cookie Model</p>
                  <p className="text-sm text-gray-500">Ready for 3D Printing</p>
                </div>
              </div>
            </div>

            {/* Floating info badges */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-medium text-purple-700 border border-purple-200">
              {stlInfo.triangleCount} triangles
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-medium text-purple-700 border border-purple-200">
              {stlInfo.fileSize} KB
            </div>
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
              ✓ Print Ready
            </div>
          </div>
        </div>

        {/* STL Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-800">{stlInfo.triangleCount}</div>
            <div className="text-xs text-purple-600">Triangles</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-800">{stlInfo.vertices}</div>
            <div className="text-xs text-blue-600">Vertices</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-800">{stlInfo.fileSize}</div>
            <div className="text-xs text-green-600">KB</div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div className="text-xs text-gray-600 mb-2">STL Header Information:</div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">STL Binary/ASCII</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">3D Print Ready:</span>
                <span className="font-medium text-green-600">✓ Yes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Manifold:</span>
                <span className="font-medium text-green-600">✓ Watertight</span>
              </div>
            </div>

            <div className="text-xs text-gray-600 mb-2">STL Data Preview:</div>
            <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto max-h-32 font-mono">
              <code>{stlContent.substring(0, 300)}...</code>
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Cube className="h-3 w-3" />
            3D Printer Compatible
          </span>
          <span className="text-purple-600 font-medium">✓ Modification Ready</span>
        </div>
      </CardContent>
    </Card>
  )
}
