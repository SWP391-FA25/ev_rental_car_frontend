import { gsap } from 'gsap';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export default function HeroSection() {
  const headlineRef = useRef(null);
  const searchFormRef = useRef(null);
  const { t } = useTranslation();
  useEffect(() => {
    const headline = headlineRef.current;
    const searchForm = searchFormRef.current;

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

    if (searchForm) {
      gsap.fromTo(
        searchForm,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  const renderTextWithAnimation = text => {
    return text.split('').map((char, charIndex) => (
      <span
        key={charIndex}
        className='char inline-block'
        style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section className='min-h-screen flex items-end justify-start overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5'>
      {/* Content - Centered */}
      <div className=' z-10 w-full flex flex-col items-center justify-center text-center'>
        <div className='container mx-auto px-6 sm:px-8 lg:px-12'>
          {/* Headline */}
          <h1
            ref={headlineRef}
            className='text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.9] mb-8'
          >
            <div className='block overflow-hidden mb-2'>
              {renderTextWithAnimation(t('hero.title1'))}
            </div>
            <div className='block overflow-hidden mb-2'>
              {renderTextWithAnimation(t('hero.title2'))}
            </div>
          </h1>
        </div>
        {/* Search Form */}
        <div ref={searchFormRef} className='m-12'>
          <Card className='bg-card/95 backdrop-blur-sm shadow-xl border border-border max-w-4xl mx-auto'>
            <CardContent className='p-4 sm:p-6'>
              <div className='grid grid-cols-1 sm:grid-cols-5 gap-4 items-end'>
                {/* Pickup Location */}
                <div className='space-y-2'>
                  <Label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <MapPin className='w-5 h-5' />
                    <span>{t('hero.location')}</span>
                  </Label>
                  <Select>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={t('hero.destination')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='new-york'>New York</SelectItem>
                      <SelectItem value='phoenix'>Phoenix</SelectItem>
                      <SelectItem value='austin'>Austin</SelectItem>
                      <SelectItem value='miami'>Miami</SelectItem>
                      <SelectItem value='chicago'>Chicago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pickup Date */}
                <div className='space-y-2'>
                  <Label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Calendar className='w-5 h-5' />
                    <span>{t('hero.date')}</span>
                  </Label>
                  <Input type='date' className='w-full' />
                </div>

                {/* Pickup Time */}
                <div className='space-y-2'>
                  <Label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Clock className='w-5 h-5' />
                    <span>{t('hero.time')}</span>
                  </Label>
                  <Input type='time' className='w-full' />
                </div>

                {/* Return Date */}
                <div className='space-y-2'>
                  <Label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Calendar className='w-5 h-5' />
                    <span>{t('hero.returnDate')}</span>
                  </Label>
                  <Input type='date' className='w-full' />
                </div>

                {/* Search Button */}
                <div className='space-y-2'>
                  <Button className='w-full h-10'>
                    <Search className='w-5 h-5 mr-2' />
                    {t('hero.search')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
