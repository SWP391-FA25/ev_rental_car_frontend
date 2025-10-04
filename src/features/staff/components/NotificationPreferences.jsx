import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { Label } from '../../shared/components/ui/label';
import { Switch } from '../../shared/components/ui/switch';
import { Button } from '../../shared/components/ui/button';
import { SaveIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function NotificationPreferences() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    bookingNotifications: true,
    maintenanceNotifications: true,
    paymentNotifications: true,
    documentNotifications: true,
    inAppNotifications: true,
  });

  const handleSave = () => {
    // In a real application, this would save to the backend
    console.log('Saving notification preferences:', preferences);
    toast.success(t('staff.notifications.preferencesSaved'));
  };

  const handleToggle = key => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('staff.notifications.title')}</CardTitle>
        <CardDescription>
          {t('staff.notifications.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4'>
          <h3 className='font-medium'>{t('staff.notifications.channels')}</h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailNotifications'>
                  {t('staff.notifications.email')}
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {t('staff.notifications.emailDesc')}
                </p>
              </div>
              <Switch
                id='emailNotifications'
                checked={preferences.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='smsNotifications'>
                  {t('staff.notifications.sms')}
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {t('staff.notifications.smsDesc')}
                </p>
              </div>
              <Switch
                id='smsNotifications'
                checked={preferences.smsNotifications}
                onCheckedChange={() => handleToggle('smsNotifications')}
              />
            </div>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='inAppNotifications'>
                  {t('staff.notifications.inApp')}
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {t('staff.notifications.inAppDesc')}
                </p>
              </div>
              <Switch
                id='inAppNotifications'
                checked={preferences.inAppNotifications}
                onCheckedChange={() => handleToggle('inAppNotifications')}
              />
            </div>
          </div>
        </div>

        <div className='space-y-4 pt-4 border-t'>
          <h3 className='font-medium'>{t('staff.notifications.categories')}</h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='bookingNotifications'>
                  {t('staff.notifications.booking')}
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {t('staff.notifications.bookingDesc')}
                </p>
              </div>
              <Switch
                id='bookingNotifications'
                checked={preferences.bookingNotifications}
                onCheckedChange={() => handleToggle('bookingNotifications')}
              />
            </div>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='maintenanceNotifications'>
                  {t('staff.notifications.maintenance')}
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {t('staff.notifications.maintenanceDesc')}
                </p>
              </div>
              <Switch
                id='maintenanceNotifications'
                checked={preferences.maintenanceNotifications}
                onCheckedChange={() => handleToggle('maintenanceNotifications')}
              />
            </div>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='paymentNotifications'>
                  {t('staff.notifications.payment')}
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {t('staff.notifications.paymentDesc')}
                </p>
              </div>
              <Switch
                id='paymentNotifications'
                checked={preferences.paymentNotifications}
                onCheckedChange={() => handleToggle('paymentNotifications')}
              />
            </div>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='documentNotifications'>
                  {t('staff.notifications.document')}
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {t('staff.notifications.documentDesc')}
                </p>
              </div>
              <Switch
                id='documentNotifications'
                checked={preferences.documentNotifications}
                onCheckedChange={() => handleToggle('documentNotifications')}
              />
            </div>
          </div>
        </div>

        <div className='flex justify-end'>
          <Button onClick={handleSave}>
            <SaveIcon className='mr-2 h-4 w-4' />
            {t('staff.notifications.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
