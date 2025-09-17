import { useAuth } from '@/app/providers/AuthProvider';
import { useRef, useState } from 'react';
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
import LanguageToggle from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        {/* Logo */}
        <div className='flex items-center'>
          <Link to='/' className='text-2xl font-bold text-primary'>
            Ev Rental
          </Link>
        </div>

        {/* Navigation Links */}
        <NavigationMenu className='hidden md:flex'>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to='/' className='px-4 py-2'>
                  {t('navbar.home')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to='/features' className='px-4 py-2'>
                  {t('navbar.features')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to='/pricing' className='px-4 py-2'>
                  {t('navbar.pricing')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to='/about' className='px-4 py-2'>
                  {t('navbar.about')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to='/contact' className='px-4 py-2'>
                  {t('navbar.contact')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side */}
        <div className='flex items-center gap-3'>
          <LanguageToggle />
          <ThemeToggle />
          {!user ? (
            <>
              <Button variant='ghost' asChild>
                <Link to='/login'>{t('navbar.login')}</Link>
              </Button>
              <Button variant='default' asChild>
                <Link to='/signup'>{t('navbar.joinUp')}</Link>
              </Button>
            </>
          ) : (
            <div className='relative'>
              <div
                className='flex items-center gap-2 cursor-pointer select-none px-1 py-1 rounded-md hover:bg-accent/40'
                onMouseEnter={openMenu}
                onMouseLeave={delayedClose}
              >
                <Avatar className='h-9 w-9'>
                  <AvatarImage src={''} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className='hidden sm:inline-block font-medium'>
                  {displayName}
                </span>
              </div>
              {/* Dropdown */}
              {menuOpen && (
                <div
                  className='absolute top-full mt-1 w-20 rounded-md border border-border bg-popover text-popover-foreground shadow-md overflow-hidden text-sm'
                  onMouseEnter={cancelClose}
                  onMouseLeave={delayedClose}
                >
                  <Link
                    to='/user'
                    className='block w-full px-3 py-2 hover:bg-accent hover:text-accent-foreground'
                  >
                    {t('navbar.profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className='block w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground'
                  >
                    {t('navbar.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
