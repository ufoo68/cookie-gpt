"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, RefreshCw } from "lucide-react"

interface STLViewerProps {
  stlContent?: string
  stlUrl?: string
}

export function StlViewer({ stlContent, stlUrl }: STLViewerProps) {
  const [show3DViewer, setShow3DViewer] = useState(true)
  const [viewerError, setViewerError] = useState(false)
  const [useReactStlViewer, setUseReactStlViewer] = useState(true)

  // STL統計情報の計算
  const stlStats = useMemo(() => {
    if (!stlContent) return null

    try {
      const triangleMatches = stlContent.match(/facet normal/g)
      const triangleCount = triangleMatches ? triangleMatches.length : 0

      // 寸法の推定（簡易版）
      const vertexMatches = stlContent.match(/vertex\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)/g)
      if (!vertexMatches) return { triangles: triangleCount, dimensions: "不明" }

      const vertices = vertexMatches.map((match) => {
        const coords = match.replace("vertex", "").trim().split(/\s+/).map(Number)
        return { x: coords[0], y: coords[1], z: coords[2] }
      })

      const bounds = vertices.reduce(
        (acc, vertex) => ({
          minX: Math.min(acc.minX, vertex.x),
          maxX: Math.max(acc.maxX, vertex.x),
          minY: Math.min(acc.minY, vertex.y),
          maxY: Math.max(acc.maxY, vertex.y),
          minZ: Math.min(acc.minZ, vertex.z),
          maxZ: Math.max(acc.maxZ, vertex.z),
        }),
        {
          minX: Number.POSITIVE_INFINITY,
          maxX: Number.NEGATIVE_INFINITY,
          minY: Number.POSITIVE_INFINITY,
          maxY: Number.NEGATIVE_INFINITY,
          minZ: Number.POSITIVE_INFINITY,
          maxZ: Number.NEGATIVE_INFINITY,
        },
      )

      const width = Math.abs(bounds.maxX - bounds.minX).toFixed(1)
      const height = Math.abs(bounds.maxY - bounds.minY).toFixed(1)
      const depth = Math.abs(bounds.maxZ - bounds.minZ).toFixed(1)

      return {
        triangles: triangleCount,
        dimensions: `${width} × ${height} × ${depth} mm`,
        vertices: vertices.length,
      }
    } catch (error) {
      console.error("STL統計計算エラー:", error)
      return { triangles: 0, dimensions: "計算エラー" }
    }
  }, [stlContent])

  // react-stl-viewerのエラーハンドリング付きコンポーネント
  const ReactStlViewerWrapper = () => {
    try {
      // Dynamic import to avoid SSR issues
      const StlViewer = require("react-stl-viewer").StlViewer

      return (
        <StlViewer
          style={{ top: 0, left: 0, width: "100%", height: "320px" }}
          orbitControls
          shadows
          showAxes={false}
          url={stlUrl || ""}
          modelProps={{
            color: "#d97706",
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            scale: 1,
          }}
          floorProps={{
            gridLength: 200,
            gridWidth: 200,
          }}
          cameraProps={{
            position: [3, 3, 3],
          }}
          lightProps={{
            ambientIntensity: 0.4,
            directionalIntensity: 1.0,
          }}
          onError={() => setViewerError(true)}
        />
      )
    } catch (error) {
      console.error("react-stl-viewer エラー:", error)
      setViewerError(true)
      return null
    }
  }

  // フォールバック用のThree.js実装
  const FallbackViewer = () => (
    <div className="w-full h-80 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 flex flex-col items-center justify-center text-amber-800">
      <div className="text-6xl mb-4">🎯</div>
      <div className="text-lg font-semibold mb-2">3Dプレビュー</div>
      <div className="text-sm text-center max-w-xs">
        STLファイルが生成されました。
        <br />
        ダウンロードして3Dプリンターで印刷できます。
      </div>
      {stlStats && (
        <div className="mt-4 text-xs space-y-1 text-center">
          <div>三角形: {stlStats.triangles.toLocaleString()}</div>
          <div>寸法: {stlStats.dimensions}</div>
        </div>
      )}
    </div>
  )

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-sm text-purple-800 flex items-center gap-2">
          🎯 3Dプレビュー
          {viewerError && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              フォールバックモード
            </Badge>
          )}
          <div className="ml-auto flex gap-2">
            {viewerError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setViewerError(false)
                  setUseReactStlViewer(true)
                }}
                className="text-orange-600 hover:text-orange-700"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShow3DViewer(!show3DViewer)}>
              {show3DViewer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {show3DViewer && (
          <div className="bg-white rounded-lg border-2 border-purple-100 overflow-hidden">
            {!viewerError && useReactStlViewer ? <ReactStlViewerWrapper /> : <FallbackViewer />}
          </div>
        )}

        {stlStats && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="font-medium text-purple-800">三角形数</div>
              <div className="text-lg font-bold text-purple-900">{stlStats.triangles.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="font-medium text-purple-800">寸法</div>
              <div className="text-sm font-bold text-purple-900">{stlStats.dimensions}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-3 border border-purple-200">
          <div className="text-sm text-purple-800 space-y-1">
            <div className="font-medium">操作方法:</div>
            <div className="text-xs space-y-1 text-purple-700">
              <div>• 左ドラッグ: 回転</div>
              <div>• 右ドラッグ: パン</div>
              <div>• ホイール: ズーム</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">3Dプリンター対応のSTLファイルです</div>
      </CardContent>
    </Card>
  )
}
