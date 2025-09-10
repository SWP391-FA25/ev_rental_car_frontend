import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';
import PricingSection from '@/components/PricingSection';
import TestimonialsMarquee from '@/components/TestimonialsMarquee';

export default function UserPage() {
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
