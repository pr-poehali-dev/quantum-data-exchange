import type React from "react"
import * as THREE from "three"
import type { MaterialProps } from "./types"

export const handleImageUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  setMaterialProps: React.Dispatch<React.SetStateAction<MaterialProps>>,
) => {
  const file = event.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string

      const loader = new THREE.TextureLoader()
      loader.load(
        dataUrl,
        (texture) => {
          texture.flipY = true
          texture.colorSpace = THREE.SRGBColorSpace
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.minFilter = THREE.LinearFilter
          texture.magFilter = THREE.LinearFilter
          texture.generateMipmaps = false

          setMaterialProps((prev) => ({
            ...prev,
            texture,
            color: "#ffffff",
          }))
        },
      )
    }
    reader.readAsDataURL(file)
  }
}

export const clearTexture = (
  setMaterialProps: React.Dispatch<React.SetStateAction<MaterialProps>>,
  defaultMaterialProps: MaterialProps,
) => {
  setMaterialProps((prev) => ({
    ...prev,
    texture: null,
    color: defaultMaterialProps.color,
  }))
}
