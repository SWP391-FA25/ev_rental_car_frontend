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
  ValidationRules,
  ValidationSchema,
} from '../../shared/services/validationService';

// Custom signup validation schema
const signupSchema = new ValidationSchema({
  firstName: [
    ValidationRules.name.required,
    ValidationRules.name.minLength(2),
    ValidationRules.name.maxLength(50),
  ],
  lastName: [
    ValidationRules.name.required,
    ValidationRules.name.minLength(2),
    ValidationRules.name.maxLength(50),
  ],
  email: [ValidationRules.email.required, ValidationRules.email.format],
  password: [
    ValidationRules.password.required,
    ValidationRules.password.minLength(8),
    ValidationRules.password.strength,
  ],
  confirmPassword: [
    ValidationRules.password.required,
    (value, allData) => {
      if (value !== allData.password) {
        return 'Passwords do not match';
      }
      return null;
    },
  ],
  phone: [ValidationRules.phone.format], // Optional field
});

export default function SignUp() {
  const navigate = useNavigate();

  // Use error handler
  const { handleFormSubmit, isLoading } = useErrorHandler({
    showToast: true,
    redirectOnAuth: false,
  });

  // Use form validation
  const {
    data: formData,
    errors,
    setValue,
    setTouched,
    validateAll,
    reset,
  } = useFormValidation(signupSchema, {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
  });

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setValue(name, value);
  };

  // Handle input blur for validation
  const handleBlur = e => {
    const { name } = e.target;
    setTouched(name);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form first
    if (!validateAll()) {
      return;
    }

    try {
      await handleFormSubmit(async () => {
        const payload = {
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone || undefined,
          // optional fields you might add to UI later
          license: undefined,
          address: formData.company || undefined,
        };

        const res = await apiClient.post(endpoints.auth.register(), payload);

        if (!res?.success) {
          throw new Error(res?.message || 'Signup failed');
        }

        toast.success(
          `Account created successfully! Welcome, ${formData.firstName}!`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );

        reset(); // Clear form on success
        navigate('/login');

        return res;
      });
    } catch (error) {
      // Error is already handled by handleFormSubmit
      console.log('Signup failed:', error.message);
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
                    onBlur={handleBlur}
                    className={errors.firstName ? 'border-red-500' : ''}
                    required
                  />
                  {errors.firstName && (
                    <p className='text-sm text-red-500'>{errors.firstName}</p>
                  )}
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
                    onBlur={handleBlur}
                    className={errors.lastName ? 'border-red-500' : ''}
                    required
                  />
                  {errors.lastName && (
                    <p className='text-sm text-red-500'>{errors.lastName}</p>
                  )}
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
                  onBlur={handleBlur}
                  className={errors.email ? 'border-red-500' : ''}
                  required
                />
                {errors.email && (
                  <p className='text-sm text-red-500'>{errors.email}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='company'>Company</Label>
                <Input
                  id='company'
                  name='company'
                  type='text'
                  placeholder='Your Company Name'
                  value={formData.company}
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
                  onBlur={handleBlur}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className='text-sm text-red-500'>{errors.phone}</p>
                )}
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
                  onBlur={handleBlur}
                  className={errors.password ? 'border-red-500' : ''}
                  required
                />
                {errors.password && (
                  <p className='text-sm text-red-500'>{errors.password}</p>
                )}
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
                  onBlur={handleBlur}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  required
                />
                {errors.confirmPassword && (
                  <p className='text-sm text-red-500'>
                    {errors.confirmPassword}
                  </p>
                )}
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

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
