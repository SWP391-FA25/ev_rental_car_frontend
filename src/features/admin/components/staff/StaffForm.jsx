import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useFormValidation } from '../../../shared/hooks/useFormValidation.js';
import { staffCreateSchema } from '../../../shared/validations/staffValidation.js';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Button } from './../../../shared/components/ui/button';

export function StaffForm({ open, onOpenChange, onSubmit, loading = false }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    accountStatus: 'ACTIVE',
  });

  // Initialize form validation
  const { validate, validateField, clearError, hasError, getError } =
    useFormValidation(staffCreateSchema);

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form data using Zod schema
    const validation = validate(formData);

    if (!validation.success) {
      // Validation errors are already set in the errors state
      toast.error(
        t('staffForm.validation.formHasErrors', {
          defaultValue: 'Please fix the errors below',
        })
      );
      return;
    }

    try {
      await onSubmit(validation.data);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        accountStatus: 'ACTIVE',
      });
      onOpenChange(false);
    } catch (error) {
      console.log(error);
      toast.error(
        t('staffForm.validation.submissionError', {
          defaultValue: 'Failed to create staff member',
        })
      );
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

  const handleBlur = field => {
    // Validate field on blur
    validateField(field, formData[field]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('staffForm.title')}</DialogTitle>
          <DialogDescription>{t('staffForm.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                {t('staffForm.fields.name')}
              </Label>
              <div className='col-span-3'>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={hasError('name') ? 'border-red-500' : ''}
                  placeholder={t('staffForm.placeholders.name')}
                />
                {hasError('name') && (
                  <p className='text-red-500 text-sm mt-1'>
                    {getError('name')}
                  </p>
                )}
              </div>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='email' className='text-right'>
                {t('staffForm.fields.email')}
              </Label>
              <div className='col-span-3'>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={hasError('email') ? 'border-red-500' : ''}
                  placeholder={t('staffForm.placeholders.email')}
                />
                {hasError('email') && (
                  <p className='text-red-500 text-sm mt-1'>
                    {getError('email')}
                  </p>
                )}
              </div>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='password' className='text-right'>
                {t('staffForm.fields.password')}
              </Label>
              <div className='col-span-3'>
                <Input
                  id='password'
                  type='password'
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={hasError('password') ? 'border-red-500' : ''}
                  placeholder={t('staffForm.placeholders.password')}
                />
                {hasError('password') && (
                  <p className='text-red-500 text-sm mt-1'>
                    {getError('password')}
                  </p>
                )}
              </div>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='phone' className='text-right'>
                {t('staffForm.fields.phone')}
              </Label>
              <div className='col-span-3'>
                <Input
                  id='phone'
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={hasError('phone') ? 'border-red-500' : ''}
                  placeholder={t('staffForm.placeholders.phone')}
                />
                {hasError('phone') && (
                  <p className='text-red-500 text-sm mt-1'>
                    {getError('phone')}
                  </p>
                )}
              </div>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='address' className='text-right'>
                {t('staffForm.fields.address')}
              </Label>
              <div className='col-span-3'>
                <Textarea
                  id='address'
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  className={hasError('address') ? 'border-red-500' : ''}
                  placeholder={t('staffForm.placeholders.address')}
                  rows={3}
                />
                {hasError('address') && (
                  <p className='text-red-500 text-sm mt-1'>
                    {getError('address')}
                  </p>
                )}
              </div>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right'>
                {t('staffForm.fields.status')}
              </Label>
              <div className='col-span-3'>
                <Select
                  value={formData.accountStatus}
                  onValueChange={value =>
                    handleInputChange('accountStatus', value)
                  }
                >
                  <SelectTrigger
                    className={
                      hasError('accountStatus') ? 'border-red-500' : ''
                    }
                  >
                    <SelectValue
                      placeholder={t('staffForm.placeholders.status')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ACTIVE'>
                      {t('staffForm.statusOptions.active')}
                    </SelectItem>
                    <SelectItem value='SUSPENDED'>
                      {t('staffForm.statusOptions.suspended')}
                    </SelectItem>
                    <SelectItem value='BANNED'>
                      {t('staffForm.statusOptions.banned')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {hasError('accountStatus') && (
                  <p className='text-red-500 text-sm mt-1'>
                    {getError('accountStatus')}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('staffForm.buttons.cancel')}
            </Button>
            <Button type='submit' disabled={loading}>
              {loading
                ? t('staffForm.buttons.creating')
                : t('staffForm.buttons.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
