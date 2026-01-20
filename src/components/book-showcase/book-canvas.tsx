import type React from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { TrackballControls, Environment } from "@react-three/drei"
import { Suspense, useRef, useEffect, useState } from "react"
import type * as THREE from "three"
import type { BookParams, MaterialProps } from "./types"
import { Book } from "./book-3d-model"
import { CameraController } from "./camera-controller"
import { applyWebGLFix } from "./webgl-fix"

function RenderDetector({ onFirstRender }: { onFirstRender: () => void }) {
  const hasRendered = useRef(false)

  useFrame(() => {
    if (!hasRendered.current) {
      hasRendered.current = true
      onFirstRender()
    }
  })

  return null
}

export function BookModel({
  params,
  materialProps,
  meshRef,
  onReady,
  bookIndex,
}: {
  params: BookParams
  materialProps: MaterialProps
  meshRef: React.MutableRefObject<THREE.Mesh | null>
  onReady?: (ready: boolean) => void
  bookIndex?: number
}) {
  const controlsRef = useRef<any>()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [hasFirstRender, setHasFirstRender] = useState(false)
  const [webGLError, setWebGLError] = useState(false)

  useEffect(() => {
    const handleGlobalPointerUp = (event: PointerEvent) => {
      if (controlsRef.current) {
        if (typeof controlsRef.current.handlePointerUp === "function") {
          controlsRef.current.handlePointerUp(event)
        } else if (typeof controlsRef.current.onPointerUp === "function") {
          controlsRef.current.onPointerUp(event)
        }
      }
    }

    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (controlsRef.current) {
        if (typeof controlsRef.current.handlePointerUp === "function") {
          controlsRef.current.handlePointerUp(event)
        } else if (typeof controlsRef.current.onPointerUp === "function") {
          controlsRef.current.onPointerUp(event)
        }
      }
    }

    window.addEventListener("pointerup", handleGlobalPointerUp)
    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  const handleBookReady = (ready: boolean) => {
    if (onReady) {
      onReady(ready && hasFirstRender)
    }
  }

  const handleFirstRender = () => {
    setHasFirstRender(true)
  }

  useEffect(() => {
    applyWebGLFix();
    
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
        if (!gl) {
          setWebGLError(true)
          return false
        }
        return true
      } catch (e) {
        setWebGLError(true)
        return false
      }
    }
    
    const hasWebGL = checkWebGL()
    if (hasWebGL && onReady) {
      const timer = setTimeout(() => onReady(true), 100)
      return () => clearTimeout(timer)
    }
  }, [])

  if (webGLError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center p-8">
          <p className="text-white text-lg">3D-модель временно недоступна</p>
          <p className="text-gray-400 text-sm mt-2">Попробуйте обновить страницу</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={canvasRef} className="w-full h-full">
      <Canvas
        className="w-full h-full"
        camera={{ position: params.cameraPosition, fov: params.cameraFov }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        dpr={[1, 2]}
        legacy={true}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        onCreated={(state) => {
          state.gl.setClearColor('#000000', 0)
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-5, 8, 10]} intensity={0.8} color="#fffacd" />
          <Environment preset="sunset" />
          <RenderDetector onFirstRender={handleFirstRender} />
          <Book
            params={params}
            materialProps={materialProps}
            meshRef={meshRef}
            onReady={handleBookReady}
            bookIndex={bookIndex}
          />
          <CameraController params={params} />
          <TrackballControls
            ref={controlsRef}
            noPan={true}
            noZoom={true}
            enableRotate={true}
            staticMoving={false}
            dynamicDampingFactor={0.05}
            rotateSpeed={1.5}
            target={params.position}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}