import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

export default function HeroSection() {
  const headlineRef = useRef(null);

  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline) return;

    // Get all character spans
    const chars = headline.querySelectorAll('.char');

    // Set initial state - characters start below (y: 100) and invisible
    gsap.set(chars, {
      y: 100,
      opacity: 0,
    });

    // Animate characters with stagger
    gsap.to(chars, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'back.out(1.7)',
      stagger: 0.05, // 50ms delay between each character
      delay: 0.5, // Start animation after 0.5s
    });
  }, []);

  const renderTextWithAnimation = (text) => {
    return text.split(' ').map((word, wordIndex) => (
      <div key={wordIndex} className="block overflow-hidden mb-2">
        {word.split('').map((char, charIndex) => (
          <span
            key={charIndex}
            className="char inline-block"
            style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    ));
  };

  return (
    <section className="relative min-h-screen flex items-end justify-start overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Background placeholder for future 3D model */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* This div is reserved for unicorn.studio interactive background */}
        <div className="w-full h-full opacity-20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-5xl">
            <h1
              ref={headlineRef}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.9] mb-8"
            >
              {renderTextWithAnimation('SMART RENTAL SYSTEM')}
            </h1>
            <div className="mt-8 lg:mt-12">
              <Button
                size="lg"
                className="text-lg px-8 py-4 h-auto hover:scale-105 transition-transform duration-200"
              >
                Try it out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
