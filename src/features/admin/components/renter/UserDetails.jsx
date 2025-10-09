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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../shared/components/ui/card';
import documentService from '../../../shared/services/documentService';
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
  verificationStatus,
}) {
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [verifiedDocs, setVerifiedDocs] = useState({
    identity: null,
    license: null,
  });
  // State-driven save request to refactor API call via useEffect
  const [savePayload, setSavePayload] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Fetch verified documents for this user to preview images
  useEffect(() => {
    async function fetchDocs() {
      if (!isOpen || !userId) return;
      try {
        const res = await documentService.getAllDocuments();
        const docs = res?.data?.documents || res?.data?.data?.documents || [];
        const forUser = docs.filter(d => (d?.user?.id ?? d?.userId) === userId);
        const identityDoc = forUser.find(
          d =>
            d?.status === 'APPROVED' &&
            (d?.documentType === 'ID_CARD' || d?.documentType === 'PASSPORT')
        );
        const licenseDoc = forUser.find(
          d => d?.status === 'APPROVED' && d?.documentType === 'DRIVERS_LICENSE'
        );
        setVerifiedDocs({
          identity: identityDoc || null,
          license: licenseDoc || null,
        });
      } catch (e) {
        setVerifiedDocs({ identity: null, license: null });
      }
    }
    fetchDocs();
  }, [isOpen, userId]);

  // Effect: perform the update when savePayload is set
  useEffect(() => {
    const doSave = async () => {
      if (!isSaving || !savePayload || !userId) return;
      try {
        // Attach Authorization header from stored token if available
        const rawUser =
          localStorage.getItem('user') || sessionStorage.getItem('user');
        let headers = undefined;
        if (rawUser) {
          try {
            const parsed = JSON.parse(rawUser);
            const token = parsed?.token || parsed?.accessToken;
            if (token) headers = { Authorization: `Bearer ${token}` };
          } catch (_) {
            // ignore JSON parsing errors
          }
        }

        const res = await apiClient.put(
          endpoints.renters.update(userId),
          savePayload,
          headers ? { headers } : undefined
        );

        setEditMode(false);

        // Notify parent of update if provided
        const updatedUser = res.data?.renter
          ? { id: userId, ...res.data.renter }
          : { id: userId, ...savePayload };
        onUserUpdated?.(updatedUser);

        // Refresh local user state
        const refreshed = await apiClient.get(
          endpoints.renters.getById(userId)
        );
        const u = refreshed.data?.renter || null;
        setUser(u);
        if (u) {
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            address: u.address || '',
          });
        }

        // Feedback
        toast.success(t('userDetails.actions.savedSuccessfully') || 'Saved');
      } catch (err) {
        toast.error(
          err?.message || t('userDetails.actions.saveFailed') || 'Save failed'
        );
      } finally {
        setLoading(false);
        setIsSaving(false);
        setSavePayload(null);
      }
    };

    doSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaving, savePayload, userId]);

  if (!isOpen || !user) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Only send editable fields to avoid backend rejection (email is immutable)
    const payload = {
      name: form.name?.trim() || '',
      phone: form.phone?.trim() || '',
      address: form.address?.trim() || '',
    };
    setLoading(true);
    setIsSaving(true);
    setSavePayload(payload);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserIcon className='h-5 w-5' />
            {t('userDetails.title')}
          </DialogTitle>
          <DialogDescription>{t('userDetails.description')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Header */}
          <div>
            <span className='text-xl font-normal'>
              {editMode ? form.name : user.name}
            </span>
            <p className='text-muted-foreground'>
              {editMode ? form.email : user.email}
            </p>
            <div className='flex items-center gap-2 mt-2'>
              <Badge variant='default'>{user.accountStatus}</Badge>
              <Badge variant='outline'>{user.role}</Badge>
            </div>
          </div>

          {/* Info Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label>{t('userDetails.labels.name')}</Label>
              <Input
                name='name'
                value={editMode ? form.name : user.name}
                onChange={editMode ? handleChange : undefined}
                readOnly={!editMode}
                icon={<UserIcon />}
              />
            </div>
            <div>
              <Label>{t('userDetails.labels.email')}</Label>
              <Input
                name='email'
                value={editMode ? form.email : user.email}
                onChange={editMode ? handleChange : undefined}
                readOnly={!editMode}
                icon={<MailIcon />}
              />
              <p className='text-xs text-muted-foreground'>
                {t('userDetails.notes.emailCannotChange')}
              </p>
            </div>
            <div>
              <Label>{t('userDetails.labels.phone')}</Label>
              <Input
                name='phone'
                value={editMode ? form.phone : user.phone}
                onChange={editMode ? handleChange : undefined}
                readOnly={!editMode}
                icon={<PhoneIcon />}
              />
            </div>
            <div>
              <Label>{t('userDetails.labels.status')}</Label>
              <Badge variant='default'>{user.accountStatus}</Badge>
            </div>
            <div className='md:col-span-2'>
              <Label>{t('userDetails.labels.address')}</Label>
              <Input
                name='address'
                value={editMode ? form.address : user.address}
                onChange={editMode ? handleChange : undefined}
                readOnly={!editMode}
                icon={<MapPinIcon />}
              />
            </div>
          </div>

          {/* Verification Status as two cards with document preview when verified */}
          {(() => {
            const identity =
              verificationStatus?.identity ??
              (user?.identityVerified ? 'Verified' : 'Pending');
            const license =
              verificationStatus?.license ??
              (user?.licenseVerified ? 'Verified' : 'Pending');

            const badgeClass = s =>
              s === 'Verified'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : s === 'Failed'
                ? 'bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-amber-100 text-amber-800 border-amber-200';

            const getImageUrl = doc =>
              doc?.thumbnailUrl || doc?.fileUrl || doc?.url || null;

            return (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* ID Card */}
                <Card>
                  <CardHeader className='border-b'>
                    <div className='flex items-center justify-between w-full'>
                      <CardTitle className='text-sm font-medium'>ID:</CardTitle>
                      <Badge
                        variant='outline'
                        className={`px-2.5 py-1 text-xs font-semibold ${badgeClass(
                          identity
                        )}`}
                      >
                        {identity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {identity === 'Verified' &&
                    getImageUrl(verifiedDocs.identity) ? (
                      <img
                        src={getImageUrl(verifiedDocs.identity)}
                        alt='ID Document'
                        className='rounded-md border w-full max-h-48 object-contain'
                      />
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        Chưa có tài liệu đã xác minh
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* License Card */}
                <Card>
                  <CardHeader className='border-b'>
                    <div className='flex items-center justify-between w-full'>
                      <CardTitle className='text-sm font-medium'>
                        License:
                      </CardTitle>
                      <Badge
                        variant='outline'
                        className={`px-2.5 py-1 text-xs font-semibold ${badgeClass(
                          license
                        )}`}
                      >
                        {license}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {license === 'Verified' &&
                    getImageUrl(verifiedDocs.license) ? (
                      <img
                        src={getImageUrl(verifiedDocs.license)}
                        alt='License Document'
                        className='rounded-md border w-full max-h-48 object-contain'
                      />
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        Chưa có tài liệu đã xác minh
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </div>

        <DialogFooter>
          {editMode ? (
            <>
              <Button
                variant='outline'
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                {t('userForm.buttons.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading
                  ? t('userDetails.actions.saving')
                  : t('userDetails.actions.save')}
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' onClick={onClose}>
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
