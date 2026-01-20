import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Share2, CheckCircle } from "lucide-react"
import type { BookData } from "./types"

interface BookDetailsProps {
  book: BookData
  isVisible: boolean
  textColor: string
}

export function BookDetails({ book, isVisible, textColor }: BookDetailsProps) {
  const primaryTextClass = textColor === "white" ? "text-white" : "text-black"
  const secondaryTextClass = textColor === "white" ? "text-white/80" : "text-black/80"
  const mutedTextClass = textColor === "white" ? "text-white/60" : "text-black/60"
  const lightTextClass = textColor === "white" ? "text-white/70" : "text-black/70"
  const veryLightTextClass = textColor === "white" ? "text-white/50" : "text-black/50"

  const badgeClass =
    textColor === "white" ? "bg-white/20 text-white border-white/30" : "bg-black/20 text-black border-black/30"

  const buttonClass =
    textColor === "white"
      ? "bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50"
      : "bg-transparent border-black/30 text-black hover:bg-black/10 hover:text-black hover:border-black/50"

  return (
    <div
      className={`space-y-6 p-8 lg:p-12 max-w-2xl mx-auto lg:px-0 lg:pr-9 transition-all duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transition: "opacity 1000ms ease-out, color 700ms ease-out",
      }}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          {book.genres.map((genre) => (
            <Badge key={genre} variant="secondary" className={`${badgeClass} transition-colors duration-700`}>
              {genre}
            </Badge>
          ))}
        </div>

        <h1
          className={`text-4xl leading-tight my-[9px] font-medium transition-colors duration-700 ${primaryTextClass}`}
        >
          {book.title}
        </h1>
        <p className={`text-xl font-normal transition-colors duration-700 ${secondaryTextClass}`}>{book.subtitle}</p>

        <div className={`flex items-center gap-2 text-sm transition-colors duration-700 ${mutedTextClass}`}>
          <span>{book.author}</span>
          <span>-</span>
          <span>{book.publishedYear}</span>
          <span>-</span>
          <span>{book.pages} стр.</span>
        </div>
      </div>

      <div className="space-y-4 max-w-xl">
        {book.description.map((paragraph, index) => (
          <p key={index} className={`leading-relaxed font-light transition-colors duration-700 ${secondaryTextClass}`}>
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="lg" className={`flex-1 transition-colors duration-700 ${buttonClass}`}>
          <ShoppingCart className="w-5 h-5 mr-2" />
          В корзину
        </Button>
        <Button variant="outline" size="lg" className={`transition-colors duration-700 ${buttonClass}`}>
          <Heart className="w-5 h-5 mr-2" />
          Избранное
        </Button>
        <Button variant="outline" size="lg" className={`transition-colors duration-700 ${buttonClass}`}>
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="text-center p-4">
          <div className={`text-2xl font-medium transition-colors duration-700 ${primaryTextClass}`}>{book.rating}</div>
          <div className={`text-sm transition-colors duration-700 ${lightTextClass}`}>*****</div>
          <div className={`text-xs transition-colors duration-700 ${veryLightTextClass}`}>
            {book.reviews.toLocaleString("ru-RU")} отзывов
          </div>
        </div>
        <div className="text-center p-4">
          <CheckCircle
            className={`mx-auto mb-1 size-7 transition-colors duration-700 ${
              textColor === "white" ? "text-zinc-200" : "text-zinc-600"
            }`}
          />
          <div className={`text-sm transition-colors duration-700 ${lightTextClass}`}>В наличии</div>
          <div className={`text-xs transition-colors duration-700 ${veryLightTextClass}`}>На складе</div>
        </div>
      </div>
    </div>
  )
}
