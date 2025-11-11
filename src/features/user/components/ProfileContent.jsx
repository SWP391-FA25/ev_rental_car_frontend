import { Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../shared/components/ui/avatar';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import VerificationBanner from '../../shared/components/VerificationBanner';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import { toast } from '../../shared/lib/toast';

export default function ProfileContent({ user }) {
  const navigate = useNavigate();
  const { verifyUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    gender: user?.gender || 'Nam',
    birthDate: '',
    facebook: '',
    google: user?.name || '',
  });

  const displayName = user?.name || user?.email || 'User';
  const initials = (() => {
    const name = displayName || '';
    const parts = name.trim().split(' ').filter(Boolean);
    const first = parts[0]?.[0] || 'U';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  })();

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US')
    : '09/28/2025';

  // Sync profileData with user prop when it changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        gender: user.gender || prev.gender,
        google: user.name || prev.google,
      }));
    }
  }, [user]);

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancelEdit = () => {
    // Reset profileData to original user values
    if (user) {
      setProfileData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || 'Nam',
        birthDate: '',
        facebook: '',
        google: user.name || '',
      });
    }
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error('User information not found');
      return;
    }

    // Validate phone number format (must start with 0 and have exactly 10 digits)
    if (profileData.phone && !/^0\d{9}$/.test(profileData.phone)) {
      toast.error('Phone number must start with 0 and be exactly 10 digits');
      return;
    }

    try {
      setIsSaving(true);

      // Prepare update data (only send fields that can be updated)
      const updateData = {
        name: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        // Note: email cannot be updated via this endpoint
      };

      const response = await apiClient.put(
        endpoints.renters.update(user.id),
        updateData
      );

      if (response.success) {
        toast.success('Profile updated successfully');
        setIsEditingProfile(false);

        // Update local profileData with response data
        if (response.data?.renter) {
          setProfileData(prev => ({
            ...prev,
            fullName: response.data.renter.name || prev.fullName,
            phone: response.data.renter.phone || prev.phone,
            address: response.data.renter.address || prev.address,
          }));
        }

        // Refresh user data from API
        await verifyUser();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(
        error.message || 'An error occurred while updating information'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='max-w-6xl mx-auto'>
      {/* Verification Banner */}

      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold text-foreground'>
            Account Information
          </h1>
          <Button
            variant='outline'
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className='flex items-center gap-2'
            disabled={isSaving}
          >
            <Edit className='w-4 h-4' />
            Edit
          </Button>
        </div>
      </div>
      <VerificationBanner />

      <div className='p-6 border rounded-lg shadow-sm bg-card border-border'>
        <div className='flex gap-8'>
          {/* Profile Section */}
          <div className='flex flex-col items-center flex-1 flex-shrink-0 text-center'>
            {/* Avatar */}
            <Avatar className='mb-4 h-50 w-50'>
              <AvatarImage src={user?.avatar || ''} alt={displayName} />
              <AvatarFallback className='text-4xl font-semibold bg-amber-100 text-amber-800'>
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <h2 className='mb-2 text-xl font-semibold text-card-foreground'>
              {displayName}
            </h2>

            {/* Join Date */}
            <p className='mb-4 text-sm text-muted-foreground'>
              Joined: {joinDate}
            </p>
          </div>

          {/* Personal Details */}
          <div className='flex-1'>
            <h3 className='mb-6 text-lg font-semibold text-card-foreground'>
              Personal Information
            </h3>

            <div className='space-y-3'>
              {/* Full Name */}
              <div className='flex items-center justify-between py-2'>
                <span className='flex-shrink-0 w-32 text-sm font-medium text-muted-foreground'>
                  Full name
                </span>
                {isEditingProfile ? (
                  <Input
                    value={profileData.fullName}
                    onChange={e =>
                      handleProfileInputChange('fullName', e.target.value)
                    }
                    placeholder='Enter full name'
                    className='flex-1 ml-4 bg-gray-50'
                  />
                ) : (
                  <div className='flex items-center flex-1 gap-2 ml-4'>
                    <span className='text-sm font-bold text-card-foreground'>
                      {profileData.fullName || displayName}
                    </span>
                  </div>
                )}
              </div>

              {/* Date of Birth - removed from payload needs; keep UI if desired */}
              <div className='hidden' />

              {/* Gender */}
              <div className='flex items-center justify-between py-2'>
                <span className='flex-shrink-0 w-32 text-sm font-medium text-muted-foreground'>
                  Gender
                </span>
                {isEditingProfile ? (
                  <Select
                    value={profileData.gender}
                    onValueChange={value =>
                      handleProfileInputChange('gender', value)
                    }
                  >
                    <SelectTrigger className='flex-1 ml-4'>
                      <SelectValue placeholder='Select gender' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Nam'>Male</SelectItem>
                      <SelectItem value='Nữ'>Female</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className='flex items-center flex-1 gap-2 ml-4'>
                    <span className='text-sm font-bold text-card-foreground'>
                      {profileData.gender}
                    </span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className='flex items-center justify-between py-2'>
                <span className='flex-shrink-0 w-32 text-sm font-medium text-muted-foreground'>
                  Phone number
                </span>
                {isEditingProfile ? (
                  <Input
                    value={profileData.phone}
                    onChange={e =>
                      handleProfileInputChange('phone', e.target.value)
                    }
                    placeholder='Enter phone number'
                    className='flex-1 ml-4 bg-gray-50'
                  />
                ) : (
                  <div className='flex items-center flex-1 gap-2 ml-4'>
                    <span className='text-sm font-bold text-card-foreground'>
                      {profileData.phone || 'Not updated'}
                    </span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className='flex items-center justify-between py-2'>
                <span className='flex-shrink-0 w-32 text-sm font-medium text-muted-foreground'>
                  Address
                </span>
                {isEditingProfile ? (
                  <Input
                    value={profileData.address}
                    onChange={e =>
                      handleProfileInputChange('address', e.target.value)
                    }
                    placeholder='Enter address'
                    className='flex-1 ml-4 bg-gray-50'
                  />
                ) : (
                  <div className='flex items-center flex-1 gap-2 ml-4'>
                    <span className='text-sm font-bold text-card-foreground'>
                      {profileData.address || 'Not updated'}
                    </span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className='flex items-center justify-between py-2'>
                <span className='flex-shrink-0 w-32 text-sm font-medium text-muted-foreground'>
                  Email
                </span>
                <div className='flex items-center flex-1 gap-2 ml-4'>
                  <span className='text-sm font-bold text-card-foreground'>
                    {profileData.email}
                  </span>
                  <div className='flex items-center gap-2'>
                    {user?.verifyStatus === 'VERIFIED' ? (
                      <Badge
                        variant='outline'
                        className='text-green-600 border-green-200 bg-green-50'
                      >
                        Verified
                      </Badge>
                    ) : (
                      <>
                        <Badge
                          variant='outline'
                          className='text-red-600 border-red-200 bg-red-50'
                        >
                          Not verified
                        </Badge>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => navigate('/verify-email')}
                        >
                          Verify Email
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons for Profile */}
            {isEditingProfile && (
              <div className='flex gap-3 pt-6 mt-6 border-t border-gray-200'>
                <Button
                  onClick={handleSaveProfile}
                  className='flex-1'
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save information'}
                </Button>
                <Button
                  variant='outline'
                  onClick={handleCancelEdit}
                  className='flex-1'
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <div className='mt-8'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold text-foreground'>
              Giấy phép lái xe
            </h2>
            <Badge variant='destructive' className='flex items-center gap-1'>
              <XCircle className='w-3 h-3' />
              Chưa xác thực
            </Badge>
          </div>
        </div>

        <div className='p-6 border rounded-lg shadow-sm bg-card border-border'>
          <div className='flex gap-8'>
            <div className='flex-1'>
              <h3 className='mb-4 text-lg font-semibold text-card-foreground'>
                Hình ảnh
              </h3>

              <div className='p-8 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400'>
                {uploadedImage || licenseDoc ? (
                  <div className='space-y-4'>
                    <img
                      src={
                        uploadedImage ||
                        licenseDoc?.thumbnailUrl ||
                        licenseDoc?.fileUrl
                      }
                      alt='License preview'
                      className='object-contain h-48 max-w-full mx-auto rounded'
                    />
                    <Button
                      variant='outline'
                      onClick={handleDeleteLicense}
                      className='text-red-600 hover:text-red-700'
                    >
                      Xóa ảnh
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <Upload className='w-12 h-12 mx-auto text-green-600' />
                    <div>
                      <p className='mb-2 text-muted-foreground'>
                        Upload driver's license image
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        JPG, PNG or PDF (max 10MB)
                      </p>
                    </div>
                    <input
                      type='file'
                      accept='image/*,.pdf'
                      onChange={handleImageUpload}
                      className='hidden'
                      id='license-upload'
                    />
                    <Button asChild>
                      <label
                        htmlFor='license-upload'
                        className='cursor-pointer'
                      >
                        Choose File
                      </label>
                    </Button>
                    {uploadError && (
                      <p className='mt-2 text-sm text-red-600'>{uploadError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className='flex-1'>
              <h3 className='mb-4 text-lg font-semibold text-card-foreground'>
                General Information
              </h3>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='license-number'
                    className='text-sm font-medium text-muted-foreground'
                  >
                    License Number (optional)
                  </Label>
                  <Input
                    id='license-number'
                    placeholder='Enter license number (if available)'
                    value={licenseData.licenseNumber}
                    onChange={e =>
                      handleLicenseInputChange('licenseNumber', e.target.value)
                    }
                    disabled={false}
                    className='bg-gray-50'
                  />
                </div>

                <div className='flex gap-3 pt-4'>
                  <Button onClick={handleSaveLicense} className='flex-1'>
                    Save Information
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setUploadedImage(null);
                      setIsEditingLicense(false);
                      setUploadError('');
                    }}
                    className='flex-1'
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <Button variant='link' className='h-auto p-0 text-sm text-primary'>
            <HelpCircle className='w-4 h-4 mr-1' />
            Vì sao tôi phải xác thực GPLX?
          </Button>
        </div>
      </div> */}

      {/* ID Card (CCCD) Upload Section */}
      {/* <div className='mt-8'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold text-foreground'>
              Căn cước công dân
            </h2>
          </div>
        </div>

        <div className='p-6 border rounded-lg shadow-sm bg-card border-border'>
          <div className='flex gap-8'>
            <div className='flex-1'>
              <h3 className='mb-4 text-lg font-semibold text-card-foreground'>
                Hình ảnh CCCD
              </h3>

              <div className='p-8 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400'>
                {cccdImage || idCardDoc ? (
                  <div className='space-y-4'>
                    <img
                      src={
                        cccdImage ||
                        idCardDoc?.thumbnailUrl ||
                        idCardDoc?.fileUrl
                      }
                      alt='CCCD preview'
                      className='object-contain h-48 max-w-full mx-auto rounded'
                    />
                    <Button
                      variant='outline'
                      onClick={handleDeleteCccd}
                      className='text-red-600 hover:text-red-700'
                    >
                      Xóa ảnh
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <Upload className='w-12 h-12 mx-auto text-green-600' />
                    <div>
                      <p className='mb-2 text-muted-foreground'>
                        Upload ID card image (front/back)
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        JPG, PNG or PDF (max 10MB)
                      </p>
                    </div>
                    <input
                      type='file'
                      accept='image/*,.pdf'
                      onChange={handleCccdUpload}
                      className='hidden'
                      id='cccd-upload'
                    />
                    <Button asChild>
                      <label htmlFor='cccd-upload' className='cursor-pointer'>
                        Choose File
                      </label>
                    </Button>
                    {uploadError && (
                      <p className='mt-2 text-sm text-red-600'>{uploadError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className='flex-1'>
              <h3 className='mb-4 text-lg font-semibold text-card-foreground'>
                ID Card Information
              </h3>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='cccd-number'
                    className='text-sm font-medium text-muted-foreground'
                  >
                    ID Card Number
                  </Label>
                  <Input
                    id='cccd-number'
                    placeholder='Enter ID card number'
                    className='bg-gray-50'
                  />
                </div>

                <div className='flex gap-3 pt-4'>
                  <Button
                    onClick={async () => {
                      const numberInput =
                        document.getElementById('cccd-number');
                      const documentNumber = numberInput?.value || undefined;
                      await uploadDocument({
                        file: cccdFile,
                        documentType: 'ID_CARD',
                        documentNumber,
                        expiryDate: undefined,
                      });
                    }}
                    disabled={uploading}
                    className='flex-1'
                  >
                    {uploading ? 'Uploading...' : 'Upload ID Card'}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setCccdImage(null);
                      setUploadError('');
                    }}
                    className='flex-1'
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
