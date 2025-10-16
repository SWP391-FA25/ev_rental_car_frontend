import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

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

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('staffForm.validation.nameRequired'));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t('staffForm.validation.emailRequired'));
      return;
    }
    if (!formData.password.trim()) {
      toast.error(t('staffForm.validation.passwordRequired'));
      return;
    }

    try {
      await onSubmit(formData);
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
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
              <Input
                id='name'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className='col-span-3'
                placeholder={t('staffForm.placeholders.name')}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='email' className='text-right'>
                {t('staffForm.fields.email')}
              </Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className='col-span-3'
                placeholder={t('staffForm.placeholders.email')}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='password' className='text-right'>
                {t('staffForm.fields.password')}
              </Label>
              <Input
                id='password'
                type='password'
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                className='col-span-3'
                placeholder={t('staffForm.placeholders.password')}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='phone' className='text-right'>
                {t('staffForm.fields.phone')}
              </Label>
              <Input
                id='phone'
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                className='col-span-3'
                placeholder={t('staffForm.placeholders.phone')}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='address' className='text-right'>
                {t('staffForm.fields.address')}
              </Label>
              <Textarea
                id='address'
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                className='col-span-3'
                placeholder={t('staffForm.placeholders.address')}
                rows={3}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right'>
                {t('staffForm.fields.status')}
              </Label>
              <Select
                value={formData.accountStatus}
                onValueChange={value =>
                  handleInputChange('accountStatus', value)
                }
              >
                <SelectTrigger className='col-span-3'>
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
