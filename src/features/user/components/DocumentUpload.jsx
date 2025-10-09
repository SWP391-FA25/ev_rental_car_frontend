import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import documentService from '../../shared/services/documentService';

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadData, setUploadData] = useState({
    documentType: '',
    documentNumber: '',
    expiryDate: '',
  });
  const [errors, setErrors] = useState({});
  const [fileInputKey, setFileInputKey] = useState(0);

  const isImageUrl = url => {
    if (!url || typeof url !== 'string') return false;
    return /(\.png|\.jpg|\.jpeg|\.gif|\.webp)$/i.test(url.split('?')[0]);
  };

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const fetchUserDocuments = async () => {
    try {
      const response = await documentService.getUserDocuments();
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, or PDF files.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);

    // Clear file error when user selects a file
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: '' }));
    }

    // Create preview URL
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUploadDataChange = (field, value) => {
    setUploadData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!uploadData.documentType) {
      newErrors.documentType = 'Document type is required';
    }

    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async e => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', uploadData.documentType);

      if (uploadData.documentNumber) {
        formData.append('documentNumber', uploadData.documentNumber);
      }

      if (uploadData.expiryDate) {
        formData.append('expiryDate', uploadData.expiryDate);
      }

      const response = await documentService.uploadDocument(formData);

      if (response.success) {
        toast.success('Document uploaded successfully');
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadData({
          documentType: '',
          documentNumber: '',
          expiryDate: '',
        });
        // Clear validation errors and reset file input
        setErrors({});
        setFileInputKey(k => k + 1);
        // Refresh documents list
        fetchUserDocuments();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async documentId => {
    try {
      const response = await documentService.deleteDocument(documentId);

      if (response.success) {
        toast.success('Document deleted successfully');
        // Refresh documents list
        fetchUserDocuments();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const getDocumentTypeLabel = type => {
    switch (type) {
      case 'DRIVERS_LICENSE':
        return "Driver's License";
      case 'ID_CARD':
        return 'ID Card';
      case 'PASSPORT':
        return 'Passport';
      default:
        return type;
    }
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'PENDING':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            <CheckCircle className='h-3 w-3 mr-1' />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            <XCircle className='h-3 w-3 mr-1' />
            Rejected
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            {status}
          </span>
        );
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Chỉ hiển thị 2 loại tài liệu chính: CMND/Hộ chiếu (ID) và GPLX
  const identityDoc = documents.find(
    d => d.documentType === 'ID_CARD' || d.documentType === 'PASSPORT'
  );
  const licenseDoc = documents.find(d => d.documentType === 'DRIVERS_LICENSE');
  const docsToShow = [identityDoc, licenseDoc].filter(Boolean);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Document Upload</h1>
        <p className='text-muted-foreground'>
          Upload your identification documents for account verification
        </p>
      </div>

      {/* Notice Banner */}
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
        <div className='flex items-start gap-3'>
          <AlertTriangle className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
          <p className='text-red-800 text-sm'>
            <strong>Lưu ý:</strong> để tránh phát sinh vấn đề trong quá trình
            thuê xe, người đặt xe trên EV Rental (đã xác thực GPLX) ĐỒNG THỜI
            phải là người nhận xe.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Upload New Document
          </CardTitle>
          <CardDescription>
            Please upload clear images or PDFs of your identification documents
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpload} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-10'>
                <div>
                  <Label className='mb-2' htmlFor='documentType'>
                    Document Type *
                  </Label>
                  <Select
                    value={uploadData.documentType}
                    onValueChange={value =>
                      handleUploadDataChange('documentType', value)
                    }
                  >
                    <SelectTrigger
                      className={errors.documentType ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder='Select document type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='DRIVERS_LICENSE'>
                        Driver's License
                      </SelectItem>
                      <SelectItem value='ID_CARD'>ID Card</SelectItem>
                      <SelectItem value='PASSPORT'>Passport</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.documentType && (
                    <p className='text-sm text-red-500 mt-1'>
                      {errors.documentType}
                    </p>
                  )}
                </div>

                <div>
                  <Label className='mb-2' htmlFor='documentNumber'>
                    Document Number
                  </Label>
                  <Input
                    id='documentNumber'
                    placeholder='Enter document number'
                    value={uploadData.documentNumber}
                    onChange={e =>
                      handleUploadDataChange('documentNumber', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className='mb-2' htmlFor='expiryDate'>
                    Expiry Date
                  </Label>
                  <Input
                    id='expiryDate'
                    type='date'
                    value={uploadData.expiryDate}
                    onChange={e =>
                      handleUploadDataChange('expiryDate', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label
                    className='mb-2
                  '
                    htmlFor='document'
                  >
                    Document File *
                  </Label>
                  <Input
                    id='document'
                    type='file'
                    accept='.jpg,.jpeg,.png,.pdf'
                    onChange={handleFileChange}
                    key={fileInputKey}
                    className={errors.file ? 'border-red-500' : ''}
                  />
                  {errors.file && (
                    <p className='text-sm text-red-500 mt-1'>{errors.file}</p>
                  )}
                  <p className='text-sm text-muted-foreground mt-1'>
                    Supported formats: JPG, PNG, PDF (Max 10MB)
                  </p>
                </div>
              </div>

              <div>
                <Label
                  className='mb-2
                '
                >
                  Preview
                </Label>
                <div className='border-2 border-dashed border-muted rounded-lg p-4 h-64 flex items-center justify-center'>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt='Preview'
                      className='max-h-full max-w-full object-contain'
                    />
                  ) : selectedFile ? (
                    <div className='text-center'>
                      <FileText className='h-12 w-12 mx-auto text-muted-foreground' />
                      <p className='mt-2 text-sm text-muted-foreground'>
                        {selectedFile.name}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        PDF files cannot be previewed
                      </p>
                    </div>
                  ) : (
                    <div className='text-center'>
                      <Upload className='h-12 w-12 mx-auto text-muted-foreground' />
                      <p className='mt-2 text-sm text-muted-foreground'>
                        No file selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='flex justify-end'>
              <Button type='submit' disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            My Documents
          </CardTitle>
          <CardDescription>
            Your uploaded documents and their verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className='text-center py-8'>
              <FileText className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-2 text-sm font-medium'>
                No documents uploaded
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                Get started by uploading your identification documents.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center'>
              {docsToShow.map(document => (
                <div
                  key={document.id}
                  className='w-full max-w-[520px] p-5 border rounded-lg bg-card flex flex-col gap-3 hover:shadow-lg transition-shadow'
                >
                  <div className='flex items-start gap-4'>
                    <div className='bg-muted p-3 rounded-lg'>
                      <FileText className='h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>
                        {getDocumentTypeLabel(document.documentType)}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        Uploaded: {formatDate(document.uploadedAt)}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        {getStatusBadge(document.status)}
                        {document.status === 'REJECTED' &&
                          document.rejectionReason && (
                            <div className='mt-2 p-3 bg-red-50 border border-red-200 rounded-md'>
                              <div className='flex items-center gap-2'>
                                <AlertCircle className='h-4 w-4 text-red-500' />
                                <span className='text-sm font-medium text-red-800'>
                                  Rejection Reason
                                </span>
                              </div>
                              <p className='text-sm text-red-700 mt-1'>
                                {document.rejectionReason}
                              </p>
                            </div>
                          )}
                      </div>
                      {document.fileUrl && isImageUrl(document.fileUrl) && (
                        <div className='mt-3'>
                          <img
                            src={document.fileUrl}
                            alt={`${getDocumentTypeLabel(
                              document.documentType
                            )} preview`}
                            className='w-full max-w-[420px] h-52 object-cover rounded-lg mx-auto shadow-md border'
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='flex gap-2 justify-center'>
                    {document.fileUrl && (
                      <a
                        href={document.fileUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Button size='sm' variant='outline'>
                          <Eye className='h-4 w-4 mr-1' />
                          View
                        </Button>
                      </a>
                    )}
                    {document.status !== 'APPROVED' && (
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDelete(document.id)}
                      >
                        <Trash2 className='h-4 w-4 mr-1' />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;
