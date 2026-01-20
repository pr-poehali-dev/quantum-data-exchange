import type React from "react"
import { useGLTF } from "@react-three/drei"
import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import type { BookParams, MaterialProps } from "./types"
import { debugAllObjectsUV, debugUVMapping, generateUVForBothCovers } from "./uv-debugger"
import { TexturePreloader } from "./texture-preloader"

export function Book({
  params,
  materialProps,
  meshRef,
  onReady,
  bookIndex = 0,
}: {
  params: BookParams
  materialProps: MaterialProps
  meshRef: React.MutableRefObject<THREE.Mesh | null>
  onReady?: (ready: boolean) => void
  bookIndex?: number
}) {
  const { scene } = useGLTF("/models/book_red.glb")
  const bookRef = useRef<THREE.Object3D>(null)
  const [bookScene, setBookScene] = useState<THREE.Object3D | null>(null)
  const [object2Mesh, setObject2Mesh] = useState<THREE.Mesh | null>(null)
  const [uvGenerated, setUvGenerated] = useState(false)
  const [defaultTexture, setDefaultTexture] = useState<THREE.Texture | null>(null)
  const [backCoverTexture, setBackCoverTexture] = useState<THREE.Texture | null>(null)
  const [combinedTexture, setCombinedTexture] = useState<THREE.Texture | null>(null)
  const [currentBookIndex, setCurrentBookIndex] = useState<number>(bookIndex)

  const isReady = uvGenerated && combinedTexture && object2Mesh

  useEffect(() => {
    if (onReady) {
      onReady(!!isReady)
    }
  }, [isReady, onReady])

  useEffect(() => {
    if (scene && !bookScene) {
      const clonedScene = scene.clone()
      setBookScene(clonedScene)
    }
  }, [scene, bookScene])

  useEffect(() => {
    if (bookIndex !== currentBookIndex || (!defaultTexture && !backCoverTexture)) {
      setCurrentBookIndex(bookIndex)
      setDefaultTexture(null)
      setBackCoverTexture(null)
      setCombinedTexture(null)

      const loader = new THREE.TextureLoader()
      const preloader = TexturePreloader.getInstance()

      const loadTextureWithFallback = (
        path: string,
        onLoad: (texture: THREE.Texture) => void,
      ) => {
        const preloadedImg = preloader.getPreloadedImage(path)
        if (preloadedImg) {
          const texture = new THREE.Texture(preloadedImg)
          texture.flipY = true
          texture.colorSpace = THREE.SRGBColorSpace
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.minFilter = THREE.LinearFilter
          texture.magFilter = THREE.LinearFilter
          texture.generateMipmaps = false
          texture.needsUpdate = true
          onLoad(texture)
          return
        }

        loader.load(path, onLoad)
      }

      const frontCoverPath = (() => {
        switch (bookIndex) {
          case 0:
            return "/images/x-101-front-cover.jpeg"
          case 1:
            return "/images/we-are-so-back-cover-optimized.jpeg"
          case 2:
            return "/images/vibe-coding-front-cover.jpeg"
          case 3:
            return "/images/how-to-say-please-front-cover.jpeg"
          default:
            return "/images/we-are-so-back-cover-optimized.jpeg"
        }
      })()

      const backCoverPath = (() => {
        switch (bookIndex) {
          case 0:
            return "/images/x-101-back-cover.jpeg"
          case 1:
            return "/images/we-are-so-back-back-cover-optimized.jpeg"
          case 2:
            return "/images/vibe-coding-back-cover.jpeg"
          case 3:
            return "/images/how-to-say-please-back-cover.jpeg"
          default:
            return "/images/we-are-so-back-back-cover-optimized.jpeg"
        }
      })()

      loadTextureWithFallback(frontCoverPath, (texture) => {
        setDefaultTexture(texture)
      })

      loadTextureWithFallback(backCoverPath, (texture) => {
        setBackCoverTexture(texture)
      })
    }
  }, [bookIndex, currentBookIndex, defaultTexture, backCoverTexture])

  useEffect(() => {
    if (bookScene && !uvGenerated) {
      debugAllObjectsUV(bookScene)

      const sketchfabModel = bookScene.getObjectByName("Sketchfab_model")
      if (sketchfabModel) {
        const geode = sketchfabModel.getObjectByName("Geode")
        if (geode) {
          const object2 = geode.getObjectByName("Object_2")
          if (object2 && (object2 as THREE.Mesh).material) {
            const mesh = object2 as THREE.Mesh

            generateUVForBothCovers(mesh)
            setUvGenerated(true)

            debugUVMapping(mesh)

            setObject2Mesh(mesh)
            meshRef.current = mesh
          }
        }
      }
    }
  }, [bookScene, meshRef, uvGenerated])

  const createCombinedTexture = (frontTexture: THREE.Texture, backTexture: THREE.Texture) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    canvas.width = frontTexture.image.width * 2
    canvas.height = frontTexture.image.height

    ctx.drawImage(frontTexture.image, 0, 0, frontTexture.image.width, frontTexture.image.height)
    ctx.drawImage(backTexture.image, frontTexture.image.width, 0, backTexture.image.width, backTexture.image.height)

    const combined = new THREE.CanvasTexture(canvas)
    combined.flipY = true
    combined.colorSpace = THREE.SRGBColorSpace
    combined.wrapS = THREE.ClampToEdgeWrapping
    combined.wrapT = THREE.ClampToEdgeWrapping
    combined.minFilter = THREE.LinearFilter
    combined.magFilter = THREE.LinearFilter
    combined.generateMipmaps = false
    combined.needsUpdate = true

    return combined
  }

  useEffect(() => {
    if (defaultTexture && backCoverTexture) {
      const combined = createCombinedTexture(defaultTexture, backCoverTexture)
      if (combined) {
        setCombinedTexture(combined)
      }
    }
  }, [defaultTexture, backCoverTexture])

  const applyMaterialToMesh = (mesh: THREE.Mesh, props: MaterialProps) => {
    let material = mesh.userData.originalMaterial || mesh.material
    if (Array.isArray(material)) {
      material = material[0]
    }

    const clonedMaterial = (material as THREE.MeshStandardMaterial).clone()

    if (props.texture) {
      clonedMaterial.map = props.texture
      props.texture.offset.set(props.offsetX, props.offsetY)
      clonedMaterial.color.setRGB(1, 1, 1)
      clonedMaterial.metalness = 0.4
      clonedMaterial.roughness = 1
      clonedMaterial.emissive.setRGB(0, 0, 0)
      clonedMaterial.emissiveIntensity = 0
      clonedMaterial.vertexColors = false
      clonedMaterial.transparent = false
      clonedMaterial.opacity = 1
      clonedMaterial.visible = true
      clonedMaterial.polygonOffset = true
      clonedMaterial.polygonOffsetFactor = -1
      clonedMaterial.polygonOffsetUnits = -1
      clonedMaterial.needsUpdate = true

      props.texture.colorSpace = THREE.SRGBColorSpace
      props.texture.flipY = true
    } else {
      clonedMaterial.map = null
      clonedMaterial.color.set(props.color)
      clonedMaterial.emissive.set(props.emissive)
      clonedMaterial.emissiveIntensity = props.emissiveIntensity
      clonedMaterial.metalness = props.metalness
      clonedMaterial.roughness = props.roughness
      clonedMaterial.transparent = false
      clonedMaterial.opacity = 1
      clonedMaterial.visible = true
      clonedMaterial.polygonOffset = true
      clonedMaterial.polygonOffsetFactor = -1
      clonedMaterial.polygonOffsetUnits = -1
      clonedMaterial.needsUpdate = true
    }

    mesh.material = clonedMaterial
  }

  useEffect(() => {
    if (object2Mesh && combinedTexture && uvGenerated) {
      const combinedProps = { ...materialProps, texture: combinedTexture }
      applyMaterialToMesh(object2Mesh, combinedProps)
    }
  }, [object2Mesh, materialProps, combinedTexture, uvGenerated])

  if (!isReady || !bookScene) {
    return null
  }

  return (
    <primitive
      ref={bookRef}
      object={bookScene}
      scale={params.scale}
      position={params.position}
      rotation={params.rotation}
    />
  )
}
