import type React from "react"

import { Button } from "@/components/ui/button"
import { Copy, RotateCcw } from "lucide-react"
import type * as THREE from "three"
import type { BookParams, MaterialProps } from "./types"
import { generateUVForObject2 } from "./uv-debugger"
import { handleImageUpload, clearTexture } from "./texture-manager"

interface DebugPanelProps {
  debugMode: boolean
  params: BookParams
  materialProps: MaterialProps
  defaultMaterialProps: MaterialProps
  object2MeshRef: React.MutableRefObject<THREE.Mesh | null>
  setParams: React.Dispatch<React.SetStateAction<BookParams>>
  setMaterialProps: React.Dispatch<React.SetStateAction<MaterialProps>>
  resetParams: () => void
  copyParams: () => void
}

export function DebugPanel({
  debugMode,
  params,
  materialProps,
  defaultMaterialProps,
  object2MeshRef,
  setParams,
  setMaterialProps,
  resetParams,
  copyParams,
}: DebugPanelProps) {
  const updateMaterialProp = (prop: keyof MaterialProps, value: number | string) => {
    setMaterialProps((prev) => ({
      ...prev,
      [prop]: value,
    }))
  }

  const updateParam = (param: keyof BookParams, index: number, value: number) => {
    setParams((prev) => ({
      ...prev,
      [param]: (prev[param] as number[]).map((v, i) => (i === index ? value : v)) as [number, number, number],
    }))
  }

  if (!debugMode) return null

  return (
    <div className="hidden lg:block fixed top-16 right-4 z-40 w-80 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Управление книгой</h3>
        <div className="flex gap-2">
          <Button
            onClick={resetParams}
            variant="outline"
            size="sm"
            className="bg-transparent border-white/30 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Сброс
          </Button>
          <Button
            onClick={copyParams}
            variant="outline"
            size="sm"
            className="bg-transparent border-white/30 text-white hover:bg-white/10"
          >
            <Copy className="w-4 h-4 mr-1" />
            Копировать
          </Button>
        </div>
      </div>

      <div className="space-y-3 text-sm border-t border-white/20 pt-4">
        <h4 className="text-white font-medium">Материал обложки</h4>

        <div>
          <Button
            onClick={() => generateUVForObject2(object2MeshRef.current)}
            variant="outline"
            size="sm"
            className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 text-xs mb-2"
          >
            Сгенерировать UV
          </Button>
        </div>

        <div>
          <label className="text-white/70 block mb-1">Загрузка текстуры</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, setMaterialProps)}
            className="w-full text-white/70 text-xs bg-transparent border border-white/30 rounded p-1"
          />
          {materialProps.texture && (
            <Button
              onClick={() => clearTexture(setMaterialProps, defaultMaterialProps)}
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent border-white/30 text-white hover:bg-white/10 text-xs"
            >
              Очистить текстуру
            </Button>
          )}
        </div>

        <div>
          <label className="text-white/70 block mb-1">Цвет</label>
          <input
            type="color"
            value={materialProps.texture ? "#ffffff" : materialProps.color}
            onChange={(e) => updateMaterialProp("color", e.target.value)}
            disabled={!!materialProps.texture}
            className="w-full h-8 rounded border border-white/30"
          />
        </div>

        <div>
          <label className="text-white/70 block mb-1">Металличность</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={materialProps.metalness}
            onChange={(e) => updateMaterialProp("metalness", Number.parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-white/50 text-xs">{materialProps.metalness.toFixed(2)}</div>
        </div>

        <div>
          <label className="text-white/70 block mb-1">Шероховатость</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={materialProps.roughness}
            onChange={(e) => updateMaterialProp("roughness", Number.parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-white/50 text-xs">{materialProps.roughness.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-3 text-sm border-t border-white/20 pt-4">
        <h4 className="text-white font-medium">Трансформация</h4>

        <div>
          <label className="text-white/70 block mb-1">Масштаб</label>
          {params.scale.map((val, i) => (
            <input
              key={`scale-${i}`}
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={val}
              onChange={(e) => updateParam("scale", i, Number.parseFloat(e.target.value))}
              className="w-full mb-1"
            />
          ))}
          <div className="text-white/50 text-xs">[{params.scale.join(", ")}]</div>
        </div>

        <div>
          <label className="text-white/70 block mb-1">Позиция</label>
          {params.position.map((val, i) => (
            <input
              key={`position-${i}`}
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={val}
              onChange={(e) => updateParam("position", i, Number.parseFloat(e.target.value))}
              className="w-full mb-1"
            />
          ))}
          <div className="text-white/50 text-xs">[{params.position.map((v) => v.toFixed(1)).join(", ")}]</div>
        </div>

        <div>
          <label className="text-white/70 block mb-1">Вращение</label>
          {params.rotation.map((val, i) => (
            <input
              key={`rotation-${i}`}
              type="range"
              min={-Math.PI * 2}
              max={Math.PI * 2}
              step="0.1"
              value={val}
              onChange={(e) => updateParam("rotation", i, Number.parseFloat(e.target.value))}
              className="w-full mb-1"
            />
          ))}
          <div className="text-white/50 text-xs">[{params.rotation.map((v) => v.toFixed(1)).join(", ")}]</div>
        </div>

        <div>
          <label className="text-white/70 block mb-1">FOV камеры</label>
          <input
            type="range"
            min="20"
            max="100"
            step="1"
            value={params.cameraFov || 36}
            onChange={(e) => setParams((prev) => ({ ...prev, cameraFov: Number.parseInt(e.target.value) }))}
            className="w-full mb-1"
          />
          <div className="text-white/50 text-xs">{params.cameraFov || 36}</div>
        </div>
      </div>
    </div>
  )
}
