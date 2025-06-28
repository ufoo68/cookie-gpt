"use client"

import { useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Sphere, Cylinder } from "@react-three/drei"
import { Suspense } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Cookie3DProps {
  modelUrl: string
  analysis?: string
}

interface Cookie3DViewerProps {
  stlUrl?: string
}

function CookieModel({ analysis }: { analysis?: string }) {
  // Simple procedural cookie shape based on analysis
  // In a real implementation, this would be generated from the AI analysis
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

export default function Cookie3DViewer({ stlUrl }: Cookie3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple 3D-like visualization
    ctx.fillStyle = "#F59E0B"
    ctx.fillRect(50, 50, 100, 100)
    ctx.fillStyle = "#D97706"
    ctx.fillRect(60, 40, 100, 100)
    ctx.fillStyle = "#92400E"
    ctx.fillRect(70, 30, 100, 100)

    // Add some text
    ctx.fillStyle = "#1F2937"
    ctx.font = "14px sans-serif"
    ctx.fillText("3D Preview", 80, 120)
  }, [stlUrl])

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">🎯 3Dプレビュー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 border border-blue-200 rounded-lg p-4">
          {stlUrl ? (
            <canvas ref={canvasRef} width={200} height={150} className="w-full h-32 border rounded bg-white" />
          ) : (
            <div
              className={`w-full bg-gradient-to-b from-amber-100 to-orange-200 rounded-xl border-2 border-amber-300 overflow-hidden ${isMobile ? "h-48" : "h-full"}`}
            >
              <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
                <Suspense fallback={null}>
                  <Environment preset="sunset" />
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <pointLight position={[-10, -10, -5]} intensity={0.3} />
                  <CookieModel />
                  <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    enableDamping={true}
                    dampingFactor={0.05}
                    maxDistance={10}
                    minDistance={2}
                  />
                </Suspense>
              </Canvas>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-2">3Dモデルのプレビューです</div>
      </CardContent>
    </Card>
  )
}
