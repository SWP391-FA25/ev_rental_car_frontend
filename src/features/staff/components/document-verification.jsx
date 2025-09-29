import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  Eye,
  Download,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  File,
  IdCard,
  Car,
} from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Badge } from '../../shared/components/ui/badge';
import { Textarea } from '../../shared/components/ui/textarea';
import { toast } from 'sonner';
import documentService from '../../shared/services/documentService';
import { useTranslation } from 'react-i18next';

const DocumentVerification = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [groupedDocuments, setGroupedDocuments] = useState({});
  const [expandedUsers, setExpandedUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [batchRejectionReason, setBatchRejectionReason] = useState('');
  const [isBatchRejectOpen, setIsBatchRejectOpen] = useState(false);
  const [selectedUserForBatch, setSelectedUserForBatch] = useState(null);
  const [filters, setFilters] = useState({
    status: 'PENDING',
    documentType: 'ALL',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, filters, searchTerm]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getAllDocuments({
        status: filters.status !== 'ALL' ? filters.status : undefined,
        documentType:
          filters.documentType !== 'ALL' ? filters.documentType : undefined,
      });

      if (response && response.success) {
        setDocuments(response.data.documents || []);
      } else {
        throw new Error(
          response?.message || t('staffDocuments.errors.fetchFailed')
        );
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error(error.message || t('staffDocuments.errors.fetchFailed'));
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...documents];

    // Apply status filter
    if (filters.status !== 'ALL') {
      result = result.filter(doc => doc.status === filters.status);
    }

    // Apply document type filter
    if (filters.documentType !== 'ALL') {
      result = result.filter(doc => doc.documentType === filters.documentType);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        doc =>
          (doc.user.name && doc.user.name.toLowerCase().includes(term)) ||
          (doc.user.email && doc.user.email.toLowerCase().includes(term)) ||
          (doc.documentType && doc.documentType.toLowerCase().includes(term))
      );
    }

    // Group documents by user
    const grouped = {};
    result.forEach(doc => {
      const userId = doc.user.id;
      if (!grouped[userId]) {
        grouped[userId] = {
          user: doc.user,
          documents: [],
        };
      }
      grouped[userId].documents.push(doc);
    });

    setGroupedDocuments(grouped);
  };

  const toggleUserExpand = userId => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleApprove = async documentId => {
    try {
      const response = await documentService.verifyDocument(documentId, {
        status: 'APPROVED',
      });

      if (response && response.success) {
        toast.success(t('staffDocuments.toasts.approveSuccess'));
        // Update the document in the list
        setDocuments(prev =>
          prev.map(doc =>
            doc.id === documentId ? { ...doc, status: 'APPROVED' } : doc
          )
        );
      } else {
        throw new Error(
          response?.message || t('staffDocuments.errors.approveFailed')
        );
      }
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error(error.message || t('staffDocuments.errors.approveFailed'));
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error(t('staffDocuments.errors.rejectionReasonRequired'));
      return;
    }

    try {
      const response = await documentService.verifyDocument(
        selectedDocument.id,
        {
          status: 'REJECTED',
          rejectionReason,
        }
      );

      if (response && response.success) {
        toast.success(t('staffDocuments.toasts.rejectSuccess'));
        // Update the document in the list
        setDocuments(prev =>
          prev.map(doc =>
            doc.id === selectedDocument.id
              ? { ...doc, status: 'REJECTED' }
              : doc
          )
        );
        setIsRejectOpen(false);
        setRejectionReason('');
        setSelectedDocument(null);
      } else {
        throw new Error(
          response?.message || t('staffDocuments.errors.rejectFailed')
        );
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error(error.message || t('staffDocuments.errors.rejectFailed'));
    }
  };

  const handlePreview = document => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const handleOpenReject = document => {
    setSelectedDocument(document);
    setIsRejectOpen(true);
  };

  const handleOpenBatchReject = userId => {
    setSelectedUserForBatch(userId);
    setIsBatchRejectOpen(true);
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant='secondary'>
            {t('staffDocuments.status.pending')}
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant='default'>{t('staffDocuments.status.approved')}</Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant='destructive'>
            {t('staffDocuments.status.rejected')}
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getDocumentTypeLabel = type => {
    switch (type) {
      case 'DRIVERS_LICENSE':
        return t('staffDocuments.types.driversLicense');
      case 'ID_CARD':
        return t('staffDocuments.types.idCard');
      case 'PASSPORT':
        return t('staffDocuments.types.passport');
      default:
        return type;
    }
  };

  const getDocumentIcon = type => {
    switch (type) {
      case 'DRIVERS_LICENSE':
        return <Car className='h-5 w-5 text-blue-500' />;
      case 'ID_CARD':
        return <IdCard className='h-5 w-5 text-green-500' />;
      case 'PASSPORT':
        return <FileText className='h-5 w-5 text-purple-500' />;
      default:
        return <File className='h-5 w-5 text-gray-500' />;
    }
  };

  const formatDate = dateString => {
    if (!dateString) return t('staffDocuments.common.na');
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold'>{t('staffDocuments.title')}</h1>
        <p className='text-muted-foreground'>{t('staffDocuments.subtitle')}</p>
      </div>

      {/* Filters */}
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <Filter className='h-5 w-5' />
            {t('staffDocuments.filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1'>
            <Label htmlFor='search'>{t('staffDocuments.filters.search')}</Label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='search'
                placeholder={t('staffDocuments.filters.searchPlaceholder')}
                className='pl-10'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor='status'>{t('staffDocuments.filters.status')}</Label>
            <Select
              value={filters.status}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue
                  placeholder={t('staffDocuments.filters.statusPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>
                  {t('staffDocuments.filters.allStatuses')}
                </SelectItem>
                <SelectItem value='PENDING'>
                  {t('staffDocuments.status.pending')}
                </SelectItem>
                <SelectItem value='APPROVED'>
                  {t('staffDocuments.status.approved')}
                </SelectItem>
                <SelectItem value='REJECTED'>
                  {t('staffDocuments.status.rejected')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='documentType'>
              {t('staffDocuments.filters.type')}
            </Label>
            <Select
              value={filters.documentType}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, documentType: value }))
              }
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue
                  placeholder={t('staffDocuments.filters.typePlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>
                  {t('staffDocuments.filters.allTypes')}
                </SelectItem>
                <SelectItem value='DRIVERS_LICENSE'>
                  {t('staffDocuments.types.driversLicense')}
                </SelectItem>
                <SelectItem value='ID_CARD'>
                  {t('staffDocuments.types.idCard')}
                </SelectItem>
                <SelectItem value='PASSPORT'>
                  {t('staffDocuments.types.passport')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='lg:col-span-4 flex justify-end'>
            <Button
              onClick={fetchDocuments}
              disabled={loading}
              className='w-full md:w-auto'
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              {t('staffDocuments.actions.refresh')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle>{t('staffDocuments.list.title')}</CardTitle>
          <CardDescription>
            {t('staffDocuments.list.count', {
              count: filteredDocuments.length,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center items-center h-32'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : Object.keys(groupedDocuments).length === 0 ? (
            <div className='text-center py-12'>
              <FileText className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-2 text-sm font-medium'>
                {t('staffDocuments.empty.title')}
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                {t('staffDocuments.empty.subtitle')}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredDocuments.map(document => (
                <div
                  key={document.id}
                  className='flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg bg-card gap-4'
                >
                  <div className='flex items-start gap-4'>
                    <div className='bg-muted p-3 rounded-lg'>
                      <FileText className='h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='font-medium'>
                        {document.user?.name ||
                          t('staffDocuments.common.unknownUser')}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {document.user?.email ||
                          t('staffDocuments.common.noEmail')}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-xs bg-secondary px-2 py-1 rounded'>
                          {getDocumentTypeLabel(document.documentType)}
                        </span>
                        {getStatusBadge(document.status)}
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
                    <div className='text-sm text-muted-foreground'>
                      <Calendar className='inline h-4 w-4 mr-1' />
                      {t('staffDocuments.fields.uploaded')}:{' '}
                      {formatDate(document.uploadedAt)}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handlePreview(document)}
                      >
                        <Eye className='h-4 w-4 mr-1' />
                        {t('staffDocuments.actions.preview')}
                      </Button>
                      {document.status === 'PENDING' && (
                        <>
                          <Button
                            size='sm'
                            onClick={() => handleApprove(document.id)}
                          >
                            <CheckCircle className='h-4 w-4 mr-1' />
                            {t('staffDocuments.actions.approve')}
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => handleOpenReject(document)}
                          >
                            <XCircle className='h-4 w-4 mr-1' />
                            {t('staffDocuments.actions.reject')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{t('staffDocuments.preview.title')}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h3 className='font-medium flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    {t('staffDocuments.preview.userInfo')}
                  </h3>
                  <div className='mt-2 space-y-2'>
                    <p>
                      <strong>{t('staffDocuments.fields.name')}:</strong>{' '}
                      {selectedDocument.user?.name ||
                        t('staffDocuments.common.na')}
                    </p>
                    <p>
                      <strong>{t('staffDocuments.fields.email')}:</strong>{' '}
                      {selectedDocument.user?.email ||
                        t('staffDocuments.common.na')}
                    </p>
                    {selectedDocument.user?.phone && (
                      <p>
                        <strong>{t('staffDocuments.fields.phone')}:</strong>{' '}
                        {selectedDocument.user.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className='font-medium flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    {t('staffDocuments.preview.docInfo')}
                  </h3>
                  <div className='mt-2 space-y-2'>
                    <p>
                      <strong>{t('staffDocuments.fields.type')}:</strong>{' '}
                      {getDocumentTypeLabel(selectedDocument.documentType)}
                    </p>
                    <p>
                      <strong>{t('staffDocuments.fields.fileName')}:</strong>{' '}
                      {selectedDocument.fileName ||
                        t('staffDocuments.common.na')}
                    </p>
                    <p>
                      <strong>{t('staffDocuments.fields.status')}:</strong>{' '}
                      {getStatusBadge(selectedDocument.status)}
                    </p>
                    <p>
                      <strong>{t('staffDocuments.fields.uploaded')}:</strong>{' '}
                      {formatDate(selectedDocument.uploadedAt)}
                    </p>
                    {selectedDocument.expiryDate && (
                      <p>
                        <strong>{t('staffDocuments.fields.expires')}:</strong>{' '}
                        {formatDate(selectedDocument.expiryDate)}
                      </p>
                    )}
                    {selectedDocument.documentNumber && (
                      <p>
                        <strong>
                          {t('staffDocuments.fields.documentNumber')}:
                        </strong>{' '}
                        {selectedDocument.documentNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-medium mb-2'>
                  {t('staffDocuments.preview.preview')}
                </h3>
                {selectedDocument.fileUrl ? (
                  selectedDocument.mimeType === 'application/pdf' ? (
                    <iframe
                      src={selectedDocument.fileUrl}
                      className='w-full h-96 border rounded'
                      title={t('staffDocuments.preview.title')}
                    />
                  ) : (
                    <img
                      src={selectedDocument.fileUrl}
                      alt={t('staffDocuments.preview.title')}
                      className='max-w-full h-auto border rounded'
                    />
                  )
                ) : (
                  <div className='text-center py-8 text-muted-foreground'>
                    {t('staffDocuments.preview.notAvailable')}
                  </div>
                )}
              </div>

              <div className='flex justify-end gap-3'>
                <Button
                  variant='outline'
                  onClick={() => setIsPreviewOpen(false)}
                >
                  {t('common.close', { defaultValue: 'Close' })}
                </Button>
                {selectedDocument.fileUrl && (
                  <a href={selectedDocument.fileUrl} download>
                    <Button>
                      <Download className='h-4 w-4 mr-1' />
                      {t('staffDocuments.actions.download')}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Document Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('staffDocuments.reject.title')}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className='space-y-4'>
              <div>
                <p className='mb-2'>
                  {t('staffDocuments.reject.confirm', {
                    name:
                      selectedDocument.user?.name ||
                      t('staffDocuments.common.theUser'),
                    docType: getDocumentTypeLabel(
                      selectedDocument.documentType
                    ),
                  })}
                </p>
                <p className='text-sm text-muted-foreground mb-4'>
                  {t('staffDocuments.reject.description')}
                </p>
              </div>

              <div>
                <Label htmlFor='rejectionReason'>
                  {t('staffDocuments.reject.reason')}
                </Label>
                <Textarea
                  id='rejectionReason'
                  placeholder={t('staffDocuments.reject.reasonPlaceholder')}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>

              <DialogFooter className='gap-2 sm:gap-0'>
                <Button
                  variant='outline'
                  onClick={() => setIsRejectOpen(false)}
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button variant='destructive' onClick={handleReject}>
                  {t('staffDocuments.reject.submit')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentVerification;
