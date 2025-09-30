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

export default function UserDetails({ isOpen, onClose, userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      apiClient.get(endpoints.renters.getById(userId)).then(res => {
        setUser(res.data?.renter || null);
      });
    }
  }, [isOpen, userId]);

  if (!isOpen || !user) return null;

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
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default">{user.accountStatus}</Badge>
              <Badge variant="outline">{user.role}</Badge>

            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={user.name || ''} readOnly icon={<UserIcon />} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user.email || ''} readOnly icon={<MailIcon />} />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={user.phone || ''} readOnly icon={<PhoneIcon />} />
            </div>
            <div>
              <Label>Account Status</Label>
              <Badge variant="default">{user.accountStatus}</Badge>
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input value={user.address || ''} readOnly icon={<MapPinIcon />} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
