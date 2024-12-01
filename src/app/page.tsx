import CTA from "@/components/cta/CTA";
import FAQs from "@/components/faq/FAQs";
import Features from "@/components/featuresCard/Features";
import Hero from "@/components/hero/Hero";
import seedDatabase from "../seed/seed";


export default function Home() {
  // if(process.env.NODE_ENV === "development") {
  //   seedDatabase();
  // }

  return (
    <div className="container mx-auto px-4 pt-16 pb-16">
      <Hero />
      <Features />
      <FAQs />
      <CTA />
    </div>
  );
}
