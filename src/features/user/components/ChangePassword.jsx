import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useApi } from '../../shared/hooks/useApi';
import { endpoints } from '../../shared/lib/endpoints';

export default function ChangePassword() {
  const { post, loading } = useApi();
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

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const togglePasswordVisibility = field => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await post(endpoints.auth.changePassword(), {
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
        setErrors({});
      }
    } catch (error) {
      // Error already handled by useApi
      console.error('Failed to change password:', error.message);
    }
  };

  return (
    <div className='mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-foreground mb-2'>
          Đổi mật khẩu
        </h1>
        <p className='text-sm text-muted-foreground'>
          Vui lòng nhập mật khẩu hiện tại của bạn để thay đổi mật khẩu
        </p>
      </div>

      {/* Form Card */}
      <div className='bg-card rounded-lg border border-border p-6 shadow-sm'>
        <h2 className='text-lg font-semibold text-card-foreground mb-6'>
          Nhập mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Current Password */}
          <div className='space-y-2'>
            <Label
              htmlFor='current-password'
              className='text-sm font-medium text-muted-foreground'
            >
              Mật khẩu hiện tại
            </Label>
            <div className='relative'>
              <Input
                id='current-password'
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={e =>
                  handleInputChange('currentPassword', e.target.value)
                }
                placeholder='Nhập mật khẩu hiện tại'
                className={`pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                required
              />
              {errors.currentPassword && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.currentPassword}
                </p>
              )}
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
              Mật khẩu mới
            </Label>
            <div className='relative'>
              <Input
                id='new-password'
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e => handleInputChange('newPassword', e.target.value)}
                placeholder='Nhập mật khẩu mới'
                className={`pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                required
              />
              {errors.newPassword && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.newPassword}
                </p>
              )}
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
              Xác nhận mật khẩu mới
            </Label>
            <div className='relative'>
              <Input
                id='confirm-password'
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                placeholder='Nhập lại mật khẩu mới'
                className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                required
              />
              {errors.confirmPassword && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.confirmPassword}
                </p>
              )}
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
            <Button type='submit' disabled={loading} className='px-8'>
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
