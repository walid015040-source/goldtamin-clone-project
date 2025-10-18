import Hero from "@/components/Hero";
import Features from "@/components/Features";
import InsuranceTypes from "@/components/InsuranceTypes";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <Hero />
      <Features />
      <InsuranceTypes />
      <Footer />
    </div>
  );
};

export default Index;
