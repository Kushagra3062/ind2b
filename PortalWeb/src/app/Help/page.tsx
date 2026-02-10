"use client"
import React, { useState, ReactNode } from "react"
import {
  FaRegSmileBeam, FaShippingFast, FaUndo, FaUserCog, FaCreditCard, FaQuestionCircle, FaBoxOpen, FaPhoneAlt, FaEnvelopeOpenText, FaRegLightbulb, FaRegListAlt, FaRegUser, FaRegCreditCard
} from "react-icons/fa"
import Link from "next/link"

type Category = {
  label: string
  icon: ReactNode
  key: string
  color: string
}

type FAQ = {
  question: string
  answer: string
  category: string
  steps?: string[]
}

type QuickLink = {
  label: string
  href: string
  icon: ReactNode
  color: string
}

type PopularTopic = {
  title: string
  desc: string
  icon: ReactNode
  href: string
  color: string
}

const categories: Category[] = [
  { label: "Orders", icon: <FaBoxOpen />, key: "orders", color: "bg-orange-500 hover:bg-orange-600" },
  { label: "Payments", icon: <FaCreditCard />, key: "payments", color: "bg-green-500 hover:bg-green-600" },
  { label: "Account", icon: <FaUserCog />, key: "account", color: "bg-blue-500 hover:bg-blue-600" },
  { label: "Shipping", icon: <FaShippingFast />, key: "shipping", color: "bg-purple-500 hover:bg-purple-600" },
  { label: "Returns", icon: <FaUndo />, key: "returns", color: "bg-red-500 hover:bg-red-600" },
  { label: "Others", icon: <FaRegLightbulb />, key: "others", color: "bg-yellow-500 hover:bg-yellow-600" },
]

const faqs: FAQ[] = [
  {
    question: "How do I track my order?",
    answer: "Go to 'My Orders' in your account dashboard to view order status and tracking details.",
    category: "orders",
    steps: [
      "Login to your account.",
      "Navigate to 'My Orders'.",
      "Click on the order you want to track.",
      "View tracking details and status."
    ]
  },
  {
    question: "How do I return or replace an item?",
    answer: "Visit 'My Orders', select the item, and click 'Return or Replace'. Follow the on-screen instructions.",
    category: "returns",
    steps: [
      "Go to 'My Orders'.",
      "Select the item you wish to return.",
      "Click 'Return or Replace'.",
      "Follow the instructions to complete your request."
    ]
  },
  {
    question: "How can I contact customer support?",
    answer: "You can chat with us 24/7 or email support@yourdomain.com. See the contact card below.",
    category: "others"
  },
  {
    question: "How do I update my payment method?",
    answer: "Go to 'Account Settings' > 'Payment Options' to add, edit, or remove your cards.",
    category: "payments"
  },
  {
    question: "How do I change my delivery address?",
    answer: "Go to 'Account Settings' > 'Addresses' to add, edit, or remove your delivery addresses.",
    category: "account"
  },
  {
    question: "What is Buyer Protection?",
    answer: "Buyer Protection ensures you get your item as described, or you get your money back.",
    category: "others"
  },
  {
    question: "How do I cancel an order?",
    answer: "Go to 'My Orders', select the order, and click 'Cancel Order' if it hasn't shipped yet.",
    category: "orders"
  },
  {
    question: "How do I give feedback?",
    answer: "Go to the 'Feedback' page from the footer or Help Center and submit your suggestions.",
    category: "others"
  },
]

const quickLinks: QuickLink[] = [
  { label: "Your Orders", href: "/orders", icon: <FaBoxOpen />, color: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200" },
  { label: "Returns & Refunds", href: "/returns", icon: <FaUndo />, color: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200" },
  { label: "Account Settings", href: "/account", icon: <FaUserCog />, color: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" },
  { label: "Shipping Policies", href: "/shipping-policy", icon: <FaShippingFast />, color: "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200" },
  { label: "Payment Options", href: "/payments", icon: <FaCreditCard />, color: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" },
  { label: "Buyer Protection", href: "/coinmarketcap", icon: <FaQuestionCircle />, color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200" },
  { label: "Products", href: "/products", icon: <FaBoxOpen />, color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200" },
  { label: "Contact Us", href: "/contact-us", icon: <FaPhoneAlt />, color: "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200" },
  { label: "Feedback", href: "/feedback", icon: <FaRegSmileBeam />, color: "bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200" },
]

const popularTopics: PopularTopic[] = [
  {
    title: "Track Your Order",
    desc: "Get real-time updates on your order status.",
    icon: <FaRegListAlt className="text-orange-500 text-2xl" />,
    href: "/orders",
    color: "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200"
  },
  {
    title: "Returns & Refunds",
    desc: "Learn how to return or replace an item.",
    icon: <FaUndo className="text-red-500 text-2xl" />,
    href: "/returns",
    color: "bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200"
  },
  {
    title: "Update Payment Method",
    desc: "Manage your cards and payment options.",
    icon: <FaRegCreditCard className="text-green-500 text-2xl" />,
    href: "/payments",
    color: "bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200"
  },
  {
    title: "Change Address",
    desc: "Edit your delivery addresses anytime.",
    icon: <FaRegUser className="text-blue-500 text-2xl" />,
    href: "/account",
    color: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200"
  },
]

const HelpPage: React.FC = () => {
  const [search, setSearch] = useState<string>("")
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const filteredFaqs = faqs.filter(
    (faq) =>
      (activeCategory === "all" || faq.category === activeCategory) &&
      (faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase()))
  )

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.key === category)
    return cat ? cat.color : "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-yellow-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
        <h1 className="text-4xl font-bold mb-2 text-gray-800 flex items-center gap-3">
          <FaQuestionCircle className="text-orange-500 animate-bounce" /> 
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Help Center
          </span>
        </h1>
        <p className="text-gray-600 mb-6 text-lg">How can we assist you today?</p>
        
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search help topics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-6 py-3 border-2 border-orange-200 rounded-xl mb-8 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-white shadow-sm text-gray-800 placeholder-gray-500"
        />

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
              activeCategory === "all" 
                ? "bg-gradient-to-r from-gray-800 to-black text-white shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            }`}
            onClick={() => setActiveCategory("all")}
          >
            All Topics
          </button>
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                activeCategory === cat.key 
                  ? `${cat.color} text-white shadow-lg` 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Popular Topics */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-800">
            <FaRegLightbulb className="text-yellow-500" /> Popular Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularTopics.map(topic => (
              <Link
                key={topic.title}
                href={topic.href}
                className={`flex items-center gap-4 ${topic.color} border rounded-xl p-5 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 animate-fade-in`}
              >
                {topic.icon}
                <div>
                  <div className="font-bold text-gray-800 text-lg">{topic.title}</div>
                  <div className="text-gray-600">{topic.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          {quickLinks.map(link => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-2 ${link.color} px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 border`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.length === 0 && (
              <div className="text-gray-500 text-center py-8 animate-fade-in">
                <FaRegLightbulb className="text-4xl text-gray-300 mx-auto mb-3" />
                No results found for your search.
              </div>
            )}
            {filteredFaqs.map((faq, idx) => (
              <div
                key={faq.question}
                className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                  openIndex === idx 
                    ? "shadow-lg bg-gradient-to-r from-gray-50 to-orange-50 border-orange-300" 
                    : "border-gray-200 hover:border-orange-200 hover:shadow-md"
                }`}
              >
                <button
                  className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all duration-200"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  aria-expanded={openIndex === idx}
                >
                  <span className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getCategoryColor(faq.category).replace('bg-', 'bg-').replace(' hover:bg-', '')}`}></div>
                    <FaQuestionCircle className="text-orange-500" />
                    {faq.question}
                  </span>
                  <span className={`ml-3 transition-transform duration-300 text-orange-500 ${openIndex === idx ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: openIndex === idx ? 300 : 0,
                    transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)",
                    overflow: "hidden",
                  }}
                >
                  {openIndex === idx && (
                    <div className="px-6 pb-5 text-gray-700 animate-fade-in">
                      <p className="mb-3">{faq.answer}</p>
                      {faq.steps && (
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <h4 className="font-semibold text-orange-700 mb-2">Steps to follow:</h4>
                          <ol className="list-decimal ml-6 space-y-1 text-gray-700">
                            {faq.steps.map((step, i) => (
                              <li key={i} className="text-sm">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-gray-800 to-black rounded-xl p-6 text-white shadow-xl animate-fade-in-slow">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="text-xl font-bold mb-2 flex items-center gap-3">
                <FaEnvelopeOpenText className="text-orange-400 animate-pulse" />
                Still need help?
              </div>
              <p className="text-gray-300 mb-4">Our support team is here for you 24/7.</p>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="mailto:support@yourdomain.com"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md"
                >
                  Email Support
                </a>
                <Link
                  href="/contact-us"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md"
                >
                  Contact Form
                </Link>
                <a
                  href="tel:+18001234567"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md"
                >
                  Call: 1800-123-4567
                </a>
              </div>
            </div>
            <div className="text-6xl text-orange-400">
              <FaPhoneAlt />
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-fade-in-slow {
          animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  )
}

export default HelpPage