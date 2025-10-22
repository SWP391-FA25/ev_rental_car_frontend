import { useAuth } from '@/app/providers/AuthProvider';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { toast } from '../../shared/lib/toast';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiClient.post(endpoints.auth.login(), formData);
      if (res?.success && res?.data?.user) {
        const user = res.data.user;
        login(user);

        // Show verification reminder only for RENTER role if not verified
        if (user.role === 'RENTER' && user.verifyStatus !== 'VERIFIED') {
          toast.info('Please verify your email to unlock all features', {
            position: 'top-center',
            autoClose: 2000,
          });
        }

        // toast.success('Logged in successfully', {
        //   position: 'top-center',
        //   autoClose: 2000,
        // });
        if (user?.role === 'ADMIN') {
          navigate('/admin');
        } else if (user?.role === 'STAFF') {
          navigate('/staff');
        } else {
          navigate('/user');
        }
      } else {
        setError(res?.message || 'Login failed');
      }
    } catch (err) {
      setError(err?.message || 'An error occurred. Please try again.');
    }
  };

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Back to Home Button */}
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
            <CardTitle className='text-2xl font-bold'>Welcome Back</CardTitle>
            <CardDescription>Sign in to your Ev Rental account</CardDescription>
          </CardHeader>
          {error && (
            <CardDescription className='text-red-500 text-center'>
              {error}
            </CardDescription>
          )}
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='Enter your email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <input
                    id='remember'
                    type='checkbox'
                    className='rounded border-border'
                  />
                  <Label htmlFor='remember' className='text-sm'>
                    Remember me
                  </Label>
                </div>
                <Link
                  to='/forgot-password'
                  className='text-sm text-primary hover:underline'
                >
                  Forgot password?
                </Link>
              </div>

              <Button type='submit' className='w-full'>
                Sign In
              </Button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-sm text-muted-foreground'>
                Don't have an account?{' '}
                <Link
                  to='/signup'
                  className='text-primary hover:underline font-medium'
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
