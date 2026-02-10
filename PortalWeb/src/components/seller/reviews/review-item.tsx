import Image from "next/image"
import { Button } from "@/components/ui/button"
import { StarRating } from "./star-rating"
import type { Review } from "../../../types/review"

interface ReviewItemProps {
  review: Review
}

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <div className="py-4 sm:py-6 border-b last:border-b-0">
      <div className="flex gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0">
          <Image
            src={review.imageUrl || "/placeholder.svg"}
            alt={review.productName}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <h3 className="font-medium truncate">{review.productName}</h3>
              <p className="text-sm text-muted-foreground">(SKU: {review.sku})</p>
              <p className="text-sm text-muted-foreground">{review.company}</p>
            </div>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <p className="mt-2 text-sm">{review.text}</p>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground order-2 sm:order-1">{review.date}</span>
            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                Report Abuse
              </Button>
              <Button size="sm" className="flex-1 sm:flex-initial">
                Reply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
