import FeaturesSection from './homepage/FeaturesSection';
import Footer from './homepage/Footer';
import HeroSection from './homepage/HeroSection';
import Navbar from './homepage/Navbar';
import TestimonialsMarquee from './homepage/TestimonialsMarquee';
import WhyChooseUsSection from './homepage/WhyChooseUsSection';

export default function Home() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsMarquee />
      <WhyChooseUsSection />
      <Footer />
    </div>
  );
}
