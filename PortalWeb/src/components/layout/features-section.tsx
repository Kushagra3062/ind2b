import type React from "react"
import { Truck, RefreshCw, Lock, Phone } from "lucide-react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  iconColor: string
  hoverColor: string
}

function FeatureCard({ icon, title, description, iconColor, hoverColor }: FeatureCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 bg-white bg-opacity-80 rounded-2xl shadow-md w-full max-w-[200px] h-[180px] transition-all duration-300 ${hoverColor}`}
    >
      <div className={`mb-3 ${iconColor}`}>{icon}</div>
      <h3 className="mb-1 text-base font-medium text-gray-900 text-center">{title}</h3>
      <p className="text-xs text-gray-500 text-center">{description}</p>
    </div>
  )
}

export default function FeaturesSection() {
  const features = [
    {
      icon: <Truck size={28} />,
      title: "Free Shipping",
      description: "Order above 200",
      iconColor: "text-blue-600",
      hoverColor: "hover:bg-blue-100 hover:bg-opacity-80 hover:shadow-lg",
    },
    {
      icon: <RefreshCw size={28} />,
      title: "Money-back",
      description: "30 days guarantee",
      iconColor: "text-teal-600",
      hoverColor: "hover:bg-teal-100 hover:bg-opacity-80 hover:shadow-lg",
    },
    {
      icon: <Lock size={28} />,
      title: "Secure Payments",
      description: "Secured by Razorpay",
      iconColor: "text-purple-600",
      hoverColor: "hover:bg-purple-100 hover:bg-opacity-80 hover:shadow-lg",
    },
    {
      icon: <Phone size={28} />,
      title: "24/7 Support",
      description: "Phone and Email support",
      iconColor: "text-orange-600",
      hoverColor: "hover:bg-orange-100 hover:bg-opacity-80 hover:shadow-lg",
    },
  ]

  return (
    <div className="w-full py-4 flex justify-center items-center">
      <div className="bg-blue-100 rounded-2xl py-8 px-6 sm:px-6 md:px-8 lg:px-12 w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconColor={feature.iconColor}
              hoverColor={feature.hoverColor}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
