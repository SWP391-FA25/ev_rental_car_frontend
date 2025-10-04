import { useAuth } from '@/app/providers/AuthProvider';
import { ArrowLeft, CheckCircle2, Mail, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user, verifyUser } = useAuth();
  const navigate = useNavigate();

  const handleVerifyToken = useCallback(
    async verifyToken => {
      setVerificationStatus('verifying');
      setErrorMessage('');

      try {
        const res = await apiClient.get(endpoints.email.verify(verifyToken));

        if (res?.success && res?.message === 'Email verified successfully') {
          setVerificationStatus('success');
          toast.success('Email verified successfully!', {
            position: 'top-center',
            autoClose: 3000,
          });

          // Refresh user data to get updated verification status
          await verifyUser();

          // Redirect after a short delay
          setTimeout(() => {
            if (user?.role === 'ADMIN') {
              navigate('/admin');
            } else if (user?.role === 'STAFF') {
              navigate('/staff');
            } else {
              navigate('/user');
            }
          }, 2000);
        } else {
          setVerificationStatus('error');
          setErrorMessage(res?.message || 'Verification failed');
        }
      } catch (err) {
        setVerificationStatus('error');
        setErrorMessage(
          err?.message ||
            'Failed to verify email. The token may be invalid or expired.'
        );
        toast.error(err?.message || 'Verification failed', {
          position: 'top-center',
          autoClose: 3000,
        });
      }
    },
    [user, navigate, verifyUser]
  );

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token) {
      handleVerifyToken(token);
    }
  }, [token, handleVerifyToken]);

  const handleSendVerification = async () => {
    if (!user) {
      toast.error('Please log in to send verification email', {
        position: 'top-center',
        autoClose: 2000,
      });
      navigate('/login');
      return;
    }

    setIsSending(true);
    setErrorMessage('');

    try {
      const res = await apiClient.post(endpoints.email.sendVerification());

      if (res?.success !== false) {
        toast.success('Verification email sent! Please check your inbox.', {
          position: 'top-center',
          autoClose: 4000,
        });
      } else {
        setErrorMessage(res?.message || 'Failed to send verification email');
        toast.error(res?.message || 'Failed to send verification email', {
          position: 'top-center',
          autoClose: 3000,
        });
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to send verification email');
      toast.error(err?.message || 'Failed to send verification email', {
        position: 'top-center',
        autoClose: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Render verification result if token is present
  if (token) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='mb-6'>
            <Button
              variant='ghost'
              asChild
              className='text-muted-foreground hover:text-foreground'
            >
              <Link to='/' className='flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4' />
                Back to Home
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className='text-center'>
              <div className='flex justify-center mb-4'>
                {verificationStatus === 'verifying' && (
                  <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary'></div>
                )}
                {verificationStatus === 'success' && (
                  <CheckCircle2 className='h-16 w-16 text-green-500' />
                )}
                {verificationStatus === 'error' && (
                  <XCircle className='h-16 w-16 text-red-500' />
                )}
              </div>
              <CardTitle className='text-2xl font-bold'>
                {verificationStatus === 'verifying' && 'Verifying Email...'}
                {verificationStatus === 'success' && 'Email Verified!'}
                {verificationStatus === 'error' && 'Verification Failed'}
              </CardTitle>
              <CardDescription>
                {verificationStatus === 'verifying' &&
                  'Please wait while we verify your email address.'}
                {verificationStatus === 'success' &&
                  'Your email has been successfully verified. Redirecting...'}
                {verificationStatus === 'error' && errorMessage}
              </CardDescription>
            </CardHeader>
            {verificationStatus === 'error' && (
              <CardContent>
                <Button
                  onClick={handleSendVerification}
                  disabled={isSending}
                  className='w-full'
                >
                  {isSending ? 'Sending...' : 'Request New Verification Email'}
                </Button>
                <div className='mt-4 text-center'>
                  <Link
                    to='/login'
                    className='text-sm text-primary hover:underline'
                  >
                    Back to Login
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Render send verification email form if no token
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='mb-6'>
          <Button
            variant='ghost'
            asChild
            className='text-muted-foreground hover:text-foreground'
          >
            <Link to='/' className='flex items-center gap-2'>
              <ArrowLeft className='h-4 w-4' />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className='text-center'>
            <div className='flex justify-center mb-4'>
              <Mail className='h-16 w-16 text-primary' />
            </div>
            <CardTitle className='text-2xl font-bold'>
              Verify Your Email
            </CardTitle>
            <CardDescription>
              {user
                ? `We'll send a verification link to ${user.email}`
                : 'Please log in to verify your email address'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && user.verifyStatus === 'VERIFIED' ? (
              <div className='text-center space-y-4'>
                <div className='flex justify-center'>
                  <CheckCircle2 className='h-12 w-12 text-green-500' />
                </div>
                <p className='text-sm text-muted-foreground'>
                  Your email is already verified!
                </p>
                <Button
                  onClick={() => {
                    if (user?.role === 'ADMIN') {
                      navigate('/admin');
                    } else if (user?.role === 'STAFF') {
                      navigate('/staff');
                    } else {
                      navigate('/user');
                    }
                  }}
                  className='w-full'
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : user ? (
              <div className='space-y-4'>
                <Button
                  onClick={handleSendVerification}
                  disabled={isSending}
                  className='w-full'
                >
                  {isSending ? 'Sending...' : 'Send Verification Email'}
                </Button>
                {errorMessage && (
                  <p className='text-sm text-red-500 text-center'>
                    {errorMessage}
                  </p>
                )}
                <p className='text-xs text-muted-foreground text-center'>
                  Click the button above to receive a verification email. The
                  link will be valid for 5 minutes.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                <Button onClick={() => navigate('/login')} className='w-full'>
                  Log In to Verify Email
                </Button>
                <p className='text-sm text-muted-foreground text-center'>
                  Don't have an account?{' '}
                  <Link
                    to='/signup'
                    className='text-primary hover:underline font-medium'
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
