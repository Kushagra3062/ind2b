import type { Metadata } from "next"
import ContactForm from "@/components/contact/contact-form"

export const metadata: Metadata = {
  title: "Contact Us - IND2B",
  description:
    "Get in touch with us for any queries, support, or feedback. We're here to help you with your business needs.",
}

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      

      {/* Contact Form Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Have questions about our platform? Need help with your orders? Want to become a seller? We're here
                    to assist you every step of the way.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FF5C00] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
                      <p className="text-gray-600">Get help via email within 24 hours</p>
                      <p className="text-[#FF5C00] font-medium"><a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@ind2b.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">support@ind2b.com</a></p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FF5C00] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
                      <p className="text-gray-600">We typically respond within</p>
                      <p className="text-[#FF5C00] font-medium">2-4 business hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FF5C00] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Office Location</h3>
                      <p className="text-gray-600">Visit us at our headquarters</p>
                      <p className="text-[#FF5C00] font-medium">Bangalore-India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 text-lg">Find quick answers to common questions before reaching out</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-l-4 border-[#FF5C00] pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I track my order?</h3>
                  <p className="text-gray-600">
                    You can track your order from your dashboard or check your email for tracking information.
                  </p>
                </div>
                <div className="border-l-4 border-[#FF5C00] pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600">We accept all major credit cards, debit cards, UPI, and net banking.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="border-l-4 border-[#FF5C00] pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How can I become a seller?</h3>
                  <p className="text-gray-600">
                    Visit our seller registration page and complete the verification process to start selling.
                  </p>
                </div>
                <div className="border-l-4 border-[#FF5C00] pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What is your return policy?</h3>
                  <p className="text-gray-600">
                    We offer a 7-day return policy for most products. Check our return policy page for details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
