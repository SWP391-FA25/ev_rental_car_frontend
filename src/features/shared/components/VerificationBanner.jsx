import { useAuth } from '@/app/providers/AuthProvider';
import { Mail, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

export default function VerificationBanner() {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is not RENTER, verified, or banner is dismissed
  if (
    !user ||
    user.role !== 'RENTER' ||
    user.verifyStatus === 'VERIFIED' ||
    isDismissed
  ) {
    return null;
  }

  return (
    <div className='bg-amber-50 border-l-4 border-amber-400 p-4 mb-4'>
      <div className='flex items-start'>
        <div className='flex-shrink-0'>
          <Mail className='h-5 w-5 text-amber-400' />
        </div>
        <div className='ml-3 flex-1'>
          <h3 className='text-sm font-medium text-amber-800'>
            Verify your email address
          </h3>
          <div className='mt-2 text-sm text-amber-700'>
            <p>
              Please verify your email address to unlock all features and ensure
              you receive important notifications about your bookings.
            </p>
          </div>
          <div className='mt-3 flex space-x-3'>
            <Link to='/verify-email'>
              <Button
                size='sm'
                variant='outline'
                className='text-amber-800 border-amber-300 hover:bg-amber-100'
              >
                Verify Email
              </Button>
            </Link>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => setIsDismissed(true)}
              className='text-amber-600 hover:text-amber-800'
            >
              Remind me later
            </Button>
          </div>
        </div>
        <div className='ml-auto pl-3'>
          <div className='-mx-1.5 -my-1.5'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsDismissed(true)}
              className='inline-flex rounded-md p-1.5 text-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600'
            >
              <span className='sr-only'>Dismiss</span>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
