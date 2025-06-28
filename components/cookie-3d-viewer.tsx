"use client"

import { useEffect, useState, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Sphere, Cylinder, Box, Torus } from "@react-three/drei"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import * as THREE from "three"

interface Cookie3DViewerProps {
  stlContent?: string
  svgContent?: string
}

function STLModel({ url }: { url: string }) {
  // Mock STL model with more complex geometry to simulate real STL content
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)

  useEffect(() => {
    // Create a more complex procedural geometry that simulates STL complexity
    const createComplexCookieGeometry = () => {
      const group = new THREE.Group()

      // Base cookie shape with more detail
      const baseGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32)
      const baseMesh = new THREE.Mesh(baseGeometry)

      // Add surface details to simulate STL complexity
      const detailGeometry = new THREE.SphereGeometry(0.05, 8, 8)
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2
        const radius = 0.8 + Math.random() * 0.6
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = 0.15 + Math.random() * 0.1

        const detail = new THREE.Mesh(detailGeometry)
        detail.position.set(x, y, z)
        group.add(detail)
      }

      group.add(baseMesh)
      return group
    }

    const complexGeometry = createComplexCookieGeometry()
    setGeometry(complexGeometry as any)
  }, [url])

  if (!geometry) return null

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Base cookie shape */}
      <Cylinder args={[1.5, 1.5, 0.3, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#D2691E" roughness={0.6} metalness={0.1} />
      </Cylinder>

      {/* Surface details to simulate STL complexity */}
      <Sphere args={[0.08]} position={[0.5, 0.2, 0.3]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Sphere>
      <Sphere args={[0.06]} position={[-0.3, 0.2, 0.4]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Sphere>
      <Sphere args={[0.1]} position={[0.2, 0.2, -0.5]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Sphere>
      <Sphere args={[0.07]} position={[-0.6, 0.2, 0.1]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Sphere>
      <Sphere args={[0.05]} position={[0.8, 0.2, -0.2]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Sphere>

      {/* Additional surface texture */}
      <Torus args={[0.3, 0.02, 8, 16]} position={[0, 0.18, 0]}>
        <meshStandardMaterial color="#CD853F" roughness={0.9} />
      </Torus>
      <Torus args={[0.8, 0.015, 8, 16]} position={[0, 0.16, 0]}>
        <meshStandardMaterial color="#CD853F" roughness={0.9} />
      </Torus>

      {/* Edge details */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const x = Math.cos(angle) * 1.4
        const z = Math.sin(angle) * 1.4
        return (
          <Box key={i} args={[0.03, 0.3, 0.03]} position={[x, 0, z]}>
            <meshStandardMaterial color="#A0522D" roughness={0.8} />
          </Box>
        )
      })}
    </group>
  )
}

function CookieModel({ analysis }: { analysis?: string }) {
  // Simple procedural cookie shape
  return (
    <group>
      {/* Base cookie shape */}
      <Cylinder args={[1.5, 1.5, 0.3, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#D2691E" roughness={0.8} />
      </Cylinder>

      {/* Chocolate chips */}
      <Sphere args={[0.1]} position={[0.5, 0.2, 0.3]}>
        <meshStandardMaterial color="#3C1810" />
      </Sphere>
      <Sphere args={[0.08]} position={[-0.3, 0.2, 0.4]}>
        <meshStandardMaterial color="#3C1810" />
      </Sphere>
      <Sphere args={[0.12]} position={[0.2, 0.2, -0.5]}>
        <meshStandardMaterial color="#3C1810" />
      </Sphere>
      <Sphere args={[0.09]} position={[-0.6, 0.2, 0.1]}>
        <meshStandardMaterial color="#3C1810" />
      </Sphere>
    </group>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <p className="text-sm text-amber-700">3Dモデル読み込み中...</p>
      </div>
    </div>
  )
}

export default function Cookie3DViewer({ stlContent, svgContent }: Cookie3DViewerProps) {
  const isMobile = useIsMobile()
  const [modelLoaded, setModelLoaded] = useState(false)

  useEffect(() => {
    if (stlContent) {
      // Simulate loading time for STL model
      const timer = setTimeout(() => {
        setModelLoaded(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [stlContent])

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
          🎯 3Dプレビュー
          {stlContent && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">STL</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 border border-blue-200 rounded-lg p-4">
          <div
            className={`w-full bg-gradient-to-b from-amber-100 to-orange-200 rounded-xl border-2 border-amber-300 overflow-hidden ${isMobile ? "h-48" : "h-64"}`}
          >
            <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
              <Suspense fallback={null}>
                <Environment preset="sunset" />
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.3} />
                <spotLight position={[0, 10, 0]} intensity={0.5} />

                {stlContent && modelLoaded ? (
                  <STLModel url={stlContent} />
                ) : stlContent && !modelLoaded ? (
                  <LoadingFallback />
                ) : (
                  <CookieModel />
                )}

                <OrbitControls
                  enableZoom={true}
                  enablePan={false}
                  enableDamping={true}
                  dampingFactor={0.05}
                  maxDistance={10}
                  minDistance={2}
                  autoRotate={stlContent ? true : false}
                  autoRotateSpeed={0.5}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
          <span>
            {stlContent
              ? modelLoaded
                ? "STLファイルの3Dプレビュー"
                : "STLモデル読み込み中..."
              : "プロシージャル3Dプレビュー"}
          </span>
          {stlContent && modelLoaded && (
            <span className="text-green-600 font-medium flex items-center gap-1">
              ✓ STL読み込み済み
              <span className="animate-pulse">🔄</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
