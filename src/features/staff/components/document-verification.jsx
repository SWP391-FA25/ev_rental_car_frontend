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

const DocumentVerification = ({ userId, onVerificationUpdated }) => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [groupedDocuments, setGroupedDocuments] = useState({});
  const [expandedUsers, setExpandedUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Refetch from API when server-side filters change
  useEffect(() => {
    fetchDocuments();
  }, [filters.status, filters.documentType]);

  useEffect(() => {
    applyFilters();
  }, [documents, filters, searchTerm]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentService.getAllDocuments({
        status: filters.status !== 'ALL' ? filters.status : undefined,
        documentType:
          filters.documentType !== 'ALL' ? filters.documentType : undefined,
      });

      const success = response?.success;
      if (success) {
        const docs = response?.data?.documents || [];
        setDocuments(docs);
      } else {
        throw new Error(
          response?.message || t('staffDocuments.errors.fetchFailed')
        );
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      const msg = error.message || t('staffDocuments.errors.fetchFailed');
      setError(msg);
      toast.error(msg);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...documents];

    // Filter by selected user when provided
    if (userId) {
      result = result.filter(doc => doc.user?.id === userId);
    }

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
    setFilteredDocuments(result);
    setGroupedDocuments(grouped);
  };

  // Ensure selected user's group expanded by default
  useEffect(() => {
    if (userId && groupedDocuments[userId]) {
      setExpandedUsers(prev => ({ ...prev, [userId]: true }));
    }
  }, [userId, groupedDocuments]);

  const toggleUserExpand = userId => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const computeVerificationStatusForUser = docsForUser => {
    // Identity docs can be ID_CARD or PASSPORT
    const identityDocs = docsForUser.filter(
      d => d.documentType === 'ID_CARD' || d.documentType === 'PASSPORT'
    );
    const licenseDocs = docsForUser.filter(
      d => d.documentType === 'DRIVERS_LICENSE'
    );

    const mapStatus = arr => {
      if (arr.length === 0) return 'Pending';
      // Nếu đã có ít nhất một tài liệu được duyệt, coi là Verified
      if (arr.some(d => d.status === 'APPROVED')) return 'Verified';
      // Nếu có bất kỳ bị từ chối, coi là Failed
      if (arr.some(d => d.status === 'REJECTED')) return 'Failed';
      // Còn lại là Pending (chưa có approved, chỉ pending)
      return 'Pending';
    };

    return {
      identity: mapStatus(identityDocs),
      license: mapStatus(licenseDocs),
    };
  };

  const handleApprove = async documentId => {
    try {
      const response = await documentService.verifyDocument(documentId, {
        status: 'APPROVED',
      });

      const success = response?.success;
      if (success) {
        toast.success(t('staffDocuments.toasts.approveSuccess'));
        // Update the document in the list and propagate verification status
        setDocuments(prev => {
          const next = prev.map(doc =>
            doc.id === documentId ? { ...doc, status: 'APPROVED' } : doc
          );
          const target = next.find(d => d.id === documentId);
          const uid = target?.user?.id;
          if (uid) {
            const docsForUser = next.filter(d => d.user?.id === uid);
            const vs = computeVerificationStatusForUser(docsForUser);
            onVerificationUpdated?.(uid, vs);
          }
          return next;
        });
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

      const success = response?.success;
      if (success) {
        toast.success(t('staffDocuments.toasts.rejectSuccess'));
        // Update the document in the list and propagate verification status
        setDocuments(prev => {
          const next = prev.map(doc =>
            doc.id === selectedDocument.id
              ? { ...doc, status: 'REJECTED' }
              : doc
          );
          const uid = selectedDocument?.user?.id;
          if (uid) {
            const docsForUser = next.filter(d => d.user?.id === uid);
            const vs = computeVerificationStatusForUser(docsForUser);
            onVerificationUpdated?.(uid, vs);
          }
          return next;
        });
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

  const handleBatchApprove = async userId => {
    try {
      const pendingDocs = documents.filter(
        d => d.user?.id === userId && d.status === 'PENDING'
      );
      for (const doc of pendingDocs) {
        const res = await documentService.verifyDocument(doc.id, {
          status: 'APPROVED',
        });
        if (!res?.success) {
          throw new Error(
            res?.message || t('staffDocuments.errors.approveFailed')
          );
        }
      }

      // Update local state and propagate verification status
      setDocuments(prev => {
        const next = prev.map(d =>
          d.user?.id === userId && d.status === 'PENDING'
            ? { ...d, status: 'APPROVED' }
            : d
        );
        const docsForUser = next.filter(d => d.user?.id === userId);
        const vs = computeVerificationStatusForUser(docsForUser);
        onVerificationUpdated?.(userId, vs);
        return next;
      });
      toast.success(
        t('staffDocuments.toasts.batchApproveSuccess') ||
          'Approved all pending documents'
      );
    } catch (err) {
      console.error('Batch approve error:', err);
      toast.error(err.message || t('staffDocuments.errors.approveFailed'));
    }
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
            <Label htmlFor='search' className='mb-2 block'>
              {t('staffDocuments.filters.search')}
            </Label>
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
            <Label htmlFor='status' className='mb-2 block'>
              {t('staffDocuments.filters.status')}
            </Label>
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
            <Label htmlFor='documentType' className='mb-2 block'>
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
          {error && (
            <div className='mb-4 rounded border border-red-200 bg-red-50 text-red-700 p-3'>
              {error}
            </div>
          )}
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
            <div className='space-y-6'>
              {(userId
                ? [groupedDocuments[userId]].filter(Boolean)
                : Object.values(groupedDocuments)
              ).map(group => {
                const user = group.user;
                const isExpanded = !!expandedUsers[user.id];
                const pendingCount = group.documents.filter(
                  d => d.status === 'PENDING'
                ).length;
                return (
                  <div key={user.id} className='border rounded-lg'>
                    <div className='flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-muted/50 rounded-t-lg gap-3'>
                      <div className='flex items-center gap-3 w-full md:w-auto'>
                        <button
                          className='p-1 rounded hover:bg-muted'
                          onClick={() => toggleUserExpand(user.id)}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? (
                            <ChevronDown className='h-5 w-5' />
                          ) : (
                            <ChevronRight className='h-5 w-5' />
                          )}
                        </button>
                        <div className='min-w-0'>
                          <div className='font-medium truncate'>
                            {user?.name ||
                              t('staffDocuments.common.unknownUser')}
                          </div>
                          <div className='text-sm text-muted-foreground truncate'>
                            {user?.email || t('staffDocuments.common.noEmail')}
                            {user?.phone ? ` • ${user.phone}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-wrap items-center gap-2 w-full md:w-auto'>
                        {pendingCount > 0 && (
                          <Button
                            className='w-full md:w-auto'
                            onClick={() => handleBatchApprove(user.id)}
                          >
                            <CheckCircle className='h-4 w-4 mr-1' />
                            {t('staffDocuments.actions.batchApprove')}
                          </Button>
                        )}
                        {pendingCount > 0 && (
                          <Button
                            className='w-full md:w-auto'
                            variant='destructive'
                            onClick={() => handleOpenBatchReject(user.id)}
                          >
                            <XCircle className='h-4 w-4 mr-1' />
                            {t('staffDocuments.actions.batchReject')}
                          </Button>
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className='p-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          {group.documents.map(document => (
                            <div
                              key={document.id}
                              className='border rounded-lg p-3 bg-card'
                            >
                              <div className='flex items-start gap-3'>
                                <div className='p-2 rounded bg-muted'>
                                  {getDocumentIcon(document.documentType)}
                                </div>
                                <div className='flex-1'>
                                  <div className='flex items-center justify-between'>
                                    <div className='font-medium'>
                                      {getDocumentTypeLabel(
                                        document.documentType
                                      )}
                                    </div>
                                    {getStatusBadge(document.status)}
                                  </div>
                                  <div className='text-xs text-muted-foreground mt-1'>
                                    <Calendar className='inline h-3 w-3 mr-1' />
                                    {t('staffDocuments.fields.uploaded')}:{' '}
                                    {formatDate(document.uploadedAt)}
                                  </div>
                                  <div className='mt-3 flex flex-wrap gap-2'>
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
                                          className='w-full md:w-auto'
                                          onClick={() =>
                                            handleApprove(document.id)
                                          }
                                        >
                                          <CheckCircle className='h-4 w-4 mr-1' />
                                          {t('staffDocuments.actions.approve')}
                                        </Button>
                                        <Button
                                          className='w-full md:w-auto'
                                          variant='destructive'
                                          onClick={() =>
                                            handleOpenReject(document)
                                          }
                                        >
                                          <XCircle className='h-4 w-4 mr-1' />
                                          {t('staffDocuments.actions.reject')}
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
        <DialogContent className='max-h-[90vh] overflow-y-auto'>
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
      {/* Batch Reject Dialog */}
      <Dialog open={isBatchRejectOpen} onOpenChange={setIsBatchRejectOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{t('staffDocuments.batchReject.title')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              {t('staffDocuments.batchReject.description')}
            </p>
            <div>
              <Label htmlFor='batch-rejection-reason'>
                {t('staffDocuments.batchReject.reason')}
              </Label>
              <Textarea
                id='batch-rejection-reason'
                placeholder={t('staffDocuments.batchReject.placeholder')}
                value={batchRejectionReason}
                onChange={e => setBatchRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                variant='outline'
                onClick={() => setIsBatchRejectOpen(false)}
              >
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                variant='destructive'
                onClick={async () => {
                  if (!selectedUserForBatch) return;
                  if (!batchRejectionReason.trim()) {
                    toast.error(
                      t('staffDocuments.errors.rejectionReasonRequired')
                    );
                    return;
                  }
                  try {
                    const docs =
                      groupedDocuments[selectedUserForBatch]?.documents || [];
                    const pendingDocs = docs.filter(
                      d => d.status === 'PENDING'
                    );
                    await Promise.all(
                      pendingDocs.map(d =>
                        documentService.verifyDocument(d.id, {
                          status: 'REJECTED',
                          rejectionReason: batchRejectionReason,
                        })
                      )
                    );
                    // Update local state and propagate verification status
                    setDocuments(prev => {
                      const next = prev.map(doc =>
                        doc.user?.id === selectedUserForBatch &&
                        doc.status === 'PENDING'
                          ? { ...doc, status: 'REJECTED' }
                          : doc
                      );
                      if (selectedUserForBatch) {
                        const docsForUser = next.filter(
                          d => d.user?.id === selectedUserForBatch
                        );
                        const vs =
                          computeVerificationStatusForUser(docsForUser);
                        onVerificationUpdated?.(selectedUserForBatch, vs);
                      }
                      return next;
                    });
                    toast.success(
                      t('staffDocuments.toasts.batchRejectSuccess')
                    );
                    setBatchRejectionReason('');
                    setSelectedUserForBatch(null);
                    setIsBatchRejectOpen(false);
                  } catch (err) {
                    console.error('Batch reject error:', err);
                    toast.error(
                      err.message || t('staffDocuments.errors.rejectFailed')
                    );
                  }
                }}
              >
                {t('staffDocuments.actions.confirmReject')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentVerification;
