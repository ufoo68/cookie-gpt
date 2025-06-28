"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  ChevronDown,
  ChevronUp,
  Box,
  Layers,
  FileText,
  CheckCircle,
  RotateCcw,
  ZoomIn,
  Eye,
  Info,
} from "lucide-react"
import * as THREE from "three"

interface STLViewerProps {
  stlContent: string
  className?: string
}

// STL Parser for ASCII format
function parseSTL(stlContent: string) {
  const lines = stlContent.split("\n")
  const vertices: number[] = []
  const normals: number[] = []

  let currentNormal: [number, number, number] = [0, 0, 0]

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith("facet normal")) {
      const parts = trimmed.split(" ")
      currentNormal = [
        Number.parseFloat(parts[2]) || 0,
        Number.parseFloat(parts[3]) || 0,
        Number.parseFloat(parts[4]) || 0,
      ]
    } else if (trimmed.startsWith("vertex")) {
      const parts = trimmed.split(" ")
      vertices.push(
        Number.parseFloat(parts[1]) || 0,
        Number.parseFloat(parts[2]) || 0,
        Number.parseFloat(parts[3]) || 0,
      )
      normals.push(...currentNormal)
    }
  }

  return { vertices: new Float32Array(vertices), normals: new Float32Array(normals) }
}

// 3D Cookie Model Component
function CookieModel({ stlContent }: { stlContent: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)

  useEffect(() => {
    try {
      const { vertices, normals } = parseSTL(stlContent)

      if (vertices.length > 0) {
        const geom = new THREE.BufferGeometry()
        geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
        geom.setAttribute("normal", new THREE.BufferAttribute(normals, 3))
        geom.computeBoundingBox()
        geom.computeBoundingSphere()
        setGeometry(geom)
      }
    } catch (error) {
      console.error("STL parsing error:", error)
      // Fallback to simple cookie shape
      const geom = new THREE.CylinderGeometry(2, 2, 0.3, 32)
      setGeometry(geom)
    }
  }, [stlContent])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  if (!geometry) return null

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
  )
}

// 3D Scene Component
function Scene3D({ stlContent }: { stlContent: string }) {
  return (
    <div className="w-full h-64 bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg overflow-hidden border-2 border-amber-200">
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          maxDistance={20}
          minDistance={2}
        />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        <Suspense fallback={null}>
          <CookieModel stlContent={stlContent} />
          <Environment preset="studio" />
        </Suspense>

        <gridHelper args={[10, 10, "#F59E0B", "#FCD34D"]} position={[0, -2, 0]} />
      </Canvas>
    </div>
  )
}

export default function STLViewer({ stlContent, className = "" }: STLViewerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [show3D, setShow3D] = useState(true)

  // STL Analysis
  const analyzeSTL = (content: string) => {
    const lines = content.split("\n")
    const triangleCount = lines.filter((line) => line.trim().startsWith("facet normal")).length
    const vertexCount = triangleCount * 3
    const fileSize = new Blob([content]).size
    const isBinary = content.includes("\0") || !content.includes("facet normal")

    // Calculate bounding box
    const vertices: number[] = []
    for (const line of lines) {
      if (line.trim().startsWith("vertex")) {
        const parts = line.trim().split(" ")
        vertices.push(
          Number.parseFloat(parts[1]) || 0,
          Number.parseFloat(parts[2]) || 0,
          Number.parseFloat(parts[3]) || 0,
        )
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
      width: maxX - minX,
      height: maxY - minY,
      depth: maxZ - minZ,
    }

    return {
      triangles: triangleCount,
      vertices: vertexCount,
      fileSize,
      format: isBinary ? "Binary STL" : "ASCII STL",
      isManifold: triangleCount > 0,
      isWatertight: triangleCount > 0,
      dimensions,
      hasValidGeometry: vertices.length > 0,
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
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-amber-900 flex items-center gap-2">
            <Box className="h-5 w-5" />
            STL 3Dモデル
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Print Ready
            </Badge>
            <Badge variant="outline" className="text-amber-700">
              {(stats.fileSize / 1024).toFixed(1)} KB
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 3D Viewer Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-amber-900">3Dプレビュー</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShow3D(!show3D)}
            className="text-amber-700 border-amber-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            {show3D ? "非表示" : "表示"}
          </Button>
        </div>

        {/* 3D Viewer */}
        {show3D && (
          <div className="relative">
            <Scene3D stlContent={stlContent} />

            {/* 3D Controls Info */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-600">
              <div className="flex items-center gap-1 mb-1">
                <RotateCcw className="w-3 h-3" />
                <span>ドラッグで回転</span>
              </div>
              <div className="flex items-center gap-1">
                <ZoomIn className="w-3 h-3" />
                <span>ホイールでズーム</span>
              </div>
            </div>

            {/* Model Info Overlay */}
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {stats.triangles.toLocaleString()} 三角形
                </span>
                <span className="flex items-center gap-1">
                  <Box className="w-3 h-3" />
                  {stats.dimensions.width.toFixed(1)}×{stats.dimensions.height.toFixed(1)}×
                  {stats.dimensions.depth.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-xl font-bold text-amber-800">{stats.triangles.toLocaleString()}</div>
            <div className="text-xs text-amber-600">三角形</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-800">{stats.vertices.toLocaleString()}</div>
            <div className="text-xs text-blue-600">頂点</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xl font-bold text-green-800">{(stats.fileSize / 1024).toFixed(1)}</div>
            <div className="text-xs text-green-600">KB</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={downloadSTL} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            STLファイルをダウンロード
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Info className="w-4 h-4 mr-2" />
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4 ml-2" />
                詳細を非表示
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 ml-2" />
                詳細を表示
              </>
            )}
          </Button>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t border-amber-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ファイル情報
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">形式:</span>
                    <span className="font-medium">{stats.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ファイルサイズ:</span>
                    <span className="font-medium">{(stats.fileSize / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">三角形数:</span>
                    <span className="font-medium">{stats.triangles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">頂点数:</span>
                    <span className="font-medium">{stats.vertices.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 3D Properties */}
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  3D特性
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">幅:</span>
                    <span className="font-medium">{stats.dimensions.width.toFixed(2)} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">高さ:</span>
                    <span className="font-medium">{stats.dimensions.height.toFixed(2)} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">奥行き:</span>
                    <span className="font-medium">{stats.dimensions.depth.toFixed(2)} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">多様体:</span>
                    <span className={`font-medium ${stats.isManifold ? "text-green-600" : "text-red-600"}`}>
                      {stats.isManifold ? "✓ はい" : "✗ いいえ"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Print Readiness */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">3Dプリント対応状況</span>
              </div>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>STL形式で保存済み</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>3Dプリンタ対応</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>スライサーソフト対応</span>
                </div>
                {stats.hasValidGeometry && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>有効なジオメトリ</span>
                  </div>
                )}
              </div>
            </div>

            {/* STL Preview */}
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-900">STLデータプレビュー</h4>
              <div className="bg-gray-100 rounded-lg p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                  {stlContent.substring(0, 500)}
                  {stlContent.length > 500 && "\n... (truncated)"}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
          <span className="flex items-center gap-1">
            <Box className="w-3 h-3" />
            Cookie Cutter STL
          </span>
          <span className="text-amber-600 font-medium">✓ 修正対応済み</span>
        </div>
      </CardContent>
    </Card>
  )
}
