"use client"

import { Card } from "@/components/ui/card"
import YouTubeThumbnail from "./youtube-thumbnail"

const tutorials = [
  {
    id: "tutorial1",
    title: "Getting Started with Dashboard",
    videoId: "8nuXappLMU8", // Replace with your actual YouTube video ID
    description: "Learn how to navigate and use the main dashboard features effectively.",
  },
  // Add more tutorials as needed
]

export default function TutorialSection() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {tutorials.map((tutorial) => (
        <Card key={tutorial.id} className="overflow-hidden">
          <YouTubeThumbnail videoId={tutorial.videoId} title={tutorial.title} />
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{tutorial.title}</h3>
            <p className="text-muted-foreground">{tutorial.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
