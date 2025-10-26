import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does the AI transformation work?",
    answer: "Our advanced AI analyzes your photo and applies professional artistic techniques to transform it into oil paintings, acrylic art, or pencil drawings. The process takes just seconds and produces high-quality results that capture the essence of your original image.",
  },
  {
    question: "What image formats do you support?",
    answer: "We support all common image formats including JPG, PNG, and WEBP. For best results, we recommend using high-resolution images (at least 1000px on the longest side). Maximum file size is 10MB.",
  },
  {
    question: "Can I use the transformed images commercially?",
    answer: "Yes! All transformed images are yours to use however you like, including commercial purposes. You retain full rights to your creations.",
  },
  {
    question: "What's the quality of the output?",
    answer: "We generate high-resolution artwork suitable for printing up to 16x20 inches. Premium and Pro plans offer even higher quality outputs with enhanced detail and color accuracy.",
  },
  {
    question: "How do credits work?",
    answer: "Each transformation uses 1 credit. Credits never expire and can be used across all three transformation styles. You start with 3 free credits, and can purchase more anytime.",
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "Absolutely! We offer a 30-day money-back guarantee on all credit purchases. If you're not completely satisfied, contact our support team for a full refund.",
  },
  {
    question: "How long does the transformation take?",
    answer: "Most transformations complete in 2-5 seconds. During peak times, it may take slightly longer, but you'll never wait more than 30 seconds.",
  },
  {
    question: "Do you offer bulk discounts?",
    answer: "Yes! Our Pro plan offers the best value per credit. For enterprise needs (1000+ credits), please contact our sales team for custom pricing.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
            <HelpCircle className="h-4 w-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">Got Questions?</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about transforming your photos into art
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-2 rounded-xl px-5 hover:border-accent/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-sm font-semibold hover:text-accent py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  );
};

export default FAQSection;
