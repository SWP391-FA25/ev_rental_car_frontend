import { useAuth } from '@/app/providers/AuthProvider';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/features/shared/components/ui/avatar';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { apiClient } from '@/features/shared/lib/apiClient';
import { endpoints } from '@/features/shared/lib/endpoints';
import { toast } from '@/features/shared/lib/toast';
import { Briefcase, Edit, Star, Phone, MapPin, User2 } from 'lucide-react';
import { useState } from 'react';

export default function StaffProfileContent() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const displayName = user?.name || user?.email || 'Staff';
  const initials = (() => {
    const name = displayName || '';
    const parts = name.trim().split(' ').filter(Boolean);
    const first = parts[0]?.[0] || 'S';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  })();

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Staff information not found');
      return;
    }
    if (form.phone && !/^0\d{9}$/.test(form.phone)) {
      toast.error('Phone number must start with 0 and be exactly 10 digits');
      return;
    }
    try {
      setIsSaving(true);
      const res = await apiClient.put(endpoints.staff.update(user.id), {
        name: form.name,
        phone: form.phone,
        address: form.address,
      });
      if (res.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.message || 'An error occurred while updating'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      <Card>
        <CardHeader className='border-b bg-muted/40'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Avatar className='h-12 w-12 ring-2 ring-primary/20'>
                <AvatarImage src={user?.avatar || ''} alt={displayName} />
                <AvatarFallback className='bg-amber-100 text-amber-800 font-semibold'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className='text-base font-semibold'>{displayName}</div>
                <div className='text-xs text-muted-foreground flex items-center gap-1'>
                  <Briefcase className='h-3.5 w-3.5 text-primary' />
                  Staff
                </div>
              </div>
            </div>
            <Button
              variant='outline'
              className='gap-2'
              onClick={() => setIsEditing(v => !v)}
              disabled={isSaving}
            >
              <Edit className='h-4 w-4' />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Left: Identity */}
            <div className='md:col-span-1'>
              <div className='space-y-3 rounded-lg border p-4'>
                <h3 className='text-sm font-semibold'>Contact Information</h3>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <User2 className='h-4 w-4' />
                  <span className='text-sm'>{form.name || displayName}</span>
                </div>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Phone className='h-4 w-4' />
                  <span className='text-sm'>
                    {form.phone || 'Not updated'}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <MapPin className='h-4 w-4' />
                  <span className='text-sm'>
                    {form.address || 'Not updated'}
                  </span>
                </div>
                <Badge variant='secondary' className='mt-2 w-fit gap-1'>
                  <Star className='h-3 w-3' />
                  Staff
                </Badge>
              </div>
            </div>

            {/* Right: Editable form */}
            <div className='md:col-span-2'>
              <div className='space-y-5'>
                <div className='space-y-2'>
                  <Label>Full Name</Label>
                  {isEditing ? (
                    <Input
                      placeholder='Enter your full name'
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                    />
                  ) : (
                    <div className='px-3 py-2 rounded-md border bg-muted/30 font-semibold'>
                      {form.name || displayName}
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label>Phone Number</Label>
                  {isEditing ? (
                    <Input
                      placeholder='0xxxxxxxxx'
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                    />
                  ) : (
                    <div className='px-3 py-2 rounded-md border bg-muted/30 font-semibold'>
                      {form.phone || 'Not updated'}
                    </div>
                  )}
                  <p className='text-xs text-muted-foreground'>
                    Format: starts with 0 and has 10 digits.
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label>Address</Label>
                  {isEditing ? (
                    <Input
                      placeholder='House number, street, ward/commune, district, city'
                      value={form.address}
                      onChange={e => handleChange('address', e.target.value)}
                    />
                  ) : (
                    <div className='px-3 py-2 rounded-md border bg-muted/30 font-semibold'>
                      {form.address || 'Not updated'}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className='pt-2 flex gap-2 justify-end'>
                    <Button onClick={handleSave} disabled={isSaving}>
                      Save Changes
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
