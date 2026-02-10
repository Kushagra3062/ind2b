"use client"

import Link from "next/link"
import {
  FaShieldAlt,
  FaCheckCircle,
  FaTruck,
  FaUserCheck,
  FaHandshake,
  FaBalanceScale,
  FaArrowRight,
} from "react-icons/fa"

export default function BuyerProtectionPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 via-orange-50 to-yellow-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full w-fit">
              <FaShieldAlt aria-hidden />
              <span className="sr-only">Security badge</span>
              Buyer Confidence
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-balance">
              IND2B Buyer Protection Program
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl">
              We’ve got your back — every transaction on IND2B is protected, verified, and transparent. Buy from
              verified suppliers with complete confidence from payment to delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-lg font-semibold transition"
              >
                Shop with Confidence <FaArrowRight aria-hidden />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-lg font-semibold transition"
              >
                How it Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Why Buyer Protection Matters</h2>
        <p className="text-gray-700 mb-8 max-w-3xl">
          In B2B trade, trust is everything. IND2B safeguards your orders from payment to delivery — ensuring quality,
          reliability, and fair resolutions across every deal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-gray-200 p-6 bg-white">
            <div className="text-2xl text-orange-600 mb-3">
              <FaCheckCircle aria-hidden />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-700">Funds are protected until you confirm receipt and product condition.</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 bg-white">
            <div className="text-2xl text-orange-600 mb-3">
              <FaUserCheck aria-hidden />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verified Suppliers</h3>
            <p className="text-gray-700">Sellers undergo verification and screening to ensure legitimacy.</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 bg-white">
            <div className="text-2xl text-orange-600 mb-3">
              <FaTruck aria-hidden />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Guaranteed Delivery</h3>
            <p className="text-gray-700">We monitor logistics and step in if shipment is delayed or missing.</p>
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">What’s Covered</h2>
          <p className="text-gray-700 mb-6 max-w-3xl">
            Protection across payment, quality, delivery, and dispute resolution.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-800">
                  <th className="p-4 border-b border-gray-200">Coverage Area</th>
                  <th className="p-4 border-b border-gray-200">What You’re Protected From</th>
                  <th className="p-4 border-b border-gray-200">How It Works</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-t border-gray-200">
                  <td className="p-4 font-semibold">Payment Protection</td>
                  <td className="p-4">Loss due to unverified sellers or fake listings</td>
                  <td className="p-4">Funds held until order confirmation</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="p-4 font-semibold">Quality Assurance</td>
                  <td className="p-4">Product not as described or poor quality</td>
                  <td className="p-4">Request replacement or refund within 7 days</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="p-4 font-semibold">On-time Delivery</td>
                  <td className="p-4">Delays or non-delivery</td>
                  <td className="p-4">We monitor logistics and intervene on delays</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="p-4 font-semibold">Dispute Resolution</td>
                  <td className="p-4">Conflicts with sellers</td>
                  <td className="p-4">Dedicated resolution team for fair outcomes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">How IND2B Buyer Protection Works</h2>
        <p className="text-gray-700 mb-8 max-w-3xl">A simple 3-step flow to keep your orders safe.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-gray-200 p-6 bg-white">
            <div className="text-2xl text-orange-600 mb-3">
              <FaHandshake aria-hidden />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Find & Order</h3>
            <p className="text-gray-700">Browse verified suppliers and place your order through IND2B.</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 bg-white">
            <div className="text-2xl text-orange-600 mb-3">
              <FaShieldAlt aria-hidden />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Secure Payment</h3>
            <p className="text-gray-700">
              Pay safely via IND2B’s protected gateway. Funds are secured until confirmation.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 bg-white">
            <div className="text-2xl text-orange-600 mb-3">
              <FaCheckCircle aria-hidden />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Confirm & Receive</h3>
            <p className="text-gray-700">
              Confirm receipt and item condition — then payment is released to the supplier.
            </p>
          </div>
        </div>
      </section>

      {/* Dispute Resolution */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Quick, Fair, Transparent Dispute Resolution
          </h2>
          <p className="text-gray-700 mb-6 max-w-3xl">
            If something goes wrong, our team investigates and mediates between buyer and supplier to ensure a fair
            outcome.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 p-6 bg-white">
              <div className="text-2xl text-orange-600 mb-3">
                <FaShieldAlt aria-hidden />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Raise</h3>
              <p className="text-gray-700">Open a dispute with order details and evidence.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6 bg-white">
              <div className="text-2xl text-orange-600 mb-3">
                <FaBalanceScale aria-hidden />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Review</h3>
              <p className="text-gray-700">We assess and communicate with both parties.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6 bg-white">
              <div className="text-2xl text-orange-600 mb-3">
                <FaCheckCircle aria-hidden />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Resolution</h3>
              <p className="text-gray-700">A fair resolution is provided quickly and transparently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Supplier Network */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Verified Supplier Network</h2>
          <p className="text-gray-700 max-w-3xl">
            Every seller on IND2B undergoes business verification, product quality checks, and compliance screening —
            ensuring genuine, trustworthy trade partners.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Start Buying with Confidence</h2>
              <p className="text-gray-300">Explore verified suppliers and protected transactions on IND2B.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-lg font-semibold transition"
              >
                Explore Suppliers <FaArrowRight aria-hidden />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 px-5 py-3 rounded-lg font-semibold transition"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
