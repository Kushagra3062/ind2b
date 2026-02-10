"use client"

import { Play } from "lucide-react"

interface YouTubeThumbnailProps {
  videoId: string
  title: string
}

export default function YouTubeThumbnail({ videoId, title }: YouTubeThumbnailProps) {
  const handleClick = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
  }

  return (
    <div className="relative aspect-video cursor-pointer group" onClick={handleClick}>
      <img src={`https://www.youtube.com/watch?v=8nuXappLMU8`} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-8 h-8 text-[#FF5C00] translate-x-0.5" />
        </div>
      </div>
    </div>
  )
}
