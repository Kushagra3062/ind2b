'use client';

import React, { useState } from 'react';
import { ChevronRight, Users, TrendingUp, Shield, Zap, Award } from 'lucide-react';

export default function PartnershipPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Thank you! We will contact you soon.');
    setEmail('');
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="w-full min-h-screen bg-white">

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-black mb-6 leading-tight">
            Grow Your Business
            <span className="text-orange-600"> Together</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Join our exclusive partnership program and unlock unlimited opportunities for growth. Scale your e-commerce business with our proven solutions and dedicated support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition font-semibold flex items-center justify-center gap-2 text-lg">
              Become a Partner
              <ChevronRight size={24} />
            </button>
            <button className="border-2 border-black text-black px-8 py-4 rounded-lg hover:bg-black hover:text-white transition font-semibold text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <p className="text-gray-600 text-lg">Active Partners</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">$2.5B+</div>
              <p className="text-gray-600 text-lg">Annual GMV</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">45+</div>
              <p className="text-gray-600 text-lg">Countries</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">98%</div>
              <p className="text-gray-600 text-lg">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Why Partner With Us?</h2>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-16 text-lg">
            Experience the benefits of a true partnership built on success and innovation
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 border border-orange-600 rounded-xl p-8 hover:border-orange-500 transition backdrop-blur">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Revenue Growth</h3>
              <p className="text-gray-300 leading-relaxed">
                Access our advanced tools and analytics to increase your revenue by up to 300% within the first year of partnership.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 border border-orange-600 rounded-xl p-8 hover:border-orange-500 transition backdrop-blur">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Dedicated Support</h3>
              <p className="text-gray-300 leading-relaxed">
                Get 24/7 priority support from our expert team. Your success is our priority, and we're here every step of the way.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 border border-orange-600 rounded-xl p-8 hover:border-orange-500 transition backdrop-blur">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Secure Platform</h3>
              <p className="text-gray-300 leading-relaxed">
                Enterprise-grade security with SSL encryption, regular audits, and compliance with all international standards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/10 border border-orange-600 rounded-xl p-8 hover:border-orange-500 transition backdrop-blur">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Instant Integration</h3>
              <p className="text-gray-300 leading-relaxed">
                Seamlessly integrate with your existing systems. Our API is well-documented and easy to implement in minutes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/10 border border-orange-600 rounded-xl p-8 hover:border-orange-500 transition backdrop-blur">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <Award size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Industry Recognition</h3>
              <p className="text-gray-300 leading-relaxed">
                Join an award-winning platform trusted by leading brands worldwide and receive industry certifications.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/10 border border-orange-600 rounded-xl p-8 hover:border-orange-500 transition backdrop-blur">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <ChevronRight size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Continuous Innovation</h3>
              <p className="text-gray-300 leading-relaxed">
                Stay ahead with regular updates, new features, and exclusive access to beta programs for partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Tiers Section */}
      <section id="tiers" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-black text-center mb-4">Partnership Tiers</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16 text-lg">
            Choose the perfect tier for your business needs and start growing today
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Tier */}
            <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-orange-600 transition bg-white">
              <h3 className="text-2xl font-bold text-black mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Perfect for new businesses</p>
              <div className="text-4xl font-bold text-orange-600 mb-6">
                $299<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Up to 10,000 products
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Basic analytics
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Email support
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  API access
                </li>
              </ul>
              <button className="w-full border-2 border-black text-black py-3 rounded-lg hover:bg-black hover:text-white transition font-semibold">
                Get Started
              </button>
            </div>

            {/* Professional Tier (Featured) */}
            <div className="border-2 border-orange-600 rounded-xl p-8 bg-gradient-to-b from-orange-50 to-white relative -translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Professional</h3>
              <p className="text-gray-600 mb-6">For growing businesses</p>
              <div className="text-4xl font-bold text-orange-600 mb-6">
                $799<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Up to 100,000 products
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Advanced analytics
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Priority phone support
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Dedicated account manager
                </li>
              </ul>
              <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-semibold">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-orange-600 transition bg-white">
              <h3 className="text-2xl font-bold text-black mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">For large-scale operations</p>
              <div className="text-4xl font-bold text-orange-600 mb-6">
                Custom<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Unlimited products
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Custom analytics
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  24/7 dedicated support
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Custom integrations
                </li>
              </ul>
              <button className="w-full border-2 border-black text-black py-3 rounded-lg hover:bg-black hover:text-white transition font-semibold">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-black to-orange-900">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Ready to Partner?</h2>
          <p className="text-gray-200 text-center mb-8 text-lg">
            Get in touch with our partnership team and start your journey to growth
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white/10 backdrop-blur p-8 rounded-xl border border-orange-600">
            <div>
              <label className="block text-white font-semibold mb-3">Company Name</label>
              <input
                type="text"
                placeholder="Your company name"
                className="w-full px-4 py-3 rounded-lg bg-white/90 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-600 transition"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                className="w-full px-4 py-3 rounded-lg bg-white/90 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-600 transition"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Message</label>
              <textarea
                rows={5}
                placeholder="Tell us about your business and partnership goals..."
                className="w-full px-4 py-3 rounded-lg bg-white/90 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-600 transition resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-semibold text-lg"
            >
              Send Message
            </button>

            {message && (
              <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg text-center">
                {message}
              </div>
            )}
          </form>
        </div>
      </section>

    </div>
  );
}
