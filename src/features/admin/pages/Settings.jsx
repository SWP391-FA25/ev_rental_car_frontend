import { SaveIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import { Switch } from '../../shared/components/ui/switch';
import { Textarea } from '../../shared/components/ui/textarea';

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'EV Rental Company',
    email: 'admin@evrental.com',
    phone: '+1-555-0123',
    address: '123 Main St, New York, NY 10001',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en',
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    autoApproveBookings: false,
    maxBookingDays: 30,
    cancellationPolicy: 'Free cancellation up to 24 hours before pickup',
    termsOfService:
      'By using our service, you agree to our terms and conditions...',
  });

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving settings:', settings);
    // Show success message
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
          <p className='text-muted-foreground'>
            Manage system settings and preferences
          </p>
        </div>
        <Button onClick={handleSave}>
          <SaveIcon className='mr-2 h-4 w-4' />
          Save Changes
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Company Information */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Company Information</h2>
          <div className='space-y-4 rounded-lg border p-4'>
            <div className='space-y-2'>
              <Label htmlFor='companyName'>Company Name</Label>
              <Input
                id='companyName'
                value={settings.companyName}
                onChange={e =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Contact Email</Label>
              <Input
                id='email'
                type='email'
                value={settings.email}
                onChange={e =>
                  setSettings({ ...settings, email: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                value={settings.phone}
                onChange={e =>
                  setSettings({ ...settings, phone: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Textarea
                id='address'
                value={settings.address}
                onChange={e =>
                  setSettings({ ...settings, address: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>System Settings</h2>
          <div className='space-y-4 rounded-lg border p-4'>
            <div className='space-y-2'>
              <Label htmlFor='timezone'>Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={value =>
                  setSettings({ ...settings, timezone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='America/New_York'>Eastern Time</SelectItem>
                  <SelectItem value='America/Chicago'>Central Time</SelectItem>
                  <SelectItem value='America/Denver'>Mountain Time</SelectItem>
                  <SelectItem value='America/Los_Angeles'>
                    Pacific Time
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='currency'>Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={value =>
                  setSettings({ ...settings, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='USD'>USD ($)</SelectItem>
                  <SelectItem value='EUR'>EUR (€)</SelectItem>
                  <SelectItem value='GBP'>GBP (£)</SelectItem>
                  <SelectItem value='VND'>VND (₫)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='language'>Language</Label>
              <Select
                value={settings.language}
                onValueChange={value =>
                  setSettings({ ...settings, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='en'>English</SelectItem>
                  <SelectItem value='vi'>Tiếng Việt</SelectItem>
                  <SelectItem value='es'>Español</SelectItem>
                  <SelectItem value='fr'>Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='maxBookingDays'>Max Booking Days</Label>
              <Input
                id='maxBookingDays'
                type='number'
                value={settings.maxBookingDays}
                onChange={e =>
                  setSettings({
                    ...settings,
                    maxBookingDays: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Notification Settings</h2>
          <div className='space-y-4 rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailNotifications'>Email Notifications</Label>
                <p className='text-sm text-muted-foreground'>
                  Send email notifications for important events
                </p>
              </div>
              <Switch
                id='emailNotifications'
                checked={settings.emailNotifications}
                onCheckedChange={checked =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='smsNotifications'>SMS Notifications</Label>
                <p className='text-sm text-muted-foreground'>
                  Send SMS notifications for urgent updates
                </p>
              </div>
              <Switch
                id='smsNotifications'
                checked={settings.smsNotifications}
                onCheckedChange={checked =>
                  setSettings({ ...settings, smsNotifications: checked })
                }
              />
            </div>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='autoApproveBookings'>
                  Auto-approve Bookings
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Automatically approve new bookings
                </p>
              </div>
              <Switch
                id='autoApproveBookings'
                checked={settings.autoApproveBookings}
                onCheckedChange={checked =>
                  setSettings({ ...settings, autoApproveBookings: checked })
                }
              />
            </div>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='maintenanceMode'>Maintenance Mode</Label>
                <p className='text-sm text-muted-foreground'>
                  Temporarily disable the system for maintenance
                </p>
              </div>
              <Switch
                id='maintenanceMode'
                checked={settings.maintenanceMode}
                onCheckedChange={checked =>
                  setSettings({ ...settings, maintenanceMode: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Policies</h2>
          <div className='space-y-4 rounded-lg border p-4'>
            <div className='space-y-2'>
              <Label htmlFor='cancellationPolicy'>Cancellation Policy</Label>
              <Textarea
                id='cancellationPolicy'
                value={settings.cancellationPolicy}
                onChange={e =>
                  setSettings({
                    ...settings,
                    cancellationPolicy: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='termsOfService'>Terms of Service</Label>
              <Textarea
                id='termsOfService'
                value={settings.termsOfService}
                onChange={e =>
                  setSettings({ ...settings, termsOfService: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
