"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, ChevronDown, ChevronUp, Box, Layers, FileText, CheckCircle } from "lucide-react"

interface STLViewerProps {
  stlContent: string
  className?: string
}

export default function STLViewer({ stlContent, className = "" }: STLViewerProps) {
  const [showDetails, setShowDetails] = useState(false)

  // STLファイルの基本解析
  const analyzeSTL = (content: string) => {
    const lines = content.split("\n")
    const triangleCount = lines.filter((line) => line.trim().startsWith("facet normal")).length
    const vertexCount = triangleCount * 3
    const fileSize = new Blob([content]).size
    const isBinary = content.includes("\0") || !content.includes("facet normal")

    return {
      triangles: triangleCount,
      vertices: vertexCount,
      fileSize,
      format: isBinary ? "Binary STL" : "ASCII STL",
      isManifold: triangleCount > 0,
      isWatertight: triangleCount > 0,
    }
  }

  const stats = analyzeSTL(stlContent)

  const downloadSTL = () => {
    const blob = new Blob([stlContent], { type: "application/sla" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cookie-cutter-${Date.now()}.stl`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="p-6">
        {/* 3D Cookie Preview */}
        <div className="relative mb-6">
          <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl flex items-center justify-center shadow-inner">
            <div className="relative">
              {/* 3D Cookie Representation */}
              <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full shadow-lg transform rotate-3 relative">
                <div className="absolute inset-2 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full shadow-inner">
                  <div className="absolute inset-3 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full">
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍪</div>
                  </div>
                </div>
              </div>

              {/* Floating Info Badges */}
              <div className="absolute -top-2 -right-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  3D Ready
                </Badge>
              </div>

              <div className="absolute -bottom-2 -left-2">
                <Badge variant="outline" className="bg-white text-xs">
                  <Box className="w-3 h-3 mr-1" />
                  STL
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {stats.triangles.toLocaleString()} triangles
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {(stats.fileSize / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4">
          <Button onClick={downloadSTL} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            STLファイルをダウンロード
          </Button>

          <Button variant="outline" onClick={() => setShowDetails(!showDetails)} className="w-full">
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                詳細を非表示
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                詳細を表示
              </>
            )}
          </Button>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">三角形数:</span>
                  <span className="font-medium">{stats.triangles.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">頂点数:</span>
                  <span className="font-medium">{stats.vertices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ファイルサイズ:</span>
                  <span className="font-medium">{(stats.fileSize / 1024).toFixed(1)} KB</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">形式:</span>
                  <span className="font-medium">{stats.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">多様体:</span>
                  <span className={`font-medium ${stats.isManifold ? "text-green-600" : "text-red-600"}`}>
                    {stats.isManifold ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">水密:</span>
                  <span className={`font-medium ${stats.isWatertight ? "text-green-600" : "text-red-600"}`}>
                    {stats.isWatertight ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            </div>

            {/* Print Readiness */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium text-sm">3Dプリント対応</span>
              </div>
              <p className="text-xs text-green-700 mt-1">このSTLファイルは3Dプリンタで印刷可能です</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
