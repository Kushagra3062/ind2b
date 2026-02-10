"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Play } from "lucide-react"
import HelpSearch from "@/components/seller/help/help-search"
import TutorialDashboard from "@/components/seller/help/tutorial-dashboard"
import FaqSection from "@/components/seller/help/faq-section"
import ContactForm from "@/components/seller/help/contact-form"

export default function SellerHelpPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "tutorial" | "faq">("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Help &amp; Support
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Find answers, learn how to manage your business, and get support from our team.
              </p>
            </div>
            <HelpSearch />
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-6 text-base font-semibold"
                onClick={() => setActiveTab("tutorial")}
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Tutorial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base font-semibold border-2 border-gray-300 bg-transparent"
                onClick={() => setActiveTab("faq")}
              >
                Browse FAQs
              </Button>
            </div>
          </div>
          <div className="relative h-[350px] md:h-[450px] hidden lg:block">
            <Image src="/image.webp" alt="Help and Support Illustration" fill className="object-contain" priority />
          </div>
        </div>
      </section>

      {activeTab === "tutorial" && (
        <section className="bg-white border-y border-gray-200 py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Video Tutorials</h2>
              <p className="text-gray-600 text-lg">
                Learn how to use your seller portal with our step-by-step video guides
              </p>
            </div>

            {/* Video Container */}
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                <TutorialDashboard />
              </div>
            </div>

            {/* YouTube Links Section */}
            <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
                <p className="text-gray-600 text-sm mb-4">Learn the basics of setting up your seller account</p>
                <a
                  href="https://www.youtube.com/watch?v=Vj2Q_11tol0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-semibold hover:text-green-700 text-sm"
                >
                  Watch Video →
                </a>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Management</h3>
                <p className="text-gray-600 text-sm mb-4">Add and manage your products effectively</p>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-semibold hover:text-green-700 text-sm"
                >
                  Watch Video →
                </a>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Management</h3>
                <p className="text-gray-600 text-sm mb-4">Handle orders and shipping like a pro</p>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-semibold hover:text-green-700 text-sm"
                >
                  Watch Video →
                </a>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base font-semibold bg-transparent"
                onClick={() => setActiveTab("overview")}
              >
                Back to Help
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeTab === "faq" && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
              <p className="text-gray-600 text-lg">Find quick answers to common questions about your seller account</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <FaqSection />
            </div>

            <div className="text-center mt-8">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base font-semibold bg-transparent"
                onClick={() => setActiveTab("overview")}
              >
                Back to Help
              </Button>
            </div>
          </div>
        </section>
      )}

      {activeTab === "overview" && (
        <>
          {/* Contact Form Section */}
          <section className="bg-gradient-to-br from-green-50 to-emerald-50 border-y border-green-200 py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Still Need Help?</h2>
                <p className="text-gray-600 text-lg">Can't find what you're looking for? Contact our support team</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Contact Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 border border-green-200 shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                  <ContactForm />
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Phone Support</h4>
                        <p className="text-gray-600 text-sm mb-3">Call us for immediate assistance</p>
                        <a href="tel:7491922495" className="text-green-600 font-semibold text-lg hover:text-green-700">
                          +91 7491922495
                        </a>
                        <p className="text-gray-500 text-xs mt-2">Available: Mon-Fri, 9 AM - 6 PM IST</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Email Support</h4>
                        <p className="text-gray-600 text-sm mb-3">Send us an email anytime</p>
                        <a
                          href="mailto:product.circ@i10ai.com"
                          className="text-green-600 font-semibold text-sm hover:text-green-700 break-all"
                        >
                          product.circ@i10ai.com
                        </a>
                        <p className="text-gray-500 text-xs mt-2">Response time: 24 hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
                    <h4 className="text-lg font-semibold mb-2">Response Guarantee</h4>
                    <p className="text-green-50 text-sm">
                      We commit to responding to all inquiries within 24 hours. Your satisfaction is our priority.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Resources Section */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Additional Resources</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">📚</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
                  <p className="text-gray-600 text-sm">Read our comprehensive guides</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🎓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Training</h3>
                  <p className="text-gray-600 text-sm">Learn from our experts</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">💡</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tips & Tricks</h3>
                  <p className="text-gray-600 text-sm">Maximize your sales potential</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🔧</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Troubleshooting</h3>
                  <p className="text-gray-600 text-sm">Solve common issues</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
