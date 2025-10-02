import { useAuth } from '@/app/providers/AuthProvider';
import { ArrowLeft } from 'lucide-react';
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
import { useErrorHandler } from '../../shared/hooks/useErrorHandler';
import {
  CommonSchemas,
  useFormValidation,
} from '../../shared/services/validationService';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Use error handler
  const { handleFormSubmit, isLoading } = useErrorHandler({
    showToast: true,
    redirectOnAuth: false, // Don't redirect on auth errors for login page
  });

  // Use form validation
  const {
    data: formData,
    errors,
    setValue,
    setTouched,
    validateAll,
    reset,
  } = useFormValidation(CommonSchemas.login, {
    email: '',
    password: '',
  });

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form first
    if (!validateAll()) {
      return;
    }

    try {
      await handleFormSubmit(async () => {
        const res = await apiClient.post(endpoints.auth.login(), formData);

        if (res?.success && res?.data?.user) {
          const user = res.data.user;
          login(user);
          toast.success('Logged in successfully', {
            position: 'top-center',
            autoClose: 2000,
          });

          // Navigate based on user role
          if (user?.role === 'ADMIN') {
            navigate('/admin');
          } else if (user?.role === 'STAFF') {
            navigate('/staff');
          } else {
            navigate('/user');
          }

          reset(); // Clear form on success
        } else {
          throw new Error(res?.message || 'Login failed');
        }

        return res;
      });
    } catch (error) {
      // Error is already handled by handleFormSubmit
      console.log('Login failed:', error.message);
    }
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
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={formData.email}
                  onChange={e => setValue('email', e.target.value)}
                  onBlur={() => setTouched('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className='text-sm text-destructive'>{errors.email}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={e => setValue('password', e.target.value)}
                  onBlur={() => setTouched('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className='text-sm text-destructive'>{errors.password}</p>
                )}
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

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
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
