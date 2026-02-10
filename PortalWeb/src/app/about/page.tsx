import React from 'react';
import { 
  Building2, 
  Users, 
  Target, 
  Eye, 
  Shield, 
  Lightbulb, 
  Heart, 
  CheckCircle,
  TrendingUp,
  Globe,
  Handshake,
  Star
} from 'lucide-react';

const AboutUsPage = () => {
  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust and Transparency",
      description: "We believe that trust is the currency of commerce. We operate with complete transparency, from our verification process to our fee structure."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "The digital world is constantly evolving, and so are we. We are committed to continuous innovation, constantly adding new features and functionalities."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Customer-Centricity",
      description: "Our members are at the heart of everything we do. We are dedicated to understanding their needs and building a platform that exceeds their expectations."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Integrity",
      description: "We hold ourselves to the highest ethical standards. We are honest, responsible, and fair in all our dealings."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Community",
      description: "We believe in the power of a strong community. We are building a network of interconnected businesses that support and uplift one another."
    }
  ];

  const features = [
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Seamless Sourcing and Procurement",
      description: "Our platform features a vast and meticulously categorized directory of Indian suppliers and manufacturers, making B2B sourcing incredibly simple."
    },
    {
      icon: <Building2 className="w-12 h-12" />,
      title: "Dynamic B2B E-commerce Capabilities",
      description: "We provide businesses with a fully-featured e-commerce storefront to showcase their products to a nationwide audience."
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Trusted Business Verification",
      description: "Our multi-layered verification system checks business credentials, licenses, and other relevant documents, providing security for every transaction."
    },
    {
      icon: <Handshake className="w-12 h-12" />,
      title: "Advanced Communication Tools",
      description: "Built-in messaging tools allow businesses to negotiate terms, clarify specifications, and build long-lasting relationships directly within the platform."
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Data-Driven Market Insights",
      description: "Our dashboard offers data on market trends, demand patterns, and consumer behavior, helping businesses make strategic decisions."
    },
    {
      icon: <Star className="w-12 h-12" />,
      title: "Dedicated Support and Community",
      description: "Our dedicated team provides exceptional support, while our community forums and events help members share knowledge and grow together."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Verified Businesses" },
    { number: "50+", label: "Product Categories" },
    { number: "500+", label: "Cities Connected" },
    { number: "24/7", label: "Customer Support" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The <span className="text-orange-200">IND2B</span> Story
            </h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              We are the digital backbone for a new era of B2B trade in India, connecting manufacturers, suppliers, wholesalers, distributors, and retailers on a single, intuitive platform.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-orange-200">{stat.number}</div>
                  <div className="text-lg text-orange-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    In the vast and vibrant landscape of Indian commerce, businesses have long sought a more efficient, reliable, and connected way to grow. The traditional methods of procurement and sales, while foundational, often came with geographical limitations, fragmented information, and missed opportunities.
                  </p>
                  <p>
                    At IND2B, we saw a chance to revolutionize this. Our journey began with a simple but powerful idea: to bring the entire Indian B2B ecosystem online. We envisioned a space where every business, from a small-scale artisanal producer in a remote village to a large-scale industrial manufacturer in a metropolitan hub, could find its rightful place and connect with the right partners.
                  </p>
                  <p>
                    We are more than just a platform; we are committed to building a digital marketplace that is not only robust and secure but also deeply rooted in the values of trust, transparency, and community.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-orange-500 rounded-2xl p-8 text-white">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-lg leading-relaxed">
                    To become the definitive digital hub for all things B2B in India, creating a dynamic ecosystem where innovation flourishes and every business can compete on a level playing field.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Mission & Vision</h2>
              <p className="text-xl text-gray-600">Building a Connected India</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Mission */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-orange-500">
                <div className="flex items-center mb-6">
                  <Target className="w-12 h-12 text-orange-500 mr-4" />
                  <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
                </div>
                <h4 className="text-xl font-semibold text-orange-600 mb-4">Empowering Indian Businesses</h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our core mission is to empower Indian businesses by providing them with the tools and connections they need to thrive in a digital-first world. We aim to dismantle the barriers that have historically hindered growth, such as geographical distance and a lack of market access.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-orange-500">
                <div className="flex items-center mb-6">
                  <Eye className="w-12 h-12 text-orange-500 mr-4" />
                  <h3 className="text-3xl font-bold text-gray-900">Our Vision</h3>
                </div>
                <h4 className="text-xl font-semibold text-orange-600 mb-4">The Future of Indian B2B Commerce</h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We see a future where Indian suppliers can easily find buyers from anywhere in the country, and Indian retailers can source the best quality products with just a few clicks. This vision is about contributing to the economic growth and prosperity of the nation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">The IND2B Advantage</h2>
              <p className="text-xl text-gray-600">Comprehensive solutions for the Indian B2B market</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-orange-500 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">The IND2B Code that guides every decision we make</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Our Commitment to a Better India</h2>
            <p className="text-xl leading-relaxed mb-12">
              We are more than just a business; we are a partner in India's growth story. By digitizing and streamlining the B2B supply chain, we are helping to create a more efficient and competitive economy. We are empowering small businesses to reach a national audience, which in turn creates jobs and drives local economies.
            </p>
            
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold mb-4">Contributing to Digital India & Make in India</h3>
              <p className="text-lg leading-relaxed">
                Our work is a direct contribution to the "Digital India" and "Make in India" initiatives, and we are incredibly proud of the positive impact we are making on the nation's economic landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Join the IND2B Community Today</h2>
            <p className="text-xl mb-8 leading-relaxed">
              The future of Indian business is collaborative. Whether you are a manufacturer, a wholesaler, a distributor, or a retailer, our platform is your home.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;