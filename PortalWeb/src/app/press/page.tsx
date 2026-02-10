import React from 'react';
import { Calendar, ArrowRight, Search, Filter } from 'lucide-react';
import Link from 'next/link';

const PressPage = () => {
  const pressReleases = [
    {
      id: 1,
      title: "IND2B Launches Revolutionary B2B Marketplace for Indian Businesses",
      date: "November 15, 2025",
      category: "Product Launch",
      excerpt: "IND2B announces the official launch of its comprehensive B2B e-commerce platform, connecting manufacturers, suppliers, and retailers across India with cutting-edge digital solutions.",
      content: "IND2B is thrilled to announce the launch of its innovative B2B marketplace platform, designed to revolutionize the way Indian businesses connect and conduct commerce. With a mission to empower Indian entrepreneurs and businesses of all sizes, IND2B provides a secure, transparent, and efficient platform for conducting business operations."
    },
    {
      id: 2,
      title: "IND2B Secures Funding to Expand Operations Across India",
      date: "November 1, 2025",
      category: "Funding",
      excerpt: "The platform announces successful funding round, enabling expansion into 50+ new cities and introduction of advanced AI-powered features for business matching.",
      content: "IND2B has successfully completed its Series A funding round, securing investment to accelerate growth across Indian markets. The funds will be utilized to expand operations, enhance platform features, and strengthen the verification infrastructure."
    },
    {
      id: 3,
      title: "10,000 Verified Businesses Now Active on IND2B Platform",
      date: "October 20, 2025",
      category: "Milestone",
      excerpt: "IND2B celebrates reaching 10,000 verified businesses milestone, marking significant growth and adoption across various industry verticals and regions.",
      content: "IND2B celebrates achieving a major milestone with 10,000+ verified businesses actively using the platform. This growth reflects the increasing demand for a trustworthy, digitized B2B marketplace in India."
    },
    {
      id: 4,
      title: "IND2B Introduces Advanced Buyer Protection Program",
      date: "October 5, 2025",
      category: "Product Update",
      excerpt: "New comprehensive buyer protection program launched to ensure secure transactions and buyer confidence, featuring insurance coverage and dispute resolution.",
      content: "IND2B introduces an enhanced buyer protection program, providing comprehensive coverage for all transactions on the platform. The program includes transaction insurance, secure payment gateways, and dedicated dispute resolution services."
    },
    {
      id: 5,
      title: "IND2B Partners with Industry Leaders to Support MSMEs",
      date: "September 18, 2025",
      category: "Partnership",
      excerpt: "Strategic partnerships announced with leading organizations to provide training, resources, and support for micro, small, and medium enterprises on the platform.",
      content: "IND2B announces strategic partnerships with industry-leading organizations to support MSMEs in leveraging digital commerce. These partnerships focus on training, resource development, and market access."
    },
    {
      id: 6,
      title: "IND2B Platform Achieves SOC 2 Compliance Certification",
      date: "August 30, 2025",
      category: "Security",
      excerpt: "Platform receives SOC 2 Type II certification, demonstrating commitment to highest security and compliance standards for protecting user data.",
      content: "IND2B achieves SOC 2 Type II compliance certification, reinforcing its commitment to data security and protection. This certification ensures that all user data and transactions are protected to the highest international standards."
    }
  ];

  const categories = ["All", "Product Launch", "Funding", "Milestone", "Product Update", "Partnership", "Security"];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Press & News</h1>
            <p className="text-lg md:text-xl text-orange-100">
              Stay updated with the latest news, announcements, and press releases from IND2B
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Filter by Category</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full transition-all ${
                    category === "All"
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-orange-500 hover:text-orange-500"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {pressReleases.map((release) => (
                <article
                  key={release.id}
                  className="group border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:border-orange-500"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                          {release.category}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          {release.date}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
                    {release.title}
                  </h2>

                  <p className="text-gray-600 leading-relaxed mb-6">
                    {release.excerpt}
                  </p>

                  <div className="flex items-center gap-2 text-orange-500 font-semibold group-hover:gap-3 transition-all">
                    <span>Read More</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Load More Press Releases
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Informed</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter to receive the latest press releases and news directly in your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Have a Press Inquiry?</h2>
            <p className="text-gray-600 mb-8">
              For media inquiries, interview requests, or partnership opportunities, please contact our Press and Communications team.
            </p>
            <Link
              href="/contact-us"
              className="inline-block px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PressPage;
