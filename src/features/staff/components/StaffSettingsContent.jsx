import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/features/shared/components/ui/card';
import { Switch } from '@/features/shared/components/ui/switch';
import { Button } from '@/features/shared/components/ui/button';
import { Label } from '@/features/shared/components/ui/label';
import { Bell, Moon, Sun, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function StaffSettingsContent() {
  const [emailNoti, setEmailNoti] = useState(true);
  const [smsNoti, setSmsNoti] = useState(false);
  const [inAppNoti, setInAppNoti] = useState(true);

  const [darkMode, setDarkMode] = useState(false);
  const [compact, setCompact] = useState(false);

  const handleSave = () => {
    // Persist later; for now just a placeholder
    // Could integrate with NotificationPreferences or profile settings API
  };

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      {/* Notifications */}
      <Card>
        <CardHeader className='border-b bg-muted/40'>
          <div className='flex items-center gap-2'>
            <Bell className='h-5 w-5 text-primary' />
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Customize how you receive notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4 pt-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <Label>Email</Label>
              <p className='text-xs text-muted-foreground'>
                Receive important event notifications via email.
              </p>
            </div>
            <Switch checked={emailNoti} onCheckedChange={setEmailNoti} />
          </div>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <Label>SMS</Label>
              <p className='text-xs text-muted-foreground'>Receive quick updates via SMS.</p>
            </div>
            <Switch checked={smsNoti} onCheckedChange={setSmsNoti} />
          </div>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <Label>In-app Notifications</Label>
              <p className='text-xs text-muted-foreground'>Notifications displayed directly inside the app.</p>
            </div>
            <Switch checked={inAppNoti} onCheckedChange={setInAppNoti} />
          </div>
          <div className='flex justify-end pt-2'>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Display */}
      <Card>
        <CardHeader className='border-b bg-muted/40'>
          <div className='flex items-center gap-2'>
            <SlidersHorizontal className='h-5 w-5 text-primary' />
            <div>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Personalize your interface</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4 pt-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <Label>Dark Mode</Label>
              <p className='text-xs text-muted-foreground'>Reduce glare; better in low-light environments.</p>
            </div>
            <div className='flex items-center gap-2'>
              <Sun className='h-4 w-4 text-muted-foreground' />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className='h-4 w-4 text-muted-foreground' />
            </div>
          </div>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <Label>Compact Mode</Label>
              <p className='text-xs text-muted-foreground'>Tighter spacing to show more information.</p>
            </div>
            <Switch checked={compact} onCheckedChange={setCompact} />
          </div>
          <div className='flex justify-end pt-2 gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setDarkMode(false);
                setCompact(false);
              }}
            >
              Reset to Default
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
