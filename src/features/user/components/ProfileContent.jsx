import { Briefcase, Edit, Star } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../shared/components/ui/avatar';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import VerificationBanner from '../../shared/components/VerificationBanner';

export default function ProfileContent({ user }) {
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    gender: 'Nam',
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
    ? new Date(user.createdAt).toLocaleDateString('vi-VN')
    : '28/09/2025';

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    // Logic to save profile data
  };

  return (
    <div className='max-w-6xl mx-auto'>
      {/* Verification Banner */}

      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold text-foreground'>
            Thông tin tài khoản
          </h1>
          <Button
            variant='outline'
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className='flex items-center gap-2'
          >
            <Edit className='h-4 w-4' />
            Chỉnh sửa
          </Button>
        </div>

        {/* Trip Counter */}
        <div className='flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border shadow-sm'>
          <Briefcase className='h-5 w-5 text-primary' />
          <span className='text-sm font-medium text-card-foreground'>
            0 chuyến
          </span>
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
              Tham gia: {joinDate}
            </p>

            {/* Points Badge */}
            <Badge className='flex items-center gap-1'>
              <Star className='h-3 w-3' />0 điểm
            </Badge>
          </div>

          {/* Personal Details */}
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-card-foreground mb-6'>
              Thông tin cá nhân
            </h3>

            <div className='space-y-3'>
              {/* Full Name */}
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm font-medium text-muted-foreground w-32 flex-shrink-0'>
                  Họ và tên
                </span>
                {isEditingProfile ? (
                  <Input
                    value={profileData.fullName}
                    onChange={e =>
                      handleProfileInputChange('fullName', e.target.value)
                    }
                    placeholder='Nhập họ và tên'
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
                  Giới tính
                </span>
                {isEditingProfile ? (
                  <select
                    value={profileData.gender}
                    onChange={e =>
                      handleProfileInputChange('gender', e.target.value)
                    }
                    className='flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm'
                  >
                    <option value='Nam'>Nam</option>
                    <option value='Nữ'>Nữ</option>
                  </select>
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
                  Số điện thoại
                </span>
                {isEditingProfile ? (
                  <Input
                    value={profileData.phone}
                    onChange={e =>
                      handleProfileInputChange('phone', e.target.value)
                    }
                    placeholder='Nhập số điện thoại'
                    className='bg-gray-50 flex-1 ml-4'
                  />
                ) : (
                  <div className='flex items-center gap-2 flex-1 ml-4'>
                    <span className='text-sm font-bold text-card-foreground'>
                      {profileData.phone || 'Chưa cập nhật'}
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
                        Đã xác thực
                      </Badge>
                    ) : (
                      <>
                        <Badge
                          variant='outline'
                          className='text-red-600 border-red-200 bg-red-50'
                        >
                          Chưa xác thực
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
                <Button onClick={handleSaveProfile} className='flex-1'>
                  Lưu thông tin
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setIsEditingProfile(false)}
                  className='flex-1'
                >
                  Hủy
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
