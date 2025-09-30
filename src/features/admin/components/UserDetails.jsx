import { useEffect, useState } from 'react';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../shared/components/ui/dialog';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { MailIcon, PhoneIcon, MapPinIcon, UserIcon } from 'lucide-react';
export default function UserDetails({ isOpen, onClose, userId, onSaved }) {
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
      // cập nhật dữ liệu ngay trên Dashboard
      if (onSaved) {
        // Nếu API trả về dữ liệu mới, dùng nó, nếu không thì dùng form
        const updatedUser = res.data?.renter ? {
          id: userId,
          ...res.data.renter
        } : { id: userId, ...form };
        onSaved(updatedUser);
      }
      // reload user info cho modal
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
            User Details
          </DialogTitle>
          <DialogDescription>
            View and manage user information
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
              <Label>Name</Label>
              <Input name="name" value={editMode ? form.name : user.name} onChange={editMode ? handleChange : undefined} readOnly={!editMode} icon={<UserIcon />} />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" value={editMode ? form.email : user.email} onChange={editMode ? handleChange : undefined} readOnly={!editMode} icon={<MailIcon />} />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" value={editMode ? form.phone : user.phone} onChange={editMode ? handleChange : undefined} readOnly={!editMode} icon={<PhoneIcon />} />
            </div>
            <div>
              <Label>Account Status</Label>
              <Badge variant="default">{user.accountStatus}</Badge>
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input name="address" value={editMode ? form.address : user.address} onChange={editMode ? handleChange : undefined} readOnly={!editMode} icon={<MapPinIcon />} />
            </div>
          </div>
        </div>

        <DialogFooter>
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)} disabled={loading}>Cancel</Button>
              <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={() => setEditMode(true)}>Edit</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
