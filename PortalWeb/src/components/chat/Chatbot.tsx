"use client"
import React, { useState, useEffect, useRef } from "react"
import { FaPaperPlane, FaTimes, FaCommentDots, FaRobot, FaUser, FaShoppingBag } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

type Message = {
  id: string
  text: string
  sender: "user" | "bot"
  products?: Product[]
}

type Product = {
  product_id: string
  title: string
  image_link: string
  price: number
  sale_price?: number
}

const Chatbot = ({ user }: { user: any }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [filters, setFilters] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm your AI shopping assistant. Ask me for recommendations or search for products!",
      sender: "bot",
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // 1. Prepare history for the backend (last 10 messages)
      const chatHistory = messages
        .slice(-10)
        .map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }))

      // 2. Call the smart search agent
      let endpoint = "/api/recommender/smart"
      let queryParam = `?q=${encodeURIComponent(userMessage.text)}`
      queryParam += `&history=${encodeURIComponent(JSON.stringify(chatHistory))}`

      const res = await fetch(`${endpoint}${queryParam}`)
      const data = await res.json()

      // 3. Extracted metadata from Agent
      const botResponse = data.conversational_response || "Here is what I found:"
      const products = data.products || []
      const activeFilters = data.filters || null
      
      setFilters(activeFilters)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        products: products,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I'm having trouble connecting to the recommender brain right now.",
          sender: "bot",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-teal-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <FaRobot className="text-xl" />
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <span className="text-xs text-teal-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMessages([{ id: "w", text: "How can I help you?", sender: "bot" }])
                  setFilters(null)
                }} 
                className="hover:bg-white/20 p-2 rounded-full text-xs"
                title="Clear History"
              >
                Reset
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition">
                <FaTimes />
              </button>
            </div>

            {/* Active Filters Bar */}
            {filters && (filters.brand || filters.category || filters.max_price) && (
              <div className="bg-teal-50 px-4 py-2 flex flex-wrap gap-2 border-b border-teal-100">
                {filters.brand && <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold uppercase">{filters.brand}</span>}
                {filters.category && <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold uppercase">{filters.category}</span>}
                {filters.max_price && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase">Under ₹{filters.max_price}</span>}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.sender === "user"
                        ? "bg-teal-600 text-white rounded-tr-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  
                  {/* Product Recommendations */}
                  {msg.products && msg.products.length > 0 && (
                     <div className="mt-3 w-full grid grid-cols-1 gap-2">
                        {msg.products.slice(0, 3).map(product => ( // Show top 3
                           <Link 
                             href={`/products/${product.product_id}`} 
                             key={product.product_id}
                             target="_blank"
                             className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group"
                           >
                              <img 
                                src={product.image_link} 
                                alt={product.title} 
                                className="w-12 h-12 object-cover rounded-lg bg-gray-200"
                                onError={(e) => (e.currentTarget.src = "/placeholder.png")} 
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-teal-600 truncate">
                                  {product.title}
                                </p>
                                <p className="text-xs text-green-600 font-bold">
                                  ₹{product.sale_price || product.price}
                                </p>
                              </div>
                              <FaShoppingBag className="text-gray-300 group-hover:text-teal-500" />
                           </Link>
                        ))}
                     </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-400 text-xs ml-2">
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask for anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-teal-500/30"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 p-4 bg-teal-600 text-white rounded-full shadow-xl shadow-teal-600/30 z-50 flex items-center justify-center transition-all hover:shadow-2xl"
      >
        {isOpen ? <FaTimes className="text-2xl" /> : <FaCommentDots className="text-2xl" />}
      </motion.button>
    </>
  )
}

export default Chatbot
