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

const DocumentVerification = () => {
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
        throw new Error(response?.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error(error.message || 'Failed to fetch documents');
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
        toast.success('Document approved successfully');
        // Update the document in the list
        setDocuments(prev =>
          prev.map(doc =>
            doc.id === documentId ? { ...doc, status: 'APPROVED' } : doc
          )
        );
      } else {
        throw new Error(response?.message || 'Failed to approve document');
      }
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error(error.message || 'Failed to approve document');
    }
  };

  const handleBatchApprove = async userId => {
    try {
      const userDocuments = groupedDocuments[userId].documents;
      const pendingDocuments = userDocuments.filter(
        doc => doc.status === 'PENDING'
      );

      // Approve all pending documents for this user
      const promises = pendingDocuments.map(doc =>
        documentService.verifyDocument(doc.id, { status: 'APPROVED' })
      );

      const results = await Promise.allSettled(promises);

      // Count successful approvals
      const successful = results.filter(
        result => result.status === 'fulfilled' && result.value?.success
      ).length;

      toast.success(
        `Approved ${successful} documents for ${groupedDocuments[userId].user.name}`
      );

      // Update the documents in the list
      setDocuments(prev =>
        prev.map(doc => {
          if (doc.user.id === userId && doc.status === 'PENDING') {
            return { ...doc, status: 'APPROVED' };
          }
          return doc;
        })
      );
    } catch (error) {
      console.error('Error batch approving documents:', error);
      toast.error('Failed to batch approve documents');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
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
        toast.success('Document rejected successfully');
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
        throw new Error(response?.message || 'Failed to reject document');
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error(error.message || 'Failed to reject document');
    }
  };

  const handleBatchReject = async () => {
    if (!batchRejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const userDocuments = groupedDocuments[selectedUserForBatch].documents;
      const pendingDocuments = userDocuments.filter(
        doc => doc.status === 'PENDING'
      );

      // Reject all pending documents for this user
      const promises = pendingDocuments.map(doc =>
        documentService.verifyDocument(doc.id, {
          status: 'REJECTED',
          rejectionReason: batchRejectionReason,
        })
      );

      const results = await Promise.allSettled(promises);

      // Count successful rejections
      const successful = results.filter(
        result => result.status === 'fulfilled' && result.value?.success
      ).length;

      toast.success(
        `Rejected ${successful} documents for ${groupedDocuments[selectedUserForBatch].user.name}`
      );

      // Update the documents in the list
      setDocuments(prev =>
        prev.map(doc => {
          if (
            doc.user.id === selectedUserForBatch &&
            doc.status === 'PENDING'
          ) {
            return { ...doc, status: 'REJECTED' };
          }
          return doc;
        })
      );

      setIsBatchRejectOpen(false);
      setBatchRejectionReason('');
      setSelectedUserForBatch(null);
    } catch (error) {
      console.error('Error batch rejecting documents:', error);
      toast.error('Failed to batch reject documents');
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
        return <Badge variant='secondary'>Pending</Badge>;
      case 'APPROVED':
        return <Badge variant='default'>Approved</Badge>;
      case 'REJECTED':
        return <Badge variant='destructive'>Rejected</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Document Verification
        </h1>
        <p className='text-muted-foreground'>
          Review and verify user documents for account authentication
        </p>
      </div>

      {/* Filters */}
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <Filter className='h-5 w-5' />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='lg:col-span-2'>
            <Label htmlFor='search'>Search</Label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='search'
                placeholder='Search by user name, email, or document type...'
                className='pl-10'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor='status'>Status</Label>
            <Select
              value={filters.status}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Statuses</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='APPROVED'>Approved</SelectItem>
                <SelectItem value='REJECTED'>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='documentType'>Document Type</Label>
            <Select
              value={filters.documentType}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, documentType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Types</SelectItem>
                <SelectItem value='DRIVERS_LICENSE'>
                  Driver's License
                </SelectItem>
                <SelectItem value='ID_CARD'>ID Card</SelectItem>
                <SelectItem value='PASSPORT'>Passport</SelectItem>
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
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='text-xl'>Documents to Verify</CardTitle>
          <CardDescription>
            {Object.keys(groupedDocuments).length} users with documents found
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
              <h3 className='mt-4 text-lg font-medium'>No documents found</h3>
              <p className='mt-2 text-muted-foreground'>
                Try adjusting your filters or refresh the list.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {Object.entries(groupedDocuments).map(([userId, userData]) => {
                const isExpanded = expandedUsers[userId] || false;
                const pendingCount = userData.documents.filter(
                  doc => doc.status === 'PENDING'
                ).length;

                return (
                  <div
                    key={userId}
                    className='border rounded-lg bg-card transition-all hover:shadow-md'
                  >
                    {/* User Header */}
                    <div
                      className='flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer'
                      onClick={() => toggleUserExpand(userId)}
                    >
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 p-3 rounded-full'>
                          <User className='h-6 w-6 text-primary' />
                        </div>
                        <div>
                          <h3 className='font-semibold text-lg'>
                            {userData.user?.name || 'Unknown User'}
                          </h3>
                          <p className='text-sm text-muted-foreground'>
                            {userData.user?.email || 'No email provided'}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-4 mt-3 sm:mt-0'>
                        <div className='text-sm bg-secondary px-3 py-1 rounded-full'>
                          <span className='font-medium'>
                            {userData.documents.length}
                          </span>{' '}
                          documents
                          {pendingCount > 0 && (
                            <span className='ml-2 text-orange-600 font-medium'>
                              ({pendingCount} pending)
                            </span>
                          )}
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={e => {
                            e.stopPropagation();
                            toggleUserExpand(userId);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className='h-5 w-5' />
                          ) : (
                            <ChevronRight className='h-5 w-5' />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Batch Actions */}
                    {pendingCount > 0 && (
                      <div className='px-4 pb-4 flex flex-col sm:flex-row sm:justify-end gap-2 border-t pt-4 bg-muted/50'>
                        <Button
                          size='sm'
                          onClick={e => {
                            e.stopPropagation();
                            handleBatchApprove(userId);
                          }}
                          className='w-full sm:w-auto'
                        >
                          <CheckCircle className='h-4 w-4 mr-2' />
                          Approve All ({pendingCount})
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenBatchReject(userId);
                          }}
                          className='w-full sm:w-auto'
                        >
                          <XCircle className='h-4 w-4 mr-2' />
                          Reject All ({pendingCount})
                        </Button>
                      </div>
                    )}

                    {/* Documents List */}
                    {isExpanded && (
                      <div className='space-y-3 p-4 pt-0 border-t'>
                        {userData.documents.map(document => (
                          <div
                            key={document.id}
                            className='flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-background transition-colors hover:bg-muted/50 gap-4'
                          >
                            <div className='flex items-start gap-3'>
                              <div className='bg-muted p-2 rounded-lg mt-1'>
                                {getDocumentIcon(document.documentType)}
                              </div>
                              <div>
                                <h4 className='font-medium flex items-center gap-2'>
                                  {getDocumentTypeLabel(document.documentType)}
                                </h4>
                                <div className='flex flex-wrap items-center gap-2 mt-1'>
                                  {getStatusBadge(document.status)}
                                  <span className='text-xs text-muted-foreground flex items-center'>
                                    <Calendar className='h-3 w-3 mr-1' />
                                    {formatDate(document.uploadedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={e => {
                                  e.stopPropagation();
                                  handlePreview(document);
                                }}
                              >
                                <Eye className='h-4 w-4 mr-1' />
                                Preview
                              </Button>
                              {document.status === 'PENDING' && (
                                <>
                                  <Button
                                    size='sm'
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleApprove(document.id);
                                    }}
                                  >
                                    <CheckCircle className='h-4 w-4 mr-1' />
                                    Approve
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='destructive'
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleOpenReject(document);
                                    }}
                                  >
                                    <XCircle className='h-4 w-4 mr-1' />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
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
            <DialogTitle className='text-2xl'>Document Preview</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <h3 className='font-semibold text-lg flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    User Information
                  </h3>
                  <div className='space-y-3 p-4 bg-muted rounded-lg'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Name</span>
                      <span className='font-medium'>
                        {selectedDocument.user?.name || 'N/A'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Email</span>
                      <span className='font-medium'>
                        {selectedDocument.user?.email || 'N/A'}
                      </span>
                    </div>
                    {selectedDocument.user?.phone && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Phone</span>
                        <span className='font-medium'>
                          {selectedDocument.user.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-4'>
                  <h3 className='font-semibold text-lg flex items-center gap-2'>
                    <FileText className='h-5 w-5' />
                    Document Information
                  </h3>
                  <div className='space-y-3 p-4 bg-muted rounded-lg'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Type</span>
                      <span className='font-medium flex items-center gap-2'>
                        {getDocumentIcon(selectedDocument.documentType)}
                        {getDocumentTypeLabel(selectedDocument.documentType)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>File Name</span>
                      <span className='font-medium'>
                        {selectedDocument.fileName || 'N/A'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Status</span>
                      <span className='font-medium'>
                        {getStatusBadge(selectedDocument.status)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Uploaded</span>
                      <span className='font-medium'>
                        {formatDate(selectedDocument.uploadedAt)}
                      </span>
                    </div>
                    {selectedDocument.expiryDate && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Expires</span>
                        <span className='font-medium'>
                          {formatDate(selectedDocument.expiryDate)}
                        </span>
                      </div>
                    )}
                    {selectedDocument.documentNumber && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Document #
                        </span>
                        <span className='font-medium'>
                          {selectedDocument.documentNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <h3 className='font-semibold text-lg'>Document Preview</h3>
                {selectedDocument.fileUrl ? (
                  selectedDocument.mimeType === 'application/pdf' ? (
                    <iframe
                      src={selectedDocument.fileUrl}
                      className='w-full h-96 border rounded-lg'
                      title='Document Preview'
                    />
                  ) : (
                    <img
                      src={selectedDocument.fileUrl}
                      alt='Document Preview'
                      className='max-w-full h-auto border rounded-lg mx-auto'
                    />
                  )
                ) : (
                  <div className='text-center py-12 text-muted-foreground border rounded-lg'>
                    Preview not available
                  </div>
                )}
              </div>

              <div className='flex justify-end gap-3'>
                <Button
                  variant='outline'
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </Button>
                {selectedDocument.fileUrl && (
                  <a href={selectedDocument.fileUrl} download>
                    <Button>
                      <Download className='h-4 w-4 mr-2' />
                      Download
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
            <DialogTitle className='text-xl'>Reject Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <p>
                  Are you sure you want to reject{' '}
                  <strong>{selectedDocument.user?.name || 'the user'}</strong>'s
                  {getDocumentTypeLabel(selectedDocument.documentType)}?
                </p>
                <p className='text-sm text-muted-foreground'>
                  Please provide a reason for rejection. The user will be
                  notified and can re-upload their document.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='rejectionReason'>Rejection Reason</Label>
                <Textarea
                  id='rejectionReason'
                  placeholder='Enter reason for rejection...'
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
                  Cancel
                </Button>
                <Button variant='destructive' onClick={handleReject}>
                  Reject Document
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Batch Reject Document Dialog */}
      <Dialog open={isBatchRejectOpen} onOpenChange={setIsBatchRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-xl'>Reject All Documents</DialogTitle>
          </DialogHeader>
          {selectedUserForBatch && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <p>
                  Are you sure you want to reject all pending documents for{' '}
                  <strong>
                    {groupedDocuments[selectedUserForBatch].user?.name ||
                      'the user'}
                  </strong>
                  ?
                </p>
                <p className='text-sm text-muted-foreground'>
                  This will reject all{' '}
                  {
                    groupedDocuments[selectedUserForBatch].documents.filter(
                      doc => doc.status === 'PENDING'
                    ).length
                  }{' '}
                  pending documents. Please provide a reason for rejection. The
                  user will be notified and can re-upload their documents.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='batchRejectionReason'>Rejection Reason</Label>
                <Textarea
                  id='batchRejectionReason'
                  placeholder='Enter reason for rejection...'
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
                  Cancel
                </Button>
                <Button variant='destructive' onClick={handleBatchReject}>
                  Reject All Documents
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
