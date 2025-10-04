import { useAuth } from '@/app/providers/AuthProvider';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  XCircle,
} from 'lucide-react';
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
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleVerifyToken = useCallback(async verifyToken => {
    setVerificationStatus('verifying');
    setErrorMessage('');

    try {
      const res = await apiClient.get(endpoints.email.verifyReset(verifyToken));

      if (res?.success && res?.message === 'Password reset token is valid') {
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
        setErrorMessage(res?.message || 'Invalid or expired token');
      }
    } catch (err) {
      setVerificationStatus('error');
      setErrorMessage(
        err?.response?.data?.message ||
          'Invalid or expired token. Please request a new password reset.'
      );
      toast.error('Invalid or expired token', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  }, []);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token) {
      handleVerifyToken(token);
    }
  }, [token, handleVerifyToken]);

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setIsResetting(true);

    try {
      const res = await apiClient.post('/api/auth/reset-password', {
        token,
        password: formData.password,
      });

      if (res?.success) {
        toast.success(
          'Password reset successfully! Please log in with your new password.',
          {
            position: 'top-center',
            autoClose: 4000,
          }
        );
        navigate('/login');
      } else {
        setErrorMessage(res?.message || 'Failed to reset password');
      }
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          'Failed to reset password. Please try again.'
      );
      toast.error('Failed to reset password', {
        position: 'top-center',
        autoClose: 3000,
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Render token verification result if token is present
  if (token) {
    if (verificationStatus === 'verifying') {
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
                  <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary'></div>
                </div>
                <CardTitle className='text-2xl font-bold'>
                  Verifying Token...
                </CardTitle>
                <CardDescription>
                  Please wait while we verify your password reset token.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'error') {
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
                  <XCircle className='h-16 w-16 text-red-500' />
                </div>
                <CardTitle className='text-2xl font-bold'>
                  Invalid Token
                </CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <Button
                    onClick={() => navigate('/forgot-password')}
                    className='w-full'
                  >
                    Request New Reset Link
                  </Button>
                  <div className='text-center'>
                    <Link
                      to='/login'
                      className='text-sm text-primary hover:underline'
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'success') {
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
                  <CheckCircle2 className='h-16 w-16 text-green-500' />
                </div>
                <CardTitle className='text-2xl font-bold'>
                  Reset Your Password
                </CardTitle>
                <CardDescription>
                  Enter your new password below to complete the reset process.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='password'>New Password</Label>
                    <div className='relative'>
                      <Input
                        id='password'
                        name='password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter your new password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>
                      Confirm New Password
                    </Label>
                    <div className='relative'>
                      <Input
                        id='confirmPassword'
                        name='confirmPassword'
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Confirm your new password'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>

                  {errorMessage && (
                    <p className='text-sm text-red-500 text-center'>
                      {errorMessage}
                    </p>
                  )}

                  <Button
                    type='submit'
                    disabled={isResetting}
                    className='w-full'
                  >
                    {isResetting ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  // Render forgot password form if no token
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
              <Lock className='h-16 w-16 text-primary' />
            </div>
            <CardTitle className='text-2xl font-bold'>
              Forgot Password?
            </CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <p className='text-sm text-muted-foreground text-center'>
                This feature is coming soon. Please contact support for password
                reset assistance.
              </p>
              <Button onClick={() => navigate('/login')} className='w-full'>
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
