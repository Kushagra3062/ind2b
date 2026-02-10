import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, size = "md" }: StarRatingProps) {
  const starSize = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${
            star <= rating
              ? "fill-primary text-primary"
              : star - 0.5 <= rating
                ? "fill-primary/50 text-primary"
                : "fill-muted text-muted-foreground"
          }`}
          size={starSize[size]}
        />
      ))}
    </div>
  )
}
