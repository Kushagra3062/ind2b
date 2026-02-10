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
}

type PopularTopic = {
  title: string
  desc: string
  icon: ReactNode
  href: string
}

const categories: Category[] = [
  { label: "Orders", icon: <FaBoxOpen />, key: "orders" },
  { label: "Payments", icon: <FaCreditCard />, key: "payments" },
  { label: "Account", icon: <FaUserCog />, key: "account" },
  { label: "Shipping", icon: <FaShippingFast />, key: "shipping" },
  { label: "Returns", icon: <FaUndo />, key: "returns" },
  { label: "Others", icon: <FaRegLightbulb />, key: "others" },
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
  { label: "Your Orders", href: "/orders", icon: <FaBoxOpen /> },
  { label: "Returns & Refunds", href: "/returns", icon: <FaUndo /> },
  { label: "Account Settings", href: "/account", icon: <FaUserCog /> },
  { label: "Shipping Policies", href: "/shipping-policy", icon: <FaShippingFast /> },
  { label: "Payment Options", href: "/payments", icon: <FaCreditCard /> },
  { label: "Buyer Protection", href: "/coinmarketcap", icon: <FaQuestionCircle /> },
  { label: "Products", href: "/products", icon: <FaBoxOpen /> },
  { label: "Contact Us", href: "/contact-us", icon: <FaPhoneAlt /> },
  { label: "Feedback", href: "/feedback", icon: <FaRegSmileBeam /> },
]

const popularTopics: PopularTopic[] = [
  {
    title: "Track Your Order",
    desc: "Get real-time updates on your order status.",
    icon: <FaRegListAlt className="text-emerald-400 text-2xl" />,
    href: "/orders"
  },
  {
    title: "Returns & Refunds",
    desc: "Learn how to return or replace an item.",
    icon: <FaUndo className="text-emerald-400 text-2xl" />,
    href: "/returns"
  },
  {
    title: "Update Payment Method",
    desc: "Manage your cards and payment options.",
    icon: <FaRegCreditCard className="text-emerald-400 text-2xl" />,
    href: "/payments"
  },
  {
    title: "Change Address",
    desc: "Edit your delivery addresses anytime.",
    icon: <FaRegUser className="text-emerald-400 text-2xl" />,
    href: "/account"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-emerald-700 flex items-center gap-2">
          <FaQuestionCircle className="text-emerald-400 animate-bounce" /> Help Center
        </h1>
        <p className="text-gray-600 mb-6">How can we assist you today?</p>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search help topics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition bg-white"
        />

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            className={`px-4 py-2 rounded-full font-medium transition-all ${activeCategory === "all" ? "bg-emerald-600 text-white shadow" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${activeCategory === cat.key ? "bg-emerald-600 text-white shadow" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Popular Topics */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FaRegLightbulb className="text-emerald-400" /> Popular Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularTopics.map(topic => (
              <Link
                key={topic.title}
                href={topic.href}
                className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-lg p-4 hover:bg-emerald-100 transition-all duration-200 shadow-sm hover:scale-105 animate-fade-in"
              >
                {topic.icon}
                <div>
                  <div className="font-semibold text-emerald-800">{topic.title}</div>
                  <div className="text-gray-600 text-sm">{topic.desc}</div>
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
              className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full hover:bg-emerald-200 transition-all duration-200 shadow-sm hover:scale-105"
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filteredFaqs.length === 0 && (
              <div className="text-gray-500 animate-fade-in">No results found.</div>
            )}
            {filteredFaqs.map((faq, idx) => (
              <div
                key={faq.question}
                className={`border rounded-lg overflow-hidden transition-all duration-300 ${openIndex === idx ? "shadow-md bg-emerald-50" : ""}`}
              >
                <button
                  className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-gray-800 hover:bg-emerald-50 transition"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  aria-expanded={openIndex === idx}
                >
                  <span className="flex items-center gap-2">
                    <FaQuestionCircle className="text-emerald-400" />
                    {faq.question}
                  </span>
                  <span className={`ml-2 transition-transform duration-300 ${openIndex === idx ? "rotate-180" : ""}`}>
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
                    <div className="px-4 pb-4 text-gray-600 animate-fade-in">
                      {faq.answer}
                      {faq.steps && (
                        <ol className="list-decimal ml-6 mt-2 text-emerald-700">
                          {faq.steps.map((step, i) => (
                            <li key={i} className="mb-1">{step}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Didn't find what you need? */}
        <div className="mt-10 bg-emerald-50 border border-emerald-200 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 animate-fade-in-slow">
          <div>
            <div className="text-lg font-semibold text-emerald-800 mb-1 flex items-center gap-2">
              <FaEnvelopeOpenText className="text-emerald-400 animate-pulse" />
              Didn't find what you need?
            </div>
            <div className="text-gray-700 mb-2">Our support team is here for you 24/7.</div>
            <div className="flex gap-4 flex-wrap">
              <a
                href="mailto:support@yourdomain.com"
                className="text-emerald-700 underline hover:text-emerald-900 transition"
              >
                Email Support
              </a>
              <Link
                href="/contact-us"
                className="text-emerald-700 underline hover:text-emerald-900 transition"
              >
                Contact Form
              </Link>
              <a
                href="tel:+18001234567"
                className="text-emerald-700 underline hover:text-emerald-900 transition"
              >
                Call: 1800-123-4567
              </a>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s;
        }
        .animate-fade-in-slow {
          animation: fadeIn 0.8s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  )
}

export default HelpPage