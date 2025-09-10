import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import TestimonialsMarquee from "@/components/TestimonialsMarquee"
import FeaturesSection from "@/components/FeaturesSection"
import PricingSection from "@/components/PricingSection"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <TestimonialsMarquee />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
