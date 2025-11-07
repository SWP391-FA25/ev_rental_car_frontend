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
            <Edit className='h-4 w-4' />
            Edit
          </Button>
        </div>
      </div>
      <VerificationBanner />

      <div className='bg-card rounded-lg border border-border p-6 shadow-sm'>
        <div className='flex gap-8'>
          {/* Profile Section */}
          <div className='flex flex-1 flex-col items-center text-center flex-shrink-0'>
            {/* Avatar */}
            <Avatar className='h-50 w-50 mb-4'>
              <AvatarImage src={user?.avatar || ''} alt={displayName} />
              <AvatarFallback className='bg-amber-100 text-amber-800 text-4xl font-semibold'>
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <h2 className='text-xl font-semibold text-card-foreground mb-2'>
              {displayName}
            </h2>

            {/* Join Date */}
            <p className='text-sm text-muted-foreground mb-4'>
              Joined: {joinDate}
            </p>
          </div>

          {/* Personal Details */}
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-card-foreground mb-6'>
              Personal Information
            </h3>

            <div className='space-y-3'>
              {/* Full Name */}
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm font-medium text-muted-foreground w-32 flex-shrink-0'>
                  Full name
                </span>
                {isEditingProfile ? (
                  <Input
                    value={profileData.fullName}
                    onChange={e =>
                      handleProfileInputChange('fullName', e.target.value)
                    }
                    placeholder='Enter full name'
                    className='bg-gray-50 flex-1 ml-4'
                  />
                ) : (
                  <div className='flex items-center gap-2 flex-1 ml-4'>
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
                <span className='text-sm font-medium text-muted-foreground w-32 flex-shrink-0'>
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
                  <div className='flex items-center gap-2 flex-1 ml-4'>
                    <span className='text-sm font-bold text-card-foreground'>
                      {profileData.gender}
                    </span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm font-medium text-muted-foreground w-32 flex-shrink-0'>
                  Phone number
                </span>
                {isEditingProfile ? (
                  <Input
                    value={profileData.phone}
                    onChange={e =>
                      handleProfileInputChange('phone', e.target.value)
                    }
                    placeholder='Enter phone number'
                    className='bg-gray-50 flex-1 ml-4'
                  />
                ) : (
                  <div className='flex items-center gap-2 flex-1 ml-4'>
                    <span className='text-sm font-bold text-card-foreground'>
                      {profileData.phone || 'Not updated'}
                    </span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm font-medium text-muted-foreground w-32 flex-shrink-0'>
                  Address
                </span>
                {isEditingProfile ? (
                  <Input
                    value={profileData.address}
                    onChange={e =>
                      handleProfileInputChange('address', e.target.value)
                    }
                    placeholder='Enter address'
                    className='bg-gray-50 flex-1 ml-4'
                  />
                ) : (
                  <div className='flex items-center gap-2 flex-1 ml-4'>
                    <span className='text-sm font-bold text-card-foreground'>
                      {profileData.address || 'Not updated'}
                    </span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm font-medium text-muted-foreground w-32 flex-shrink-0'>
                  Email
                </span>
                <div className='flex items-center gap-2 flex-1 ml-4'>
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
              <XCircle className='h-3 w-3' />
              Chưa xác thực
            </Badge>
          </div>
        </div>

        <div className='bg-card rounded-lg border border-border p-6 shadow-sm'>
          <div className='flex gap-8'>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-card-foreground mb-4'>
                Hình ảnh
              </h3>

              <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors'>
                {uploadedImage || licenseDoc ? (
                  <div className='space-y-4'>
                    <img
                      src={
                        uploadedImage ||
                        licenseDoc?.thumbnailUrl ||
                        licenseDoc?.fileUrl
                      }
                      alt='License preview'
                      className='max-w-full h-48 object-contain mx-auto rounded'
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
                    <Upload className='h-12 w-12 text-green-600 mx-auto' />
                    <div>
                      <p className='text-muted-foreground mb-2'>
                        Tải lên hình ảnh giấy phép lái xe
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        JPG, PNG hoặc PDF (tối đa 10MB)
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
                        Chọn tệp
                      </label>
                    </Button>
                    {uploadError && (
                      <p className='text-sm text-red-600 mt-2'>{uploadError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-card-foreground mb-4'>
                Thông tin chung
              </h3>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='license-number'
                    className='text-sm font-medium text-muted-foreground'
                  >
                    Số GPLX (không bắt buộc)
                  </Label>
                  <Input
                    id='license-number'
                    placeholder='Nhập số GPLX (nếu có)'
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
                    Lưu thông tin
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
          <Button variant='link' className='text-primary p-0 h-auto text-sm'>
            <HelpCircle className='h-4 w-4 mr-1' />
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

        <div className='bg-card rounded-lg border border-border p-6 shadow-sm'>
          <div className='flex gap-8'>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-card-foreground mb-4'>
                Hình ảnh CCCD
              </h3>

              <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors'>
                {cccdImage || idCardDoc ? (
                  <div className='space-y-4'>
                    <img
                      src={
                        cccdImage ||
                        idCardDoc?.thumbnailUrl ||
                        idCardDoc?.fileUrl
                      }
                      alt='CCCD preview'
                      className='max-w-full h-48 object-contain mx-auto rounded'
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
                    <Upload className='h-12 w-12 text-green-600 mx-auto' />
                    <div>
                      <p className='text-muted-foreground mb-2'>
                        Tải lên hình ảnh CCCD (mặt trước/mặt sau)
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        JPG, PNG hoặc PDF (tối đa 10MB)
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
                        Chọn tệp
                      </label>
                    </Button>
                    {uploadError && (
                      <p className='text-sm text-red-600 mt-2'>{uploadError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-card-foreground mb-4'>
                Thông tin CCCD
              </h3>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='cccd-number'
                    className='text-sm font-medium text-muted-foreground'
                  >
                    Số CCCD
                  </Label>
                  <Input
                    id='cccd-number'
                    placeholder='Nhập số CCCD'
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
                    {uploading ? 'Đang tải...' : 'Tải lên CCCD'}
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
