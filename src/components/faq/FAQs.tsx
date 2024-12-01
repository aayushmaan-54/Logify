import faqs from "@/data/faq.json";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

export default function FAQs() {
  return (
    <>
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center text-orange-900 mb-12">Frequently Asked Questions</h2>

        <Accordion type="single" collapsible className="w-full mx-auto">
          {
            faqs.map((faq, index) => (
              <AccordionItem key={faq.q} value={`item-${index}`}>
                <AccordionTrigger className="text-orange-900 text-lg">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-orange-700">{faq.a}</AccordionContent>
              </AccordionItem>
            ))
          }
        </Accordion>
      </div>
    </>
  );
}