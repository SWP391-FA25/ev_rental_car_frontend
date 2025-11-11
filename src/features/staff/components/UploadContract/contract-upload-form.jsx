'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Card } from '../../../shared/components/ui/card';
import { Input } from '../../../shared/components/ui/input';
import { endpoints } from '../../../shared/lib/endpoints';
import { toast } from 'sonner';
import { useAuth } from '../../../../app/providers/AuthProvider';

export function ContractUploadForm({
  bookingId,
  contractId,
  onSuccess,
  onCancel,
  customerName,
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    renterName: customerName || '',
    witnessName: user?.name || '',
    notes: '',
    file: null,
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentContractId, setCurrentContractId] = useState(contractId);

  // Auto-fill customer name and witness name when available
  useEffect(() => {
    if (customerName && !formData.renterName) {
      setFormData(prev => ({ ...prev, renterName: customerName }));
    }
    if (user?.name && !formData.witnessName) {
      setFormData(prev => ({ ...prev, witnessName: user.name }));
    }
  }, [customerName, user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.renterName.trim()) {
      newErrors.renterName = t(
        'staffContracts.uploadForm.errors.renterNameRequired'
      );
    } else if (
      formData.renterName.length < 2 ||
      formData.renterName.length > 100
    ) {
      newErrors.renterName = t(
        'staffContracts.uploadForm.errors.renterNameLength'
      );
    }

    if (!formData.witnessName.trim()) {
      newErrors.witnessName = t(
        'staffContracts.uploadForm.errors.witnessNameRequired'
      );
    } else if (
      formData.witnessName.length < 2 ||
      formData.witnessName.length > 100
    ) {
      newErrors.witnessName = t(
        'staffContracts.uploadForm.errors.witnessNameLength'
      );
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = t('staffContracts.uploadForm.errors.notesLength');
    }

    if (!formData.file) {
      newErrors.file = t('staffContracts.uploadForm.errors.fileRequired');
    } else {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (formData.file.size > maxSize) {
        newErrors.file = t('staffContracts.uploadForm.errors.fileTooLarge');
      }

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
      ];
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = t('staffContracts.uploadForm.errors.fileInvalidType');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Authorization check
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
      toast.error('You do not have permission to access this feature');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!bookingId) {
      toast.error('Booking ID not found');
      return;
    }

    // Show confirmation dialog before uploading
    setShowConfirmDialog(true);
  };

  const handleConfirmUpload = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      let contractIdToUse = currentContractId;

      // Step 1: Create contract if it doesn't exist (without renterName, witnessName, notes)
      if (!contractIdToUse) {
        console.log('📝 Creating new contract for booking:', bookingId);

        const createResponse = await fetch(endpoints.contracts.create(), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: bookingId,
            // Don't send renterName, witnessName, notes here - they'll be sent with the file upload
          }),
        });

        const createData = await createResponse.json();

        if (!createResponse.ok || !createData.success) {
          // Handle specific errors
          if (createResponse.status === 400) {
            throw new Error(
              createData.message || 'Invalid booking or contract already exists'
            );
          } else if (createResponse.status === 403) {
            throw new Error('You do not have permission to create a contract');
          } else if (createResponse.status === 404) {
            throw new Error('Không tìm thấy booking');
          } else {
            throw new Error(createData.message || 'Failed to create contract');
          }
        }

        contractIdToUse = createData.data.id;
        setCurrentContractId(contractIdToUse);
        console.log('✅ Contract created with ID:', contractIdToUse);
      }

      // Step 2: Upload signed contract file with renterName, witnessName, notes
      console.log(
        '📤 Uploading signed contract file for contract:',
        contractIdToUse
      );

      const formDataToSend = new FormData();
      formDataToSend.append('renterName', formData.renterName.trim());
      formDataToSend.append('witnessName', formData.witnessName.trim());
      if (formData.notes.trim()) {
        formDataToSend.append('notes', formData.notes.trim());
      }
      formDataToSend.append('file', formData.file);

      const uploadResponse = await fetch(
        endpoints.contracts.uploadSignedFile(contractIdToUse),
        {
          method: 'POST',
          credentials: 'include',
          body: formDataToSend,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success) {
        // Handle specific errors
        if (uploadResponse.status === 400) {
          throw new Error(
            uploadData.message ||
              'Dữ liệu không hợp lệ hoặc file không đúng định dạng'
          );
        } else if (uploadResponse.status === 403) {
          throw new Error('You do not have permission to upload the contract');
        } else if (uploadResponse.status === 404) {
          throw new Error('Contract not found');
        } else if (uploadResponse.status === 409) {
          throw new Error('Contract already uploaded');
        } else {
          throw new Error(
            uploadData.message || 'Failed to upload contract file'
          );
        }
      }

      console.log('✅ Contract uploaded and completed successfully');
      // ✅ Removed duplicate toast - parent component will show the success message

      // Reset form
      setFormData({
        renterName: '',
        witnessName: '',
        notes: '',
        file: null,
      });
      setErrors({});

      // Notify parent component
      if (onSuccess) {
        onSuccess(uploadData.data);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    setFormData({ ...formData, file });
    if (errors.file) {
      setErrors({ ...errors, file: '' });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null });
  };

  const handleCancel = () => {
    setFormData({
      renterName: '',
      witnessName: '',
      notes: '',
      file: null,
    });
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className='space-y-4'>
          {/* Renter Name - Read Only */}
          <div>
            <label className='block text-sm font-semibold mb-1.5'>
              {t('staffContracts.uploadForm.renterNameLabel')}{' '}
              <span className='text-destructive'>*</span>
            </label>
            <Input
              type='text'
              value={formData.renterName}
              readOnly
              className='bg-muted border-2 cursor-not-allowed'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {t('staffContracts.uploadForm.autoBooking')}
            </p>
          </div>

          {/* Witness Name - Read Only */}
          <div>
            <label className='block text-sm font-semibold mb-1.5'>
              {t('staffContracts.uploadForm.witnessNameLabel')}{' '}
              <span className='text-destructive'>*</span>
            </label>
            <Input
              type='text'
              value={formData.witnessName}
              readOnly
              className='bg-muted border-2 cursor-not-allowed'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {t('staffContracts.uploadForm.autoStaff')}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className='block text-sm font-semibold mb-1.5'>
              {t('staffContracts.uploadForm.notesLabel')}
            </label>
            <textarea
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder={t('staffContracts.uploadForm.notesPlaceholder')}
              maxLength={500}
              rows={3}
              className='w-full px-3 py-2 border-2 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-sm'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {formData.notes.length}/500{' '}
              {t('staffContracts.uploadForm.notesCountSuffix')}
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className='block text-sm font-semibold mb-1.5'>
              {t('staffContracts.uploadForm.fileLabel')}{' '}
              <span className='text-destructive'>*</span>
            </label>

            {formData.file ? (
              <div className='p-3 bg-primary/5 border-2 border-primary/20 rounded-lg flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <FileText className='w-5 h-5 text-primary' />
                  <div>
                    <p className='font-medium text-sm'>{formData.file.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={removeFile}
                  className='p-1 hover:bg-primary/10 rounded transition-colors'
                >
                  <X className='w-4 h-4 text-muted-foreground' />
                </button>
              </div>
            ) : (
              <label className='block'>
                <div className='border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer'>
                  <Upload className='w-10 h-10 text-muted-foreground mx-auto mb-2' />
                  <p className='font-semibold text-sm mb-1'>
                    {t('staffContracts.uploadForm.chooseOrDrag')}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {t('staffContracts.uploadForm.acceptedTypes')}
                  </p>
                </div>
                <input
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={handleFileChange}
                  className='hidden'
                />
              </label>
            )}
            {errors.file && (
              <p className='text-sm text-destructive mt-1'>{errors.file}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex gap-3 mt-6'>
          <Button
            type='button'
            variant='outline'
            className='flex-1'
            onClick={handleCancel}
            disabled={loading}
          >
            {t('staffContracts.uploadForm.cancel')}
          </Button>
          <Button
            type='submit'
            disabled={loading}
            className='flex-1 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                {t('staffContracts.uploadForm.uploading')}
              </>
            ) : (
              <>
                <Upload className='w-4 h-4 mr-2' />
                {t('staffContracts.uploadForm.upload')}
              </>
            )}
          </Button>
        </div>

        {/* Info Box - Compact */}
        <div className='mt-4 p-3 bg-muted/50 rounded-lg border'>
          <p className='text-xs text-muted-foreground'>
            <span className='font-semibold'>
              {t('staffContracts.uploadForm.requirements.label')}
            </span>{' '}
            {t('staffContracts.uploadForm.requirements.text')}
          </p>
        </div>
      </form>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-100'>
          <div className='bg-card rounded-lg shadow-xl max-w-md w-full p-6'>
            <div className='flex items-start gap-4 mb-4'>
              <div className='p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full'>
                <AlertTriangle className='w-6 h-6 text-amber-600 dark:text-amber-400' />
              </div>
              <div className='flex-1'>
                <h3 className='text-lg font-bold mb-2'>
                  {t('staffContracts.uploadForm.confirm.title')}
                </h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  {t('staffContracts.uploadForm.confirm.description')}
                </p>
                <ul className='space-y-2 text-sm mb-4'>
                  <li className='flex items-start gap-2'>
                    <CheckCircle className='w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0' />
                    <span>
                      {t(
                        'staffContracts.uploadForm.confirm.items.signedByCustomer'
                      )}
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <CheckCircle className='w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0' />
                    <span>
                      {t(
                        'staffContracts.uploadForm.confirm.items.accurateInfo'
                      )}
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <CheckCircle className='w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0' />
                    <span>
                      {t('staffContracts.uploadForm.confirm.items.clearFile')}
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <CheckCircle className='w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0' />
                    <span>
                      {t(
                        'staffContracts.uploadForm.confirm.items.explainedTerms'
                      )}
                    </span>
                  </li>
                </ul>
                <div className='p-3 bg-primary/5 rounded-lg border border-primary/20'>
                  <p className='text-xs text-muted-foreground'>
                    <span className='font-semibold'>
                      {t('staffContracts.uploadForm.confirm.noteTitle')}
                    </span>{' '}
                    {t('staffContracts.uploadForm.confirm.noteContent')}
                  </p>
                </div>
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                className='flex-1'
                onClick={() => setShowConfirmDialog(false)}
              >
                {t('staffContracts.uploadForm.confirm.cancel')}
              </Button>
              <Button
                type='button'
                className='flex-1'
                onClick={handleConfirmUpload}
              >
                <CheckCircle className='w-4 h-4 mr-2' />
                {t('staffContracts.uploadForm.confirm.confirmUpload')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
