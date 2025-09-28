import { useAuth } from '@/app/providers/AuthProvider';
import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '../../lib/apiClient';
import { endpoints } from '../../lib/endpoints';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '../ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import LanguageToggle from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const closeTimerRef = useRef(null);

  const displayName = (() => {
    if (!user?.name) return user?.email || '';
    return user.name;
  })();

  const initials = (() => {
    const name = displayName || '';
    const parts = name.trim().split(' ').filter(Boolean);
    const first = parts[0]?.[0] || 'U';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  })();

  const handleLogout = async () => {
    try {
      await apiClient.post(endpoints.auth.logout());
    } catch {
      // ignore error; proceed to clear local state
    } finally {
      logout();
      toast.success('Logged out successfully', {
        position: 'top-right',
        autoClose: 2000,
      });
      navigate('/');
    }
  };

  const openMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMenuOpen(true);
  };
  const delayedClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setMenuOpen(false), 150);
  };
  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);

        // Hide navbar when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'shadow-lg backdrop-blur-sm bg-[hsl(var(--primary))]/95'
          : 'bg-[hsl(var(--primary))]'
      }`}
    >
      {/* Header with logo and menu button */}
      <div className='flex items-center justify-around px-4 py-2 '>
        {/* Logo */}
        <div className='flex items-center'>
          <Link to='/' className='flex items-center'>
            <img
              src='/logo.png'
              alt='Ev Rental Logo'
              className='max-w-[150px] h-auto'
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className='text-3xl font-bold text-[hsl(var(--primary-foreground))] hidden font-dancing'>
              Ev Rental
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground))]/20 md:hidden'
            >
              <Menu className='h-6 w-6' />
            </Button>
          </SheetTrigger>
          <SheetContent
            side='right'
            className='w-[300px] bg-[hsl(var(--primary))] border-none'
          >
            <div className='flex flex-col items-center gap-8 py-8'>
              <Link
                to='/'
                className='text-[hsl(var(--primary-foreground))] font-medium text-lg tracking-wider hover:text-[hsl(var(--primary-foreground))]/80 transition-colors'
                onClick={() => setMenuOpen(false)}
              >
                {t('navbar.home')}
              </Link>
              <Link
                to='/cars'
                className='text-[hsl(var(--primary-foreground))] font-medium text-lg tracking-wider hover:text-[hsl(var(--primary-foreground))]/80 transition-colors'
                onClick={() => setMenuOpen(false)}
              >
                {t('navbar.cars')}
              </Link>
              <Link
                to='/user/profile?tab=trips'
                className='text-[hsl(var(--primary-foreground))] font-medium text-lg tracking-wider hover:text-[hsl(var(--primary-foreground))]/80 transition-colors'
                onClick={() => setMenuOpen(false)}
              >
                {t('navbar.bookings')}
              </Link>

              {/* User section in mobile menu */}
              <div className='flex flex-col items-center gap-4 pt-8 border-t border-[hsl(var(--primary-foreground))]/20 w-full'>
                <div className='flex items-center gap-2'>
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
                {!user ? (
                  <div className='flex flex-col gap-2 w-full'>
                    <Button
                      variant='outline'
                      asChild
                      className='border-[hsl(var(--primary-foreground))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))]'
                    >
                      <Link to='/login'>{t('navbar.login')}</Link>
                    </Button>
                    <Button
                      variant='default'
                      asChild
                      className='bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-foreground))]/90'
                    >
                      <Link to='/signup'>{t('navbar.joinUp')}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-2'>
                    <Avatar className='h-12 w-12'>
                      <AvatarImage src={''} alt={displayName} />
                      <AvatarFallback className='bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))]'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-[hsl(var(--primary-foreground))] font-medium'>
                      {displayName}
                    </span>
                    <div className='flex flex-col gap-1 w-full'>
                      <Button
                        variant='ghost'
                        asChild
                        className='text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground))]/20'
                      >
                        <Link to='/user/profile'>{t('navbar.profile')}</Link>
                      </Button>
                      <Button
                        variant='ghost'
                        onClick={handleLogout}
                        className='text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground))]/20'
                      >
                        {t('navbar.logout')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation and User Section */}
        <div className='hidden md:flex items-center gap-10'>
          <NavigationMenu className='hidden md:flex'>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to='/'
                    className='px-4 py-2 text-[hsl(var(--primary-foreground))] font-medium tracking-wider hover:text-[hsl(var(--primary-foreground))]/80 transition-colors'
                  >
                    {t('navbar.home')}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to='/cars'
                    className='px-4 py-2 text-[hsl(var(--primary-foreground))] font-medium tracking-wider hover:text-[hsl(var(--primary-foreground))]/80 transition-colors'
                  >
                    {t('navbar.cars')}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to='/user/profile?tab=trips'
                    className='px-4 py-2 text-[hsl(var(--primary-foreground))] font-medium tracking-wider hover:text-[hsl(var(--primary-foreground))]/80 transition-colors'
                  >
                    {t('navbar.bookings')}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className='hidden md:flex items-center gap-10'>
          <div className='flex items-center gap-2 ml-4'>
            <LanguageToggle />
            <ThemeToggle />
            {!user ? (
              <>
                <Button
                  variant='ghost'
                  asChild
                  className='text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground))]/20'
                >
                  <Link to='/login'>{t('navbar.login')}</Link>
                </Button>
                <Button
                  variant='default'
                  asChild
                  className='bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-foreground))]/90'
                >
                  <Link to='/signup'>{t('navbar.joinUp')}</Link>
                </Button>
              </>
            ) : (
              <div className='relative'>
                <div
                  className='flex items-center gap-2 cursor-pointer select-none px-2 py-1 rounded-md hover:bg-[hsl(var(--primary-foreground))]/20'
                  onMouseEnter={openMenu}
                  onMouseLeave={delayedClose}
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={''} alt={displayName} />
                    <AvatarFallback className='bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] text-sm'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-[hsl(var(--primary-foreground))] font-medium text-sm'>
                    {displayName}
                  </span>
                </div>
                {/* Dropdown */}
                {menuOpen && (
                  <div
                    className='absolute top-full mt-1 right-0 w-32 rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg overflow-hidden text-sm'
                    onMouseEnter={cancelClose}
                    onMouseLeave={delayedClose}
                  >
                    <Link
                      to='/user/profile'
                      className='block w-full px-3 py-2 hover:bg-gray-100 hover:text-gray-900'
                    >
                      {t('navbar.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='block w-full text-left px-3 py-2 hover:bg-gray-100 hover:text-gray-900'
                    >
                      {t('navbar.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
