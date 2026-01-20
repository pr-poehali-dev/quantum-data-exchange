export class TexturePreloader {
  private static instance: TexturePreloader
  private preloadedTextures = new Map<string, HTMLImageElement>()
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>()

  static getInstance(): TexturePreloader {
    if (!TexturePreloader.instance) {
      TexturePreloader.instance = new TexturePreloader()
    }
    return TexturePreloader.instance
  }

  async preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.preloadedTextures.has(url)) {
      return this.preloadedTextures.get(url)!
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!
    }

    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        this.preloadedTextures.set(url, img)
        this.loadingPromises.delete(url)
        resolve(img)
      }

      img.onerror = () => {
        this.loadingPromises.delete(url)
        reject(new Error(`Failed to preload image: ${url}`))
      }

      img.src = url
    })

    this.loadingPromises.set(url, loadPromise)
    return loadPromise
  }

  async preloadAllBookTextures(): Promise<void> {
    const texturePaths = [
      "/images/x-101-front-cover.jpeg",
      "/images/x-101-back-cover.jpeg",
      "/images/we-are-so-back-cover-optimized.jpeg",
      "/images/we-are-so-back-back-cover-optimized.jpeg",
      "/images/vibe-coding-front-cover.jpeg",
      "/images/vibe-coding-back-cover.jpeg",
      "/images/how-to-say-please-front-cover.jpeg",
      "/images/how-to-say-please-back-cover.jpeg",
    ]

    await Promise.all(texturePaths.map((path) => this.preloadImage(path))).catch(() => {
      // Silently handle preload failures
    })
  }

  getPreloadedImage(url: string): HTMLImageElement | null {
    return this.preloadedTextures.get(url) || null
  }
}
