"use client"

import { useState, useMemo, Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Text } from "@react-three/drei"
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
  RotateCcw,
  ZoomIn,
} from "lucide-react"
import * as THREE from "three"

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

// Animated STL mesh component
function STLMesh({ geometry }: { geometry: THREE.BufferGeometry }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  // Calculate scale to fit in viewport
  const scale = useMemo(() => {
    if (!geometry.boundingBox) return 1

    const box = geometry.boundingBox
    const size = new THREE.Vector3()
    box.getSize(size)

    // Get the largest dimension
    const maxDimension = Math.max(size.x, size.y, size.z)

    // Scale to fit within a 3-unit cube
    const targetSize = 3
    return maxDimension > 0 ? targetSize / maxDimension : 1
  }, [geometry])

  // Calculate position to place bottom on ground
  const yOffset = useMemo(() => {
    if (!geometry.boundingBox) return 0

    const box = geometry.boundingBox
    // Move up by half the scaled height to place bottom on ground
    return -(box.min.y * scale)
  }, [geometry, scale])

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      castShadow
      receiveShadow
      scale={[scale, scale, scale]}
      position={[0, yOffset, 0]}
    >
      <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Fallback cookie shape component
function CookieShape() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <group position={[0, 0.15, 0]}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 32]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Cookie chips */}
      <mesh position={[0.4, 0.2, 0.4]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[-0.5, 0.2, 0.2]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0.2, 0.2, -0.6]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[-0.3, 0.2, -0.4]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  )
}

// 3D Scene component
function Scene({ geometry }: { geometry: THREE.BufferGeometry | null }) {
  return (
    <>
      {geometry ? <STLMesh geometry={geometry} /> : <CookieShape />}

      {/* Ground plane */}
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f3f4f6" transparent opacity={0.8} />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[8, 16, "#f59e0b", "#fcd34d"]} position={[0, 0, 0]} />
    </>
  )
}

// Loading component
function LoadingScene() {
  return (
    <>
      <Text position={[0, 0, 0]} fontSize={0.5} color="#d97706" anchorX="center" anchorY="middle">
        Loading 3D Model...
      </Text>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d97706" wireframe />
      </mesh>
    </>
  )
}

export default function STLViewer({ stlContent, className = "" }: STLViewerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [show3D, setShow3D] = useState(true)

  // Parse STL data and create geometry
  const { geometry, stats } = useMemo(() => {
    try {
      // Simple ASCII STL parser
      const lines = stlContent.split("\n")
      const vertices: number[] = []
      const normals: number[] = []
      let triangleCount = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (line.startsWith("facet normal")) {
          const normalMatch = line.match(/facet normal\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)/)
          if (normalMatch) {
            const nx = Number.parseFloat(normalMatch[1]) || 0
            const ny = Number.parseFloat(normalMatch[2]) || 0
            const nz = Number.parseFloat(normalMatch[3]) || 0

            // Read the three vertices
            for (let j = 0; j < 3; j++) {
              i++
              const vertexLine = lines[i]?.trim()
              if (vertexLine?.startsWith("vertex")) {
                const vertexMatch = vertexLine.match(/vertex\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)/)
                if (vertexMatch) {
                  vertices.push(
                    Number.parseFloat(vertexMatch[1]) || 0,
                    Number.parseFloat(vertexMatch[2]) || 0,
                    Number.parseFloat(vertexMatch[3]) || 0,
                  )
                  normals.push(nx, ny, nz)
                }
              }
            }
            triangleCount++
          }
        }
      }

      let geometry: THREE.BufferGeometry | null = null

      if (vertices.length > 0) {
        geometry = new THREE.BufferGeometry()
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
        geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
        geometry.computeBoundingBox()
        geometry.computeBoundingSphere()
        // Don't center the geometry here - we'll handle positioning in the mesh component
      }

      // Calculate dimensions
      const box = geometry?.boundingBox
      const dimensions = box
        ? {
            width: Math.abs(box.max.x - box.min.x),
            height: Math.abs(box.max.y - box.min.y),
            depth: Math.abs(box.max.z - box.min.z),
          }
        : { width: 3, height: 3, depth: 0.6 } // Default cookie dimensions

      const stats: STLStats = {
        triangles: triangleCount,
        vertices: vertices.length / 3,
        fileSize: new Blob([stlContent]).size,
        dimensions,
        isManifold: triangleCount > 0,
        isWatertight: triangleCount > 0,
        format: "ASCII",
      }

      return { geometry, stats }
    } catch (error) {
      console.error("STL parsing error:", error)
      return {
        geometry: null,
        stats: {
          triangles: 0,
          vertices: 0,
          fileSize: new Blob([stlContent]).size,
          dimensions: { width: 3, height: 3, depth: 0.6 },
          isManifold: false,
          isWatertight: false,
          format: "ASCII" as const,
        },
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
              className="text-amber-700 border-amber-300"
            >
              {show3D ? "非表示" : "表示"}
            </Button>
          </div>
        </CardHeader>
        {show3D && (
          <CardContent>
            <div className="relative h-80 w-full rounded-lg overflow-hidden bg-gradient-to-b from-amber-100 to-amber-200">
              <Canvas
                camera={{ position: [4, 4, 4], fov: 50 }}
                shadows
                gl={{ antialias: true, alpha: false }}
                dpr={[1, 2]}
              >
                <Suspense fallback={<LoadingScene />}>
                  <Scene geometry={geometry} />
                  <OrbitControls
                    enablePan
                    enableZoom
                    enableRotate
                    autoRotate={false}
                    maxDistance={15}
                    minDistance={2}
                    enableDamping
                    dampingFactor={0.05}
                    target={[0, 1, 0]}
                  />
                  <Environment preset="studio" />
                  <ambientLight intensity={0.4} />
                  <directionalLight
                    position={[8, 8, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={50}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                  />
                  <pointLight position={[-5, 5, -5]} intensity={0.3} />
                </Suspense>
              </Canvas>

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
                    <Cube className="w-3 h-3" />
                    {stats.triangles.toLocaleString()} 三角形
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {formatDimension(Math.max(stats.dimensions.width, stats.dimensions.height, stats.dimensions.depth))}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-amber-700 text-center">マウスで回転・ズーム・パンができます</div>
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
                className={stats.isManifold ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
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
                className={stats.isWatertight ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {stats.isWatertight ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {stats.isWatertight ? "水密" : "非水密"}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
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
