"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment } from "@react-three/drei"
import { Suspense } from "react"

interface Cookie3DProps {
  modelUrl: string
}

function CookieModel({ modelUrl }: Cookie3DProps) {
  const { scene } = useGLTF(modelUrl)
  return <primitive object={scene} scale={2} />
}

export default function Cookie3DViewer({ modelUrl }: Cookie3DProps) {
  return (
    <div className="w-full h-48 bg-gradient-to-b from-amber-100 to-orange-200 rounded-xl border-2 border-amber-300 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <CookieModel modelUrl={modelUrl} />
          <OrbitControls enableZoom={true} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  )
}
