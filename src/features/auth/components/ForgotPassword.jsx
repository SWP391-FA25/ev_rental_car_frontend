import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsSending(true);

    try {
      const res = await apiClient.post(endpoints.email.forgotPassword(), {
        email,
      });

      if (res?.success !== false) {
        setIsSent(true);
        toast.success('Password reset email sent! Please check your inbox.', {
          position: 'top-center',
          autoClose: 4000,
        });
      } else {
        setError(res?.message || 'Failed to send reset email');
        toast.error(res?.message || 'Failed to send reset email', {
          position: 'top-center',
          autoClose: 3000,
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset email');
      toast.error('Failed to send reset email', {
        position: 'top-center',
        autoClose: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isSent) {
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
              <CardTitle className='text-2xl font-bold'>Email Sent!</CardTitle>
              <CardDescription>
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='text-sm text-muted-foreground space-y-2'>
                  <p>
                    Please check your email and click the link to reset your
                    password.
                  </p>
                  <p>The link will expire in 1 hour for security reasons.</p>
                </div>
                <Button onClick={() => navigate('/login')} className='w-full'>
                  Back to Login
                </Button>
                <div className='text-center'>
                  <Button
                    variant='ghost'
                    onClick={() => {
                      setIsSent(false);
                      setEmail('');
                    }}
                    className='text-sm text-primary hover:underline'
                  >
                    Send to a different email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              Forgot Password?
            </CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='Enter your email address'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className='text-sm text-red-500 text-center'>{error}</p>
              )}

              <Button type='submit' disabled={isSending} className='w-full'>
                {isSending ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-sm text-muted-foreground'>
                Remember your password?{' '}
                <Link
                  to='/login'
                  className='text-primary hover:underline font-medium'
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
