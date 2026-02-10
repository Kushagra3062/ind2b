"use client"

import { useEffect, useRef } from "react"

interface YouTubePlayerProps {
  videoId: string
  isPlaying: boolean
  onPlayClick: () => void
}

export default function YouTubePlayer({ videoId, isPlaying, onPlayClick }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPlaying && playerRef.current) {
      const iframe = document.createElement("iframe")
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`
      iframe.width = "100%"
      iframe.height = "100%"
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      iframe.allowFullscreen = true
      iframe.style.position = "absolute"
      iframe.style.top = "0"
      iframe.style.left = "0"
      iframe.style.width = "100%"
      iframe.style.height = "100%"
      iframe.style.border = "none"

      playerRef.current.innerHTML = ""
      playerRef.current.appendChild(iframe)
    }
  }, [isPlaying, videoId])

  if (!isPlaying) {
    return (
      <div className="absolute inset-0 cursor-pointer group" onClick={onPlayClick}>
        <img
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-white border-b-8 border-b-transparent ml-1"></div>
          </div>
        </div>
      </div>
    )
  }

  return <div ref={playerRef} className="absolute inset-0" />
}
