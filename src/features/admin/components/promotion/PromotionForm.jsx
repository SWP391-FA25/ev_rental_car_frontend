import { format } from 'date-fns';
import { CalendarIcon, LoaderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../shared/components/ui/button';
import { Calendar } from '../../../shared/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover';
import { Textarea } from '../../../shared/components/ui/textarea';
import { cn } from '../../../shared/lib/utils';

export function PromotionForm({
  open,
  onOpenChange,
  onSubmit,
  promotion = null,
  loading = false,
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount: '',
    validFrom: null,
    validUntil: null,
  });
  const [errors, setErrors] = useState({});

  const isEdit = !!promotion;

  useEffect(() => {
    if (promotion) {
      setFormData({
        code: promotion.code || '',
        description: promotion.description || '',
        discount: promotion.discount?.toString() || '',
        validFrom: promotion.validFrom ? new Date(promotion.validFrom) : null,
        validUntil: promotion.validUntil
          ? new Date(promotion.validUntil)
          : null,
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discount: '',
        validFrom: null,
        validUntil: null,
      });
    }
    setErrors({});
  }, [promotion, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = t('promotionForm.codeRequired');
    } else if (formData.code.length < 3) {
      newErrors.code = t('promotionForm.codeMin');
    }

    if (!formData.discount) {
      newErrors.discount = t('promotionForm.discountRequired');
    } else if (isNaN(formData.discount) || parseFloat(formData.discount) <= 0) {
      newErrors.discount = t('promotionForm.discountPositive');
    }

    if (!formData.validFrom) {
      newErrors.validFrom = t('promotionForm.validFromRequired');
    }

    if (!formData.validUntil) {
      newErrors.validUntil = t('promotionForm.validUntilRequired');
    }

    if (
      formData.validFrom &&
      formData.validUntil &&
      formData.validFrom >= formData.validUntil
    ) {
      newErrors.validUntil = t('promotionForm.validUntilAfter');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitData = {
        code: formData.code.trim(),
        description: formData.description.trim() || null,
        discount: parseFloat(formData.discount),
        validFrom: formData.validFrom.toISOString(),
        validUntil: formData.validUntil.toISOString(),
      };
      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting promotion:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('promotionForm.titleEdit') : t('promotionForm.titleAdd')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('promotionForm.descEdit') : t('promotionForm.descAdd')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='code'>{t('promotionForm.codeLabel')}</Label>
            <Input
              id='code'
              value={formData.code}
              onChange={e =>
                handleInputChange('code', e.target.value.toUpperCase())
              }
              placeholder={t('promotionForm.codePlaceholder')}
              className={errors.code ? 'border-red-500' : ''}
            />
            {errors.code && (
              <p className='text-sm text-red-500'>{errors.code}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>
              {t('promotionForm.descriptionLabel')}
            </Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder={t('promotionForm.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='discount'>{t('promotionForm.discountLabel')}</Label>
            <div className='flex items-center space-x-2'>
              <Input
                id='discount'
                type='number'
                step='0.01'
                min='0'
                value={formData.discount}
                onChange={e => handleInputChange('discount', e.target.value)}
                placeholder={t('promotionForm.discountPlaceholder')}
                className={errors.discount ? 'border-red-500' : ''}
              />
              <span className='text-sm text-muted-foreground'>%</span>
            </div>
            {errors.discount && (
              <p className='text-sm text-red-500'>{errors.discount}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>{t('promotionForm.validFromLabel')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.validFrom && 'text-muted-foreground',
                      errors.validFrom && 'border-red-500'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {formData.validFrom ? (
                      format(formData.validFrom, 'PPP')
                    ) : (
                      <span>{t('promotionForm.pickDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={formData.validFrom}
                    onSelect={date => handleInputChange('validFrom', date)}
                    disabled={date => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.validFrom && (
                <p className='text-sm text-red-500'>{errors.validFrom}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label>{t('promotionForm.validUntilLabel')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.validUntil && 'text-muted-foreground',
                      errors.validUntil && 'border-red-500'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {formData.validUntil ? (
                      format(formData.validUntil, 'PPP')
                    ) : (
                      <span>{t('promotionForm.pickDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={formData.validUntil}
                    onSelect={date => handleInputChange('validUntil', date)}
                    disabled={date =>
                      date < new Date() ||
                      (formData.validFrom && date <= formData.validFrom)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.validUntil && (
                <p className='text-sm text-red-500'>{errors.validUntil}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('promotionForm.cancel')}
            </Button>
            <Button type='submit' disabled={loading}>
              {loading && <LoaderIcon className='mr-2 h-4 w-4 animate-spin' />}
              {isEdit
                ? t('promotionForm.submitEdit')
                : t('promotionForm.submitAdd')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
