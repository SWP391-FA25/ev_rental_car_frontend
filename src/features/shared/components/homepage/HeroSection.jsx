import { gsap } from 'gsap';
import { AlertCircle, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearch } from '../../hooks/useSearch';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import DatePicker from '../ui/DatePicker';
import StationSelector from '../ui/StationSelector';

export default function HeroSection() {
  const headlineRef = useRef(null);
  const searchFormRef = useRef(null);
  const { t } = useTranslation();
  const [pickupDate, setPickupDate] = useState();
  const [returnDate, setReturnDate] = useState();
  const [selectedStation, setSelectedStation] = useState();
  const {
    performSearch,
    loading: searchLoading,
    error: searchError,
    clearError,
  } = useSearch();
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

  const handleSearch = async () => {
    clearError();

    const searchParams = {
      stationId: selectedStation?.id,
      pickupDate,
      returnDate,
    };

    await performSearch(searchParams);
  };

  const handleStationChange = station => {
    setSelectedStation(station);
    clearError();
  };

  return (
    <header
      id='home'
      className='min-h-screen relative'
      style={{
        backgroundImage:
          'url("https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Homepage-Promo-Model-3-Desktop-US-July.png")',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        paddingBottom: '80px', // Add space for search form
      }}
    >
      {/* Gradient Overlay */}
      <div className='absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))] via-transparent to-[hsl(var(--background))] z-10' />

      {/* Background Lines */}
      <div className='absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-full max-w-[1200px] flex justify-between z-0'>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className='w-[2px] h-full bg-[hsl(var(--muted-foreground))] opacity-10'
          />
        ))}
      </div>

      {/* Content */}
      <div className='relative z-20 h-screen flex flex-col justify-between'>
        {/* Main Title - Centered */}
        <div className='flex-1 flex items-start justify-center pt-20'>
          <div className='max-w-[1200px] mx-auto px-4'>
            <h1
              ref={headlineRef}
              className='max-w-[800px] mx-auto text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[hsl(var(--primary-foreground))]  text-center'
              style={{
                // fontFamily: 'Orbitron, sans-serif',
                letterSpacing: '2px',
              }}
            >
              <div className='block overflow-hidden mb-2'>
                {renderTextWithAnimation(t('hero.title1'))}
              </div>
              <div className='block overflow-hidden mb-2'>
                {renderTextWithAnimation(t('hero.title2'))}
              </div>
            </h1>
          </div>
        </div>

        {/* Search Form - At Bottom */}
        <div
          ref={searchFormRef}
          className='absolute inset-x-0 px-4 flex justify-center'
          style={{ bottom: '-140px', zIndex: '100' }}
        >
          <Card className='w-full max-w-6xl bg-card/95 backdrop-blur-sm shadow-xl border border-border py-0'>
            <CardContent className='p-4 sm:p-6'>
              {/* Error Alert */}
              {searchError && (
                <Alert variant='destructive' className='mb-4'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}

              <div className='grid grid-cols-1 sm:grid-cols-4 gap-4 items-end'>
                {/* Pickup Location */}
                <StationSelector
                  label={t('hero.location')}
                  placeholder={t('hero.destination')}
                  value={selectedStation}
                  onChange={handleStationChange}
                />

                {/* Pickup Date */}
                <DatePicker
                  label={t('hero.date')}
                  placeholder={t('hero.date')}
                  value={pickupDate}
                  onChange={setPickupDate}
                />

                {/* Pickup Time */}
                {/* <div className='space-y-2'>
                  <Label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                    <Clock className='w-5 h-5' />
                    <span>{t('hero.time')}</span>
                  </Label>
                  <Input type='time' className='w-full' />
                </div> */}

                {/* Return Date */}
                <DatePicker
                  label={t('hero.returnDate')}
                  placeholder={t('hero.returnDate')}
                  value={returnDate}
                  onChange={setReturnDate}
                  disabled={!pickupDate}
                  minDate={pickupDate || new Date()}
                />

                {/* Search Button */}
                <div className='space-y-2'>
                  <Button
                    className='w-full h-10'
                    onClick={handleSearch}
                    disabled={searchLoading}
                  >
                    <Search className='w-5 h-5 mr-2' />
                    {searchLoading ? 'Searching...' : t('hero.search')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </header>
  );
}
