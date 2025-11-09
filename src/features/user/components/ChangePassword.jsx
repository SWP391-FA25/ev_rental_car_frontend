import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';
import { toast } from '@/features/shared/lib/toast';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = field => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirmation do not match');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.put(endpoints.auth.changePassword(), {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response?.success) {
        toast.success('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response?.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error(
        error?.message || 'An error occurred while changing password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-foreground mb-2'>
          Change Password
        </h1>
        <p className='text-sm text-muted-foreground'>
          Please enter your current password to change password
        </p>
      </div>

      {/* Form Card */}
      <div className='bg-card rounded-lg border border-border p-6 shadow-sm'>
        <h2 className='text-lg font-semibold text-card-foreground mb-6'>
          Enter Password
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Current Password */}
          <div className='space-y-2'>
            <Label
              htmlFor='current-password'
              className='text-sm font-medium text-muted-foreground'
            >
              Current password
            </Label>
            <div className='relative'>
              <Input
                id='current-password'
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={e =>
                  handleInputChange('currentPassword', e.target.value)
                }
                placeholder='Enter current password'
                className='pr-10'
                required
              />
              <button
                type='button'
                onClick={() => togglePasswordVisibility('current')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showPasswords.current ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className='space-y-2'>
            <Label
              htmlFor='new-password'
              className='text-sm font-medium text-muted-foreground'
            >
              New password
            </Label>
            <div className='relative'>
              <Input
                id='new-password'
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e => handleInputChange('newPassword', e.target.value)}
                placeholder='Enter new password'
                className='pr-10'
                required
              />
              <button
                type='button'
                onClick={() => togglePasswordVisibility('new')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showPasswords.new ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className='space-y-2'>
            <Label
              htmlFor='confirm-password'
              className='text-sm font-medium text-muted-foreground'
            >
              Confirm new password
            </Label>
            <div className='relative'>
              <Input
                id='confirm-password'
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                placeholder='Re-enter new password'
                className='pr-10'
                required
              />
              <button
                type='button'
                onClick={() => togglePasswordVisibility('confirm')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showPasswords.confirm ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end pt-4'>
            <Button type='submit' disabled={isLoading} className='px-8'>
              {isLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
