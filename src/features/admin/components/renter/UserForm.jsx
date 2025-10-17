import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../../../shared/hooks/useFormValidation.js';
import { renterCreateSchema } from '../../../shared/validations/renterValidation.js';

import { Button } from '../../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';

export function UserForm({ open, onOpenChange, onUserCreated, createUser }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  // Initialize form validation
  const { validate, validateField, clearError, hasError, getError } =
    useFormValidation(renterCreateSchema);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
      });
      // Clear validation errors when dialog closes
    }
  }, [open]);

  const handleBlur = field => {
    // Validate field on blur
    validateField(field, formData[field]);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form data using Zod schema
    const validation = validate(formData);

    if (!validation.success) {
      return;
    }

    try {
      setLoading(true);

      const userData = {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone,
        address: validation.data.address,
        password: validation.data.password,
      };

      const newUser = await createUser(userData);
      onUserCreated?.(newUser);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (hasError(field)) {
      clearError(field);
    }
  };

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className='w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('userForm.title')}</DialogTitle>
          <DialogDescription>{t('userForm.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>
              {t('userForm.basicInfoTitle')}
            </h3>

            <div className='space-y-2'>
              <Label htmlFor='name'>{t('userForm.fields.name')} *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={hasError('name') ? 'border-red-500' : ''}
                disabled={loading}
                placeholder={t('userForm.placeholders.name')}
              />
              {hasError('name') && (
                <p className='text-sm text-red-500'>{getError('name')}</p>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>{t('userForm.fields.email')} *</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={hasError('email') ? 'border-red-500' : ''}
                  disabled={loading}
                  placeholder={t('userForm.placeholders.email')}
                />
                {hasError('email') && (
                  <p className='text-sm text-red-500'>{getError('email')}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>{t('userForm.fields.phone')} *</Label>
                <Input
                  id='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={hasError('phone') ? 'border-red-500' : ''}
                  disabled={loading}
                  placeholder={t('userForm.placeholders.phone')}
                />
                {hasError('phone') && (
                  <p className='text-sm text-red-500'>{getError('phone')}</p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>{t('userForm.fields.address')}</Label>
              <Textarea
                id='address'
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                onBlur={() => handleBlur('address')}
                rows={3}
                className={`w-full resize-none ${
                  hasError('address') ? 'border-red-500' : ''
                }`}
                disabled={loading}
                placeholder={t('userForm.placeholders.address')}
              />
              {hasError('address') && (
                <p className='text-sm text-red-500'>{getError('address')}</p>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>
              {t('userForm.accountSecurityTitle')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='password'>
                  {t('userForm.fields.password')} *
                </Label>
                <Input
                  id='password'
                  type='password'
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={hasError('password') ? 'border-red-500' : ''}
                  disabled={loading}
                  placeholder={t('userForm.placeholders.password')}
                />
                {hasError('password') && (
                  <p className='text-sm text-red-500'>{getError('password')}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>
                  {t('userForm.fields.confirmPassword')} *
                </Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  value={formData.confirmPassword}
                  onChange={e =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  onBlur={() => handleBlur('confirmPassword')}
                  className={
                    hasError('confirmPassword') ? 'border-red-500' : ''
                  }
                  disabled={loading}
                  placeholder={t('userForm.placeholders.confirmPassword')}
                />
                {hasError('confirmPassword') && (
                  <p className='text-sm text-red-500'>
                    {getError('confirmPassword')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className='w-full sm:w-auto'
            >
              {t('userForm.buttons.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='w-full sm:w-auto'
            >
              {loading
                ? t('userForm.buttons.creating')
                : t('userForm.buttons.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
