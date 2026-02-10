"use client"
import type React from "react"
import { useState } from "react"
import {
  FaRegSmileBeam,
  FaRegLaughBeam,
  FaRegGrinStars,
  FaRegSadTear,
  FaRegMehRollingEyes,
  FaRegSurprise,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa"
import { submitFeedback } from "@/actions/feedback"

const emojiOptions = [
  { icon: <FaRegSadTear className="text-3xl" />, label: "Sad", vibe: "Low" },
  { icon: <FaRegMehRollingEyes className="text-3xl" />, label: "Meh", vibe: "Mid" },
  { icon: <FaRegSmileBeam className="text-3xl" />, label: "Happy", vibe: "Good" },
  { icon: <FaRegLaughBeam className="text-3xl" />, label: "Lit", vibe: "High" },
  { icon: <FaRegGrinStars className="text-3xl" />, label: "Slay", vibe: "Fire" },
  { icon: <FaRegSurprise className="text-3xl" />, label: "Shook", vibe: "Surprised" },
]

const categories = ["General Feedback", "Bug Report", "Feature Request", "Design/UI", "Performance", "Other"]

const MAX_CHARS = 300

const FeedbackPage: React.FC = () => {
  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState(categories[0])
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [emoji, setEmoji] = useState<number | null>(null)
  const [emojiHover, setEmojiHover] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitted(false)
    setIsSubmitting(true)

    if (!name || !email || !message || emoji === null) {
      setError("Please fill in all fields and select your vibe!")
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("category", category)
      formData.append("message", message)
      formData.append("emoji", emoji.toString())
      formData.append("vibeLabel", emojiOptions[emoji].label)
      formData.append("vibeValue", emojiOptions[emoji].vibe)

      const result = await submitFeedback(formData)

      if (result.success) {
        setSubmitted(true)
        setName("")
        setEmail("")
        setMessage("")
        setEmoji(null)
        setCategory(categories[0])
        setError("")
      } else {
        setError(result.error || "Failed to submit feedback")
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Emoji animation classes
  const getEmojiClass = (idx: number) => {
    if (emoji === idx) return "animate-jump-smooth"
    if (emojiHover === idx) return "animate-jump-smooth"
    return ""
  }

  // Vibe bar percent
  const percent = emoji !== null ? ((emoji + 1) / emojiOptions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-8 border border-orange-100">
        <h1 className="text-3xl font-bold mb-2 text-orange-700 flex items-center gap-2">
          <FaRegSmileBeam className="text-orange-400 animate-wiggle" /> Feedback
        </h1>
        <p className="text-gray-600 mb-6">Drop your thoughts, vibes, or rants. We love hearing from you!</p>

        {/* Emoji Selection */}
        <div className="mb-8 flex flex-col items-center">
          <div className="text-gray-700 font-medium mb-2 py-5">How's your vibe today?</div>
          <div className="flex gap-3 justify-center mb-2">
            {emojiOptions.map((option, idx) => (
              <button
                key={option.label}
                type="button"
                aria-label={option.label}
                className={`transition-all duration-300 rounded-full p-2 bg-white focus:outline-none ${getEmojiClass(idx)}`}
                style={{
                  outline: "none",
                  zIndex: 2,
                  marginTop: "-18px",
                }}
                onClick={() => setEmoji(idx)}
                onMouseEnter={() => setEmojiHover(idx)}
                onMouseLeave={() => setEmojiHover(null)}
                disabled={isSubmitting}
              >
                {option.icon}
                <span className="block text-xs mt-1 text-orange-700">{option.label}</span>
              </button>
            ))}
          </div>
          {emoji !== null && (
            <div className="mt-2 text-sm font-semibold text-orange-600 animate-vibe">
              Vibe: {emojiOptions[emoji].vibe}
            </div>
          )}
          {emoji === null && <div className="text-xs text-gray-400 mt-1">Pick an emoji that matches your mood!</div>}
        </div>

        {/* Vibe Bar */}
        <div className="relative w-full h-4 my-8 flex items-center">
          {/* Background bar: yellow to orange to red */}
          <div
            className="absolute left-0 top-0 h-4 w-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #fde047 0%, #fbbf24 40%, #fb7185 80%, #ef4444 100%)",
              opacity: 0.25,
            }}
          />
          {/* Filled bar */}
          <div
            className="absolute left-0 top-0 h-4 rounded-full transition-all duration-300"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(90deg, #fde047 0%, #fbbf24 40%, #fb7185 80%, #ef4444 100%)",
              opacity: 1,
            }}
          />
          {/* Emoji markers (empty for spacing) */}
          <div className="relative flex w-full z-10">
            {emojiOptions.map((opt, idx) => (
              <div key={opt.label} className="flex-1 flex flex-col items-center" style={{ position: "relative" }} />
            ))}
          </div>
          {/* Percent label */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-700 pr-2 select-none"
            style={{ zIndex: 3 }}
          >
            {emoji !== null ? `${Math.round(percent)}%` : ""}
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="off"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="off"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="message">
              Feedback
            </label>
            <textarea
              id="message"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              rows={5}
              maxLength={MAX_CHARS}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your feedback here... (spill the tea, drop the fire, or just say hi!)"
              required
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-400 text-right mt-1">
              {message.length}/{MAX_CHARS} chars
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition shadow-lg tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane /> Send Vibes
              </>
            )}
          </button>
        </form>

        {/* Success Message */}
        {submitted && (
          <div className="mt-6 flex items-center gap-2 text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-4 animate-bounce-in">
            <FaCheckCircle className="text-orange-400 text-2xl animate-pop" />
            Thanks for your feedback! You're a real one. ✨
          </div>
        )}

        <style jsx global>{`
          body {
            background: #fff !important;
            color-scheme: light;
          }
          @keyframes jump-smooth {
            0% { transform: translateY(0);}
            30% { transform: translateY(-18px);}
            50% { transform: translateY(-10px);}
            70% { transform: translateY(-6px);}
            100% { transform: translateY(0);}
          }
          .animate-jump-smooth {
            animation: jump-smooth 0.5s cubic-bezier(.9,2,.6,1);
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
          .animate-spin-slow {
            animation: spin-slow 2s linear infinite;
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-8deg);}
            50% { transform: rotate(8deg);}
          }
          .animate-wiggle {
            animation: wiggle 1.2s infinite;
          }
          @keyframes vibe {
            0% { opacity: 0; transform: translateY(10px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-vibe {
            animation: vibe 0.5s;
          }
          @keyframes bounce-in {
            0% { transform: scale(0.8); opacity: 0; }
            60% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); }
          }
          .animate-bounce-in {
            animation: bounce-in 0.7s;
          }
          @keyframes pop {
            0% { transform: scale(1);}
            60% { transform: scale(1.3);}
            100% { transform: scale(1.15);}
          }
          .animate-pop {
            animation: pop 0.3s;
          }
        `}</style>
      </div>
    </div>
  )
}

export default FeedbackPage
