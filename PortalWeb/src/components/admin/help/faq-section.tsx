"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "You can track your order by logging into your account and visiting the Orders section. There you'll find detailed tracking information including current status, location, and estimated delivery date.",
  },
  {
    question:
      "Offending belonging promotion provision an be oh consulted ourselves it. Blessing welcomed ladyship she met humoured sir breeding her.",
    answer:
      "Our promotion provisions are designed to be fair and transparent. We welcome all customers to participate in our promotional offers while adhering to our terms and conditions. Please contact our support team for specific details about ongoing promotions.",
  },
  {
    question: "How can I update my profile details?",
    answer:
      "To update your profile details, go to your Account Settings, select the Profile section, and click on Edit Profile. You can update your personal information, contact details, and preferences. Remember to save your changes before leaving the page.",
  },
  {
    question: "How can I create a shipping label?",
    answer:
      "Creating a shipping label is easy. Go to your Orders dashboard, select the order you want to ship, click on 'Create Shipping Label', verify the shipping details, and click Generate. You can then download and print your shipping label.",
  },
  {
    question: "How can I view buyer feedback?",
    answer:
      "To view buyer feedback, navigate to your Seller Dashboard and click on the Feedback section. Here you can see all reviews and ratings from your buyers, sorted by date. You can also respond to feedback and track your overall seller rating.",
  },
  {
    question: "How do I add a new product?",
    answer:
      "To add a new product, go to your Inventory Management section and click 'Add New Product'. Fill in the required details including product name, description, price, and images. Make sure to preview your listing before publishing it to ensure all information is accurate.",
  },
]

export default function FaqSection() {
  return (
    <div className="max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
            <AccordionTrigger className="text-left text-lg font-medium py-4">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
