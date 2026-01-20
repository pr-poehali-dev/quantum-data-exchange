import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import type * as THREE from "three"
import type { BookParams, MaterialProps } from "./types"
import { BookModel } from "./book-canvas"
import { BookDetails } from "./book-details"
import { DebugPanel } from "./debug-panel"
import { booksData } from "./book-data"
import { TexturePreloader } from "./texture-preloader"

export default function BookShowcase() {
  const [currentBookIndex, setCurrentBookIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [bookVisible, setBookVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [hasInitialAnimationPlayed, setHasInitialAnimationPlayed] = useState(false)
  const [backgroundBookIndex, setBackgroundBookIndex] = useState(0)
  const [initialBackgroundSet, setInitialBackgroundSet] = useState(false)
  const [bookOpacity, setBookOpacity] = useState(1)
  const [textColor, setTextColor] = useState("white")
  const [hasRenderedWithTextures, setHasRenderedWithTextures] = useState(false)
  const currentBook = booksData[currentBookIndex]

  useEffect(() => {
    const preloader = TexturePreloader.getInstance()
    preloader.preloadAllBookTextures().catch(() => {})
  }, [])

  const getResponsiveFOV = (width: number, height: number) => {
    const aspectRatio = width / height
    const viewportArea = width * height

    if (width < 1024) {
      return aspectRatio < 1 ? 26 : 28
    }

    if (width <= 1200) {
      if (aspectRatio < 1.3) return 48
      return 30
    }

    if (viewportArea > 2500000) {
      return aspectRatio > 2 ? 42 : 38
    }

    return aspectRatio < 1.3 ? 44 : 30
  }

  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200)
  const [screenHeight, setScreenHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 800)
  const [bookReady, setBookReady] = useState(false)
  const [fovReady, setFovReady] = useState(false)

  const initialParams: BookParams = {
    scale: [5, 5, 5],
    position: [-3, -3, -3],
    rotation: [1.6, 0.0, 0.3],
    cameraPosition: [-4.1, -3.3, 0.2],
    cameraFov: getResponsiveFOV(screenWidth, screenHeight),
  }

  const defaultParams: BookParams = {
    scale: [5, 5, 5],
    position: [-3, -3, -3],
    rotation: [1.2, 0, 0],
    cameraPosition: [-4.2, -2.9, 0.4],
    cameraFov: getResponsiveFOV(screenWidth, screenHeight),
  }

  const defaultMaterialProps: MaterialProps = currentBook.materialProps

  const [params, setParams] = useState<BookParams>(initialParams)
  const [materialProps, setMaterialProps] = useState<MaterialProps>(defaultMaterialProps)
  const [debugMode, setDebugMode] = useState(false)
  const object2MeshRef = useRef<THREE.Mesh | null>(null)

  const isDebugAllowed = import.meta.env.DEV

  const resetParams = () => {
    setParams(defaultParams)
    setMaterialProps(defaultMaterialProps)
  }

  const copyParams = () => {
    console.log("Parameters:", params, materialProps)
  }

  const nextBook = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setIsFlipping(true)
    setTextVisible(false)
    setBookOpacity(0)

    const nextBookIndex = (currentBookIndex + 1) % booksData.length
    const startTime = Date.now()
    const flipDuration = 800
    const startRotationZ = params.rotation[2]
    let contentChanged = false

    const animateFlip = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / flipDuration, 1)

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
      const easedProgress = easeOutCubic(progress)

      const flipRotation = easedProgress * Math.PI * 2

      setParams((prev) => ({
        ...prev,
        rotation: [prev.rotation[0], prev.rotation[1], startRotationZ + flipRotation],
      }))

      if (progress >= 0.3 && !contentChanged) {
        setCurrentBookIndex(nextBookIndex)
        setBackgroundBookIndex(nextBookIndex)
        setMaterialProps(booksData[nextBookIndex].materialProps)
        contentChanged = true
        setTimeout(() => setTextVisible(true), 50)
      }

      if (progress >= 0.4) {
        setBookOpacity(1)
      }

      if (progress < 1) {
        requestAnimationFrame(animateFlip)
      } else {
        setIsFlipping(false)
        setTextVisible(true)
        setIsTransitioning(false)
      }
    }

    requestAnimationFrame(animateFlip)
  }

  const previousBook = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setIsFlipping(true)
    setTextVisible(false)
    setBookOpacity(0)

    const prevBookIndex = currentBookIndex === 0 ? booksData.length - 1 : currentBookIndex - 1
    const startTime = Date.now()
    const flipDuration = 800
    const startRotationZ = params.rotation[2]
    let contentChanged = false

    const animateFlip = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / flipDuration, 1)

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
      const easedProgress = easeOutCubic(progress)

      const flipRotation = easedProgress * Math.PI * -2

      setParams((prev) => ({
        ...prev,
        rotation: [prev.rotation[0], prev.rotation[1], startRotationZ + flipRotation],
      }))

      if (progress >= 0.3 && !contentChanged) {
        setCurrentBookIndex(prevBookIndex)
        setBackgroundBookIndex(prevBookIndex)
        setMaterialProps(booksData[prevBookIndex].materialProps)
        contentChanged = true
        setTimeout(() => setTextVisible(true), 50)
      }

      if (progress >= 0.4) {
        setBookOpacity(1)
      }

      if (progress < 1) {
        requestAnimationFrame(animateFlip)
      } else {
        setIsFlipping(false)
        setTextVisible(true)
        setIsTransitioning(false)
      }
    }

    requestAnimationFrame(animateFlip)
  }

  useEffect(() => {
    const animateToDefault = () => {
      const startTime = Date.now()
      const duration = 1000

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)

        const easedProgress = easeInOutCubic(progress)

        const startRot = initialParams.rotation
        const endRot = defaultParams.rotation
        const currentRot: [number, number, number] = [
          startRot[0] + (endRot[0] - startRot[0]) * easedProgress,
          startRot[1] + (endRot[1] - startRot[1]) * easedProgress,
          startRot[2] + (endRot[2] - startRot[2]) * easedProgress,
        ]

        const startFOV = initialParams.cameraFov
        const endFOV = defaultParams.cameraFov
        const currentFOV = startFOV + (endFOV - startFOV) * easedProgress

        setParams((prev) => ({
          ...prev,
          rotation: currentRot,
          cameraFov: currentFOV,
        }))

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setHasInitialAnimationPlayed(true)
        }
      }

      requestAnimationFrame(animate)
    }

    if (bookReady && !hasInitialAnimationPlayed && !isTransitioning) {
      animateToDefault()
    }
  }, [bookReady, hasInitialAnimationPlayed, isTransitioning])

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      setScreenWidth(newWidth)
      setScreenHeight(newHeight)
      const newFOV = getResponsiveFOV(newWidth, newHeight)

      setParams((prev) => ({
        ...prev,
        cameraFov: newFOV,
      }))
    }

    window.addEventListener("resize", handleResize)
    handleResize()
    setFovReady(true)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (bookReady && fovReady && !hasRenderedWithTextures) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHasRenderedWithTextures(true)
          setBookVisible(true)
          setTextVisible(true)
        })
      })
    }
  }, [bookReady, fovReady, hasRenderedWithTextures])

  useEffect(() => {
    const currentBookData = booksData[backgroundBookIndex]
    const backgroundColor = currentBookData.backgroundColor
    const newTextColor = currentBookData.textColor

    document.body.style.backgroundColor = backgroundColor
    document.body.style.transition = initialBackgroundSet ? "background-color 0.7s ease-out" : "none"

    setTextColor(newTextColor)

    if (!initialBackgroundSet) {
      setInitialBackgroundSet(true)
    }

    return () => {
      document.body.style.backgroundColor = ""
      document.body.style.transition = ""
    }
  }, [backgroundBookIndex, initialBackgroundSet])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        nextBook()
      } else if (event.key === "ArrowLeft") {
        previousBook()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isTransitioning, currentBookIndex])

  return (
    <div className="mx-auto min-h-screen">
      {currentBookIndex >= 1 && (
        <div className="fixed left-4 top-4 z-50">
          <Button
            onClick={previousBook}
            disabled={isTransitioning}
            className="bg-white/10 border-white/30 hover:bg-white/20 disabled:opacity-50 transition-colors duration-700"
            style={{ color: textColor }}
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="fixed right-4 top-4 z-50">
        <Button
          onClick={nextBook}
          disabled={isTransitioning}
          className="bg-white/10 border-white/30 hover:bg-white/20 disabled:opacity-50 transition-colors duration-700"
          style={{ color: textColor }}
          size="sm"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-0 min-h-screen">
          <div
            className={`h-[50vh] lg:h-screen w-full flex-shrink-0 transition-opacity duration-500 ease-out`}
            style={{
              opacity: bookVisible ? bookOpacity : 0,
              transition: isFlipping ? "opacity 0.1s ease-out" : "opacity 0.5s ease-out",
            }}
          >
            {fovReady && (
              <BookModel
                params={params}
                materialProps={materialProps}
                meshRef={object2MeshRef}
                onReady={setBookReady}
                bookIndex={currentBookIndex}
              />
            )}
          </div>

          <div className="flex-1 lg:h-screen lg:max-h-screen lg:overflow-y-auto lg:flex lg:items-center">
            <BookDetails
              book={currentBook}
              isVisible={textVisible}
              textColor={textColor}
            />
          </div>

          {isDebugAllowed && (
            <DebugPanel
              debugMode={debugMode}
              params={params}
              materialProps={materialProps}
              defaultMaterialProps={defaultMaterialProps}
              object2MeshRef={object2MeshRef}
              setParams={setParams}
              setMaterialProps={setMaterialProps}
              resetParams={resetParams}
              copyParams={copyParams}
            />
          )}
        </div>
      </div>

      {isDebugAllowed && (
        <footer className="fixed bottom-4 right-4 z-50 flex items-center gap-3">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="hover:opacity-80 underline transition-all duration-700 text-xs"
            style={{ color: textColor === "black" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)" }}
          >
            Отладка
          </button>
        </footer>
      )}
    </div>
  )
}
