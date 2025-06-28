"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface STLViewerProps {
  stlContent: string;
}

export default function STLViewer({ stlContent }: STLViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 50);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Load STL
    const loader = new STLLoader();
    try {
      const geometry = loader.parse(stlContent);
      const material = new THREE.MeshStandardMaterial({ color: 0x0055ff });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Adjust camera to fit the model
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5; // Add some padding
      camera.position.set(center.x, center.y, center.z + cameraZ);
      camera.lookAt(center);
    } catch (error) {
      console.error("Error loading STL:", error);
      // Optionally display an error message in the viewer
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
      // Dispose geometries and materials if they were successfully loaded
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    };
  }, [stlContent]);

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-purple-800 flex items-center gap-2">🏗️ STLプレビュー</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-purple-200 rounded-lg p-4">
          <div
            ref={mountRef}
            className="flex items-center justify-center min-h-[200px] bg-gradient-to-br from-purple-50 to-blue-50 rounded border"
            style={{ width: "100%", height: "400px" }}
          />
        </div>
        {isExpanded && (
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-2">STLデータ（先頭200文字）:</div>
            <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto max-h-40 font-mono">
              <code>{stlContent.substring(0, 200)}...</code>
            </pre>
            <div className="mt-2 text-xs text-gray-500">ファイルサイズ: {(stlContent.length / 1024).toFixed(1)} KB</div>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
          <span>3Dプリンター用STLファイル</span>
          <span className="text-purple-600 font-medium">✓ 修正可能</span>
        </div>
      </CardContent>
    </Card>
  );
}
