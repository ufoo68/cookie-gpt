"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Sphere, Cylinder } from "@react-three/drei"
import { Suspense } from "react"

interface Cookie3DProps {
  modelUrl: string
  analysis?: string
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

export default function Cookie3DViewer({ modelUrl, analysis }: Cookie3DProps) {
  return (
    <div className="w-full h-48 bg-gradient-to-b from-amber-100 to-orange-200 rounded-xl border-2 border-amber-300 overflow-hidden">
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          <CookieModel analysis={analysis} />
          <OrbitControls enableZoom={true} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  )
}
