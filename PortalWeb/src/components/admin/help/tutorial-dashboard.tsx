"use client"

import type React from "react"

import { useState } from "react"
import { BarChart } from "lucide-react"
import YouTubePlayer from "./video-player"

export default function TutorialDashboard() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoId = "8nuXappLMU8"

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="flex-1  lg:p-0">
        <div className=""></div>

        {/* B2B Sales Performance */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4"></div>
          <div className="relative aspect-video bg-white rounded-lg border p-2">
            <YouTubePlayer videoId={videoId} isPlaying={isPlaying} onPlayClick={() => setIsPlaying(true)} />
          </div>
        </div>

        {/* B2B Data Feed Activity */}
        <div></div>
      </div>
    </div>
  )
}

function NavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 px-2 py-1.5 text-gray-600 hover:text-gray-900 cursor-pointer">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  )
}

function ActivityCard({ title, time }: { title: string; time: string }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <BarChart className="h-4 w-4" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
        <span>Last syncronised: {time}</span>
      </div>
    </div>
  )
}
