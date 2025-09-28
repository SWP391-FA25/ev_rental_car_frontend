import FeaturesSection from '../../shared/components/homepage/FeaturesSection';
import Footer from '../../shared/components/homepage/Footer';
import HeroSection from '../../shared/components/homepage/HeroSection';
import Navbar from '../../shared/components/homepage/Navbar';
import TestimonialsMarquee from '../../shared/components/homepage/TestimonialsMarquee';
import PricingSection from '../../shared/components/homepage/WhyChooseUsSection';

export default function UserPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsMarquee />
      <PricingSection />
      <Footer />
    </div>
  );
}
