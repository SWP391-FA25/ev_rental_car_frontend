import { UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../shared/components/ui/card';
import { toast } from '../../../shared/lib/toast';
import documentService from '../../../shared/services/documentService';

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

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  // Fetch verified documents for the selected user to preview images
  useEffect(() => {
    async function fetchDocs() {
      if (!isOpen || !userId) return;
      try {
        // Prefer server-side filtering by user and status to avoid pagination issues
        const res = await documentService.getAllDocuments({
          userId,
          status: 'APPROVED',
          limit: 100, // be generous to include all approved docs
        });
        const docs = res?.data?.documents || res?.data?.data?.documents || [];
        const forUser = docs.filter(d => (d?.user?.id ?? d?.userId) === userId);
        const identityDoc = forUser.find(
          d => d?.documentType === 'ID_CARD' || d?.documentType === 'PASSPORT'
        );
        const licenseDoc = forUser.find(
          d => d?.documentType === 'DRIVERS_LICENSE'
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
      <DialogContent className='w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserIcon className='h-5 w-5' />
            {t('userDetails.title')}
          </DialogTitle>
          <DialogDescription>{t('userDetails.description')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>
              {t('staffDetails.basicInfo')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>{t('userDetails.labels.name')}</Label>
                {editMode ? (
                  <Input
                    name='name'
                    value={form.name}
                    onChange={handleChange}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {user.name}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>{t('userDetails.labels.email')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {user.email}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {t('userDetails.notes.emailCannotChange')}
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>{t('userDetails.labels.phone')}</Label>
                {editMode ? (
                  <Input
                    name='phone'
                    value={form.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                    {user.phone || 'N/A'}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='role'>{t('userDetails.labels.role')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  <Badge variant='default'>{user.role}</Badge>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>{t('userDetails.labels.address')}</Label>
              {editMode ? (
                <Textarea
                  name='address'
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className='w-full resize-none'
                />
              ) : (
                <div className='p-2 border rounded-md bg-muted/50 min-h-[80px] flex items-start'>
                  {user.address || 'N/A'}
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>
              {t('staffDetails.accountStatus')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='status'>{t('userDetails.labels.status')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  <Badge variant='default'>{user.accountStatus}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>
              {t('staffDetails.timeline')}
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('staffDetails.createdAt')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(user.createdAt)}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('staffDetails.updatedAt')}</Label>
                <div className='p-2 border rounded-md bg-muted/50 min-h-[40px] flex items-center'>
                  {formatDate(user.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status as two cards with document preview when verified */}
          {(() => {
            // Derive badge status from verifiedDocs first; fallback to props/flags
            const identity =
              (verifiedDocs.identity ? 'Verified' : null) ??
              verificationStatus?.identity ??
              (user?.identityVerified ? 'Verified' : 'Pending');
            const license =
              (verifiedDocs.license ? 'Verified' : null) ??
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
