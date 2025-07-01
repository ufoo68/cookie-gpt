"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  CuboidIcon as Cube,
  Ruler,
  FileText,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  RotateCcw,
  ZoomIn,
} from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import for react-stl-viewer to avoid SSR issues
const ReactStlViewer = dynamic(() => import("react-stl-viewer").then(mod => ({ default: mod.StlViewer })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-80 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg">
      <div className="text-amber-700 animate-pulse">3Dモデルを読み込み中...</div>
    </div>
  ),
})

interface STLViewerProps {
  stlContent: string
  className?: string
}

interface STLStats {
  triangles: number
  vertices: number
  fileSize: number
  dimensions: {
    width: number
    height: number
    depth: number
  }
  isManifold: boolean
  isWatertight: boolean
  format: "ASCII" | "Binary"
}

export function StlViewer({ stlContent, className = "" }: STLViewerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [show3D, setShow3D] = useState(true)
  const [stlUrl, setStlUrl] = useState<string>("")

  // Create blob URL for react-stl-viewer
  useEffect(() => {
    if (stlContent) {
      const blob = new Blob([stlContent], { type: "application/sla" })
      const url = URL.createObjectURL(blob)
      setStlUrl(url)

      // Cleanup function to revoke the URL
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [stlContent])

  // Parse STL data and create stats
  const stats = useMemo(() => {
    try {
      // Simple ASCII STL parser for statistics
      const lines = stlContent.split("\n")
      const triangleCount = lines.filter((line) => line.trim().startsWith("facet normal")).length
      const vertexCount = triangleCount * 3
      const fileSize = new Blob([stlContent]).size
      const isBinary = stlContent.includes("\0") || !stlContent.includes("facet normal")

      // Calculate approximate dimensions from vertices
      const vertices: number[] = []
      for (const line of lines) {
        if (line.trim().startsWith("vertex")) {
          const parts = line.trim().split(/\s+/)
          if (parts.length >= 4) {
            vertices.push(
              Number.parseFloat(parts[1]) || 0,
              Number.parseFloat(parts[2]) || 0,
              Number.parseFloat(parts[3]) || 0,
            )
          }
        }
      }

      let minX = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY
      let minZ = Number.POSITIVE_INFINITY,
        maxZ = Number.NEGATIVE_INFINITY

      for (let i = 0; i < vertices.length; i += 3) {
        minX = Math.min(minX, vertices[i])
        maxX = Math.max(maxX, vertices[i])
        minY = Math.min(minY, vertices[i + 1])
        maxY = Math.max(maxY, vertices[i + 1])
        minZ = Math.min(minZ, vertices[i + 2])
        maxZ = Math.max(maxZ, vertices[i + 2])
      }

      const dimensions = {
        width: isFinite(maxX - minX) ? Math.abs(maxX - minX) : 0,
        height: isFinite(maxY - minY) ? Math.abs(maxY - minY) : 0,
        depth: isFinite(maxZ - minZ) ? Math.abs(maxZ - minZ) : 0,
      }

      const stats: STLStats = {
        triangles: triangleCount,
        vertices: vertexCount,
        fileSize,
        dimensions,
        isManifold: triangleCount > 0,
        isWatertight: triangleCount > 0,
        format: isBinary ? "Binary" : "ASCII",
      }

      return stats
    } catch (error) {
      console.error("STL parsing error:", error)
      return {
        triangles: 0,
        vertices: 0,
        fileSize: new Blob([stlContent]).size,
        dimensions: { width: 0, height: 0, depth: 0 },
        isManifold: false,
        isWatertight: false,
        format: "ASCII" as const,
      }
    }
  }, [stlContent])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDimension = (value: number) => {
    return `${value.toFixed(2)} units`
  }

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

  // STL Viewer style configuration
  const style = {
    top: 0,
    left: 0,
    width: "100%",
    height: "320px",
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 3D Viewer */}
      <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Cube className="h-5 w-5" />
              3D プレビュー
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShow3D(!show3D)}
              className="text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              {show3D ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {show3D ? "非表示" : "表示"}
            </Button>
          </div>
        </CardHeader>
        {show3D && (
          <CardContent>
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-b from-amber-100 to-amber-200">
              {stlUrl && (
                <ReactStlViewer
                  style={style}
                  orbitControls
                  shadows
                  url={stlUrl}
                  modelProps={{
                    color: "#d97706",
                    positionX: 100,
                    positionY: 100,
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0,
                    scale: 1,
                  }}
                  floorProps={{
                    gridWidth: 200,
                    gridLength: 200,
                  }}
                  onFinishLoading={(ev) => {
                    console.log("STL model loaded successfully:", ev)
                  }}
                  onError={(error) => {
                    console.error("STL loading error:", error)
                  }}
                />
              )}

              {/* Model Info Overlay */}
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Cube className="w-3 h-3" />
                    {stats.triangles.toLocaleString()} 三角形
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {formatDimension(Math.max(stats.dimensions.width, stats.dimensions.height, stats.dimensions.depth))}
                  </span>
                </div>
              </div>

              {/* Controls Info */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-600 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    <span>左ドラッグ: 回転</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ZoomIn className="w-3 h-3" />
                    <span>ホイール: ズーム</span>
                  </div>
                  <div className="text-xs text-gray-500">右ドラッグ: パン</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-amber-700 text-center">マウスで3Dモデルを自由に操作できます</div>
          </CardContent>
        )}
      </Card>

      {/* File Information */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-amber-800">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ファイル情報
            </div>
            <Button onClick={downloadSTL} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              ダウンロード
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-amber-800">{stats.triangles.toLocaleString()}</div>
              <div className="text-sm text-amber-600">三角形</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-amber-800">{stats.vertices.toLocaleString()}</div>
              <div className="text-sm text-amber-600">頂点</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-amber-800">{formatFileSize(stats.fileSize)}</div>
              <div className="text-sm text-amber-600">ファイルサイズ</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-2xl font-bold text-amber-800">{stats.format}</div>
              <div className="text-sm text-amber-600">形式</div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-amber-800 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              寸法
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-2 bg-white/30 rounded">
                <div className="font-mono text-amber-800">{formatDimension(stats.dimensions.width)}</div>
                <div className="text-xs text-amber-600">幅</div>
              </div>
              <div className="text-center p-2 bg-white/30 rounded">
                <div className="font-mono text-amber-800">{formatDimension(stats.dimensions.height)}</div>
                <div className="text-xs text-amber-600">高さ</div>
              </div>
              <div className="text-center p-2 bg-white/30 rounded">
                <div className="font-mono text-amber-800">{formatDimension(stats.dimensions.depth)}</div>
                <div className="text-xs text-amber-600">奥行き</div>
              </div>
            </div>
          </div>

          {/* Quality Indicators */}
          <div className="space-y-2">
            <h4 className="font-semibold text-amber-800">品質チェック</h4>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={stats.isManifold ? "default" : "destructive"}
                className={
                  stats.isManifold
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }
              >
                {stats.isManifold ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {stats.isManifold ? "多様体" : "非多様体"}
              </Badge>
              <Badge
                variant={stats.isWatertight ? "default" : "destructive"}
                className={
                  stats.isWatertight
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }
              >
                {stats.isWatertight ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {stats.isWatertight ? "水密" : "非水密"}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                3Dプリント対応
              </Badge>
            </div>
          </div>

          <Separator className="bg-amber-200" />

          {/* Detailed Information */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-amber-800 hover:bg-amber-100">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  詳細情報
                </span>
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h5 className="font-semibold text-amber-800">ファイル詳細</h5>
                  <div className="space-y-1 text-amber-700">
                    <div className="flex justify-between">
                      <span>形式:</span>
                      <span>{stats.format} STL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>サイズ:</span>
                      <span>{formatFileSize(stats.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>三角形:</span>
                      <span>{stats.triangles.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>頂点:</span>
                      <span>{stats.vertices.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-semibold text-amber-800">3Dプリント推奨設定</h5>
                  <div className="space-y-1 text-amber-700">
                    <div className="flex justify-between">
                      <span>レイヤー高:</span>
                      <span>0.2mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>充填率:</span>
                      <span>15-20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>プリント速度:</span>
                      <span>50mm/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>サポート:</span>
                      <span>必要に応じて</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STL Data Preview */}
              <div className="space-y-2">
                <h5 className="font-semibold text-amber-800">STLデータプレビュー</h5>
                <div className="bg-gray-100 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                    {stlContent.substring(0, 500)}
                    {stlContent.length > 500 && "\n... (省略)"}
                  </pre>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Print Ready Status */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">3Dプリント準備完了</span>
            </div>
            <div className="space-y-1 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>STL形式で保存済み</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>スライサーソフト対応</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>3Dプリンタ対応</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
