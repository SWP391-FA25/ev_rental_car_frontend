import {
  CalendarIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Separator } from '../../../shared/components/ui/separator';
import { Textarea } from '../../../shared/components/ui/textarea';
import { apiClient } from '../../../shared/lib/apiClient';
import { endpoints } from '../../../shared/lib/endpoints';

export default function UserDetails({
  isOpen,
  onClose,
  userId,
  onUserUpdated,
}) {
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      apiClient.get(endpoints.renters.getById(userId)).then(res => {
        const u = res.data?.renter || null;
        setUser(u);
        if (u) {
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            address: u.address || '',
          });
        }
      });
    }
  }, [isOpen, userId]);

  if (!isOpen || !user) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await apiClient.put(endpoints.renters.update(userId), form);
      setEditMode(false);
      if (onSaved) {
        const updatedUser = res.data?.renter
          ? { id: userId, ...res.data.renter }
          : { id: userId, ...form };
        onSaved(updatedUser);
      }
      apiClient.get(endpoints.renters.getById(userId)).then(res => {
        const u = res.data?.renter || null;
        setUser(u);
        if (u) {
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            address: u.address || '',
          });
        }
      });
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {t('userDetails.title')}
          </DialogTitle>
          <DialogDescription>
            {t('userDetails.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <span className="text-xl font-normal">{editMode ? form.name : user.name}</span>
            <p className="text-muted-foreground">{editMode ? form.email : user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default">{user.accountStatus}</Badge>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t('userDetails.labels.name')}</Label>
              <Input
                name="name"
                value={editMode ? form.name : user.name}
                onChange={editMode ? handleChange : undefined}
                readOnly={!editMode}
                icon={<UserIcon />}
              />
            </div>
            <div>
              <Label>{t('userDetails.labels.email')}</Label>
              <Input
                name="email"
                value={editMode ? form.email : user.email}
                onChange={editMode ? handleChange : undefined}
                readOnly={!editMode}
                icon={<MailIcon />}
              />
              <p className="text-xs text-muted-foreground">
                {t('userDetails.notes.emailCannotChange')}
              </p>
            </div>
            <div>
              <Label>{t('userDetails.labels.phone')}</Label>
              <Input
                name="phone"
                value={editMode ? form.phone : user.phone}
                onChange={editMode ? handleChange : undefined}
                readOnly={!editMode}
                icon={<PhoneIcon />}
              />
            </div>
            <div>
              <Label>{t('userDetails.labels.status')}</Label>
              <Badge variant="default">{user.accountStatus}</Badge>
            </div>
            <div className="md:col-span-2">
              <Label>{t('userDetails.labels.address')}</Label>
              <Input
                name="address"
                value={editMode ? form.address : user.address}
                onChange={editMode ? handleChange : undefined}
                readOnly={!editMode}
                icon={<MapPinIcon />}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                {t('userForm.buttons.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? t('userDetails.actions.saving') : t('userDetails.actions.save')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                {t('userDetails.actions.close')}
              </Button>
              <Button onClick={() => setEditMode(true)}>
                {t('userDetails.actions.edit')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
