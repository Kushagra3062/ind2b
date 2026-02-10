import Image from "next/image"
import { Button } from "@/components/ui/button"
import HelpSearch from "@/components/admin/help/help-search"
import TutorialDashboard from "@/components/admin/help/tutorial-dashboard"
import FaqSection from "@/components/admin/help/faq-section"
import ContactForm from "@/components/admin/help/contact-form"

export default function SellerHelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-8 items-center mb-16">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight">
              Welcome to
              <br />
              Help & Support
            </h1>
            <HelpSearch />
            <Button size="lg" className="bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white px-8 py-3 rounded-full text-lg">
              Try your Luck
            </Button>
          </div>
        </div>
        <div className="relative h-[400px] lg:h-[500px]">
          <Image src="/image.webp" alt="Help and Support Illustration" fill className="object-contain" priority />
        </div>
      </div>

      {/* Tutorial Section */}
      <div className="mt-16 border-t pt-8">
        <h2 className="text-3xl md:text-4xl font-medium mb-8">Tutorials</h2>
        <TutorialDashboard />
      </div>

      {/* FAQ Section */}
      <div className="mt-16 pt-8 border-t">
        <h2 className="text-3xl md:text-4xl font-medium mb-8">FAQs</h2>
        <FaqSection />
      </div>

      {/* Contact Section */}
      <div className="mt-16 pt-8 border-t">
        <h2 className="text-3xl md:text-4xl font-medium mb-8">Contact Us</h2>
        <ContactForm />
      </div>
    </div>
  )
}
