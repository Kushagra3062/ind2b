"use client"

import { useState, useEffect } from "react"

interface ProductDescriptionProps {
  description: string
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showReadMore, setShowReadMore] = useState(false)
  const [shortDescription, setShortDescription] = useState("")

  useEffect(() => {
    // Split the description into words
    const words = description.trim().split(/\s+/)

    // Check if we need to show the "Read More" button
    if (words.length > 20) {
      setShowReadMore(true)
      setShortDescription(words.slice(0, 20).join(" ") + "...")
    } else {
      setShowReadMore(false)
      setShortDescription(description)
    }
  }, [description])

  return (
    <div className="mb-6">
      <div className="text-gray-700">
        <p>{isExpanded ? description : shortDescription}</p>

        {showReadMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-500 font-medium mt-2 hover:text-orange-600 focus:outline-none"
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  )
}
