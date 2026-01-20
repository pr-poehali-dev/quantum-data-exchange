import { useState } from "react"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import { BookDetails } from "./book-details"
import { booksData } from "./book-data"

export default function BookShowcaseFallback() {
  const [currentBookIndex, setCurrentBookIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const currentBook = booksData[currentBookIndex]

  const nextBook = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentBookIndex((prev) => (prev + 1) % booksData.length)
      setIsTransitioning(false)
    }, 300)
  }

  const previousBook = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentBookIndex((prev) => (prev === 0 ? booksData.length - 1 : prev - 1))
      setIsTransitioning(false)
    }, 300)
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center transition-colors duration-1000 relative overflow-hidden"
      style={{ backgroundColor: currentBook.backgroundColor }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
          <div className={`flex justify-center items-center transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="relative w-full max-w-md aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">{currentBook.title}</h2>
                  <p className="text-xl text-gray-300 mb-6">{currentBook.subtitle}</p>
                  <p className="text-lg text-gray-400">{currentBook.author}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <BookDetails book={currentBook} textColor={currentBook.textColor} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <Button
          onClick={previousBook}
          disabled={isTransitioning}
          size="lg"
          variant="secondary"
          className="rounded-full w-14 h-14 p-0"
        >
          <Icon name="ChevronLeft" size={24} />
        </Button>
        <Button
          onClick={nextBook}
          disabled={isTransitioning}
          size="lg"
          variant="secondary"
          className="rounded-full w-14 h-14 p-0"
        >
          <Icon name="ChevronRight" size={24} />
        </Button>
      </div>
    </main>
  )
}
