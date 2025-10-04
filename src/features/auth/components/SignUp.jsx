import { ArrowLeft } from 'lucide-react';
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

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone || undefined,
        // optional fields you might add to UI later
        license: undefined,
        address: formData.address || undefined,
      };
      const res = await apiClient.post(endpoints.auth.register(), payload);
      if (!res?.success) throw new Error(res?.message || 'Signup failed');
      toast.success(
        `Account created successfully! Please verify your email to complete registration.`,
        {
          position: 'top-right',
          autoClose: 4000,
        }
      );
      navigate('/verify-email');
    } catch (err) {
      setError(err?.message || 'Signup failed');
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
            <CardTitle className='text-2xl font-bold'>Create Account</CardTitle>
            <CardDescription>
              Join Ev Rental and transform your fleet management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    name='firstName'
                    type='text'
                    placeholder='John'
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    name='lastName'
                    type='text'
                    placeholder='Doe'
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='john@company.com'
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='address'>Address</Label>
                <Input
                  id='address'
                  name='address'
                  type='text'
                  placeholder='Your Address'
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  name='phone'
                  type='tel'
                  placeholder='+1 (555) 123-4567'
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='Create a strong password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  placeholder='Confirm your password'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  id='terms'
                  type='checkbox'
                  className='rounded border-border'
                  required
                />
                <Label htmlFor='terms' className='text-sm'>
                  I agree to the{' '}
                  <Link to='/policy' className='text-primary hover:underline'>
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type='submit' className='w-full'>
                Create Account
              </Button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-sm text-muted-foreground'>
                Already have an account?{' '}
                <Link
                  to='/login'
                  className='text-primary hover:underline font-medium'
                >
                  Sign in
                </Link>
              </p>
            </div>
            {error && (
              <div className='mt-2 text-center text-red-500 text-sm'>
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
