import React from 'react';
import { Calendar, User, ArrowRight, Search, Tag } from 'lucide-react';
import Link from 'next/link';

const ArticlesPage = () => {
  const articles = [
    {
      id: 1,
      title: "The Complete Guide to B2B E-commerce in India",
      author: "Rajesh Kumar",
      date: "November 10, 2025",
      category: "Guide",
      readTime: "8 min read",
      excerpt: "Discover how to leverage B2B e-commerce platforms to expand your business reach, connect with new suppliers, and streamline your procurement process.",
      image: "/b2b-commerce.jpg"
    },
    {
      id: 2,
      title: "Digital Transformation: Lessons from Successful Indian Manufacturers",
      author: "Priya Sharma",
      date: "November 5, 2025",
      category: "Case Study",
      readTime: "10 min read",
      excerpt: "Learn from real-world examples of how Indian manufacturers have successfully digitized their operations and achieved significant growth through online platforms.",
      image: "/digital-transformation.jpg"
    },
    {
      id: 3,
      title: "Supply Chain Optimization: Best Practices for B2B Businesses",
      author: "Amit Patel",
      date: "October 28, 2025",
      category: "Tips & Tricks",
      readTime: "7 min read",
      excerpt: "Explore proven strategies to optimize your supply chain, reduce costs, and improve efficiency in your B2B operations.",
      image: "/supply-chain.jpg"
    },
    {
      id: 4,
      title: "Building Trust in B2B Transactions: The Role of Verification",
      author: "Neha Singh",
      date: "October 20, 2025",
      category: "Industry Insights",
      readTime: "9 min read",
      excerpt: "Understand why business verification is crucial in B2B transactions and how multi-layered verification systems protect both buyers and sellers.",
      image: "/business-verification.jpg"
    },
    {
      id: 5,
      title: "MSMEs and Digital Commerce: Breaking Barriers to Growth",
      author: "Vikram Desai",
      date: "October 12, 2025",
      category: "Featured",
      readTime: "11 min read",
      excerpt: "How micro, small, and medium enterprises can leverage digital platforms to compete with larger businesses and access new markets.",
      image: "/msme-digital.jpg"
    },
    {
      id: 6,
      title: "Payment Security in Online B2B: What You Need to Know",
      author: "Rajeev Krishnan",
      date: "October 5, 2025",
      category: "Security",
      readTime: "6 min read",
      excerpt: "A comprehensive overview of payment security measures, fraud prevention, and best practices for safe B2B transactions online.",
      image: "/payment-security.jpg"
    },
    {
      id: 7,
      title: "Cross-Border B2B Commerce: Opportunities and Challenges",
      author: "Anjali Nair",
      date: "September 28, 2025",
      category: "Trends",
      readTime: "9 min read",
      excerpt: "Explore the emerging opportunities and challenges in international B2B commerce and how Indian businesses can capitalize on global markets.",
      image: "/cross-border.jpg"
    },
    {
      id: 8,
      title: "Data Analytics for B2B: Making Informed Business Decisions",
      author: "Sanjay Verma",
      date: "September 20, 2025",
      category: "How-To",
      readTime: "8 min read",
      excerpt: "Learn how to use data analytics and market insights to make better business decisions and identify growth opportunities.",
      image: "/data-analytics.jpg"
    }
  ];

  const categories = ["All", "Guide", "Case Study", "Tips & Tricks", "Industry Insights", "Featured", "Security", "Trends", "How-To"];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Learning Centre & Articles</h1>
            <p className="text-lg md:text-xl text-orange-100">
              Expert insights, guides, and best practices for B2B success
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 mb-6">
              <Tag className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
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

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-orange-500"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Metadata */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">{article.readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Author and Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mt-4">
                        <User className="w-4 h-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Calendar className="w-4 h-4" />
                        <span>{article.date}</span>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-orange-500 font-semibold group-hover:gap-3 transition-all">
                      <span>Read Article</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Load More Articles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Articles Delivered</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to receive the latest articles and learning resources directly in your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticlesPage;
