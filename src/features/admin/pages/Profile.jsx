import { Camera, Loader2, Mail, MapPin, Phone, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../shared/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../shared/components/ui/dialog';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Textarea } from '../../shared/components/ui/textarea';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import { toast } from '../../shared/lib/toast';

export default function Profile() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch profile data
    const fetchProfile = async () => {
        try {
            setLoading(true);
            // Determine endpoint based on user role
            const endpoint =
                user?.role === 'RENTER'
                    ? endpoints.renters.getById(user.id)
                    : endpoints.staff.getById(user.id);

            const response = await apiClient.get(endpoint);

            if (response?.success) {
                const profileData =
                    response.data?.renter || response.data?.staff || response.data;
                setProfile(profileData);
                setFormData({
                    name: profileData.name || '',
                    email: profileData.email || '',
                    phone: profileData.phone || '',
                    address: profileData.address || '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error(t('profile.fetchError') || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // Update profile
    const handleUpdateProfile = async () => {
        try {
            setSaving(true);

            // Prepare payload (exclude email as it cannot be changed)
            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
            };

            // Determine endpoint based on user role
            const endpoint =
                user?.role === 'RENTER'
                    ? endpoints.renters.update(user.id)
                    : endpoints.staff.update(user.id);

            const response = await apiClient.put(endpoint, payload);

            if (response?.success) {
                toast.success(t('profile.updateSuccess') || 'Profile updated successfully');
                setIsEditing(false);
                // Refresh profile data
                await fetchProfile();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(t('profile.updateError') || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Handle input change
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        // Reset form data to original profile data
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                address: profile.address || '',
            });
        }
        setIsEditing(false);
    };

    // Handle avatar upload
    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        try {
            setUploadingAvatar(true);

            // Create FormData
            const formData = new FormData();
            formData.append('avatar', file);

            // Determine endpoint based on user role
            const endpoint =
                user?.role === 'RENTER'
                    ? `/api/renters/${user.id}/avatar`
                    : `/api/staff/${user.id}/avatar`;

            const response = await apiClient.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response?.success) {
                toast.success('Avatar updated successfully');
                // Refresh profile data
                await fetchProfile();
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle change password
    const handleChangePassword = async () => {
        // Validate password fields
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error('Please fill in all password fields');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New password and confirm password do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        try {
            const response = await apiClient.put(endpoints.auth.changePassword(), {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });

            if (response?.success) {
                toast.success('Password changed successfully');
                setIsChangePasswordOpen(false);
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error?.message || 'Failed to change password');
        }
    };

    // Format date
    const formatDate = dateString => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Get role badge variant
    const getRoleBadgeVariant = role => {
        switch (role) {
            case 'ADMIN':
                return 'default';
            case 'STAFF':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    // Get status badge variant
    const getStatusBadgeVariant = status => {
        switch (status) {
            case 'ACTIVE':
                return 'default';
            case 'BANNED':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchProfile();
        }
    }, [user?.id]);

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <p className='text-muted-foreground'>Profile not found</p>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight'>
                        Profile
                    </h1>
                    <p className='text-muted-foreground'>
                        Manage your account information
                    </p>
                </div>
                <div className='flex gap-2'>
                    {isEditing ? (
                        <>
                            <Button
                                variant='outline'
                                onClick={handleCancelEdit}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateProfile} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant='outline' onClick={() => setIsChangePasswordOpen(true)}>
                                <Lock className='mr-2 h-4 w-4' />
                                Change Password
                            </Button>
                            <Button onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className='grid gap-6 md:grid-cols-3'>
                {/* Profile Card */}
                <Card className='md:col-span-1'>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        {/* Avatar */}
                        <div className='flex flex-col items-center space-y-4'>
                            <div className='relative'>
                                <div className='h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden'>
                                    {uploadingAvatar ? (
                                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                                    ) : profile.avatar ? (
                                        <img
                                            src={profile.avatar}
                                            alt={profile.name}
                                            className='h-32 w-32 rounded-full object-cover'
                                        />
                                    ) : (
                                        <User className='h-16 w-16 text-primary' />
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='image/*'
                                    className='hidden'
                                    onChange={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className='absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 disabled:opacity-50'
                                >
                                    <Camera className='h-4 w-4' />
                                </button>
                            </div>
                            <div className='text-center'>
                                <h3 className='text-xl font-semibold'>{profile.name}</h3>
                                <p className='text-sm text-muted-foreground'>{profile.email}</p>
                            </div>
                        </div>

                        {/* Role & Status */}
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>
                                    Role
                                </span>
                                <Badge variant={getRoleBadgeVariant(profile.role)}>
                                    {profile.role}
                                </Badge>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>
                                    Status
                                </span>
                                <Badge variant={getStatusBadgeVariant(profile.accountStatus)}>
                                    {profile.accountStatus}
                                </Badge>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>
                                    Member Since
                                </span>
                                <span className='text-sm font-medium'>
                                    {formatDate(profile.createdAt)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Details */}
                <Card className='md:col-span-2'>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Update your personal details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        {/* Name */}
                        <div className='space-y-2'>
                            <Label htmlFor='name'>
                                <User className='inline h-4 w-4 mr-2' />
                                Full Name
                            </Label>
                            {isEditing ? (
                                <Input
                                    id='name'
                                    value={formData.name}
                                    onChange={e => handleInputChange('name', e.target.value)}
                                    placeholder='Enter your full name'
                                />
                            ) : (
                                <div className='p-3 border rounded-md bg-muted/50'>
                                    {profile.name}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className='space-y-2'>
                            <Label htmlFor='email'>
                                <Mail className='inline h-4 w-4 mr-2' />
                                Email Address
                            </Label>
                            <div className='p-3 border rounded-md bg-muted/50'>
                                {profile.email}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                                Email cannot be changed
                            </p>
                        </div>

                        {/* Phone */}
                        <div className='space-y-2'>
                            <Label htmlFor='phone'>
                                <Phone className='inline h-4 w-4 mr-2' />
                                Phone Number
                            </Label>
                            {isEditing ? (
                                <Input
                                    id='phone'
                                    value={formData.phone}
                                    onChange={e => handleInputChange('phone', e.target.value)}
                                    placeholder='Enter your phone number'
                                />
                            ) : (
                                <div className='p-3 border rounded-md bg-muted/50'>
                                    {profile.phone || 'N/A'}
                                </div>
                            )}
                        </div>

                        {/* Address */}
                        <div className='space-y-2'>
                            <Label htmlFor='address'>
                                <MapPin className='inline h-4 w-4 mr-2' />
                                Address
                            </Label>
                            {isEditing ? (
                                <Textarea
                                    id='address'
                                    value={formData.address}
                                    onChange={e => handleInputChange('address', e.target.value)}
                                    placeholder='Enter your address'
                                    rows={3}
                                    className='resize-none'
                                />
                            ) : (
                                <div className='p-3 border rounded-md bg-muted/50 min-h-[80px]'>
                                    {profile.address || 'N/A'}
                                </div>
                            )}
                        </div>

                        {/* Last Updated */}
                        <div className='pt-4 border-t'>
                            <p className='text-xs text-muted-foreground'>
                                Last updated:{' '}
                                {formatDate(profile.updatedAt)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Change Password Dialog */}
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and a new password to update your account security.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='currentPassword'>Current Password</Label>
                            <div className='relative'>
                                <Input
                                    id='currentPassword'
                                    type={showPassword.current ? 'text' : 'password'}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) =>
                                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                                    }
                                    placeholder='Enter current password'
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowPassword({ ...showPassword, current: !showPassword.current })
                                    }
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                                >
                                    {showPassword.current ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                </button>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='newPassword'>New Password</Label>
                            <div className='relative'>
                                <Input
                                    id='newPassword'
                                    type={showPassword.new ? 'text' : 'password'}
                                    value={passwordForm.newPassword}
                                    onChange={(e) =>
                                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                    }
                                    placeholder='Enter new password'
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowPassword({ ...showPassword, new: !showPassword.new })
                                    }
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                                >
                                    {showPassword.new ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                </button>
                            </div>
                            <p className='text-xs text-muted-foreground'>
                                Password must be at least 6 characters
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                            <div className='relative'>
                                <Input
                                    id='confirmPassword'
                                    type={showPassword.confirm ? 'text' : 'password'}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                                    }
                                    placeholder='Confirm new password'
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                                    }
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                                >
                                    {showPassword.confirm ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setIsChangePasswordOpen(false);
                                setPasswordForm({
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: '',
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleChangePassword}>
                            Change Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
