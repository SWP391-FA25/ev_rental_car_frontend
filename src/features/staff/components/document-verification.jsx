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
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
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

    setFilteredDocuments(result);
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
        // Also update filtered documents
        setFilteredDocuments(prev =>
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
        // Also update filtered documents
        setFilteredDocuments(prev =>
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

  const handlePreview = document => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const handleOpenReject = document => {
    setSelectedDocument(document);
    setIsRejectOpen(true);
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

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Document Verification</h1>
        <p className='text-muted-foreground'>
          Review and verify user documents for account authentication
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1'>
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
              <SelectTrigger className='w-[180px]'>
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
              <SelectTrigger className='w-[180px]'>
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

          <div className='flex items-end'>
            <Button onClick={fetchDocuments} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents to Verify</CardTitle>
          <CardDescription>
            {filteredDocuments.length} documents found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center items-center h-32'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className='text-center py-8'>
              <FileText className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-2 text-sm font-medium'>No documents found</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                Try adjusting your filters or refresh the list.
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
                        {document.user?.name || 'Unknown User'}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {document.user?.email || 'No email provided'}
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
                      Uploaded: {formatDate(document.uploadedAt)}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handlePreview(document)}
                      >
                        <Eye className='h-4 w-4 mr-1' />
                        Preview
                      </Button>
                      {document.status === 'PENDING' && (
                        <>
                          <Button
                            size='sm'
                            onClick={() => handleApprove(document.id)}
                          >
                            <CheckCircle className='h-4 w-4 mr-1' />
                            Approve
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => handleOpenReject(document)}
                          >
                            <XCircle className='h-4 w-4 mr-1' />
                            Reject
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
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h3 className='font-medium flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    User Information
                  </h3>
                  <div className='mt-2 space-y-2'>
                    <p>
                      <strong>Name:</strong>{' '}
                      {selectedDocument.user?.name || 'N/A'}
                    </p>
                    <p>
                      <strong>Email:</strong>{' '}
                      {selectedDocument.user?.email || 'N/A'}
                    </p>
                    {selectedDocument.user?.phone && (
                      <p>
                        <strong>Phone:</strong> {selectedDocument.user.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className='font-medium flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    Document Information
                  </h3>
                  <div className='mt-2 space-y-2'>
                    <p>
                      <strong>Type:</strong>{' '}
                      {getDocumentTypeLabel(selectedDocument.documentType)}
                    </p>
                    <p>
                      <strong>File Name:</strong>{' '}
                      {selectedDocument.fileName || 'N/A'}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      {getStatusBadge(selectedDocument.status)}
                    </p>
                    <p>
                      <strong>Uploaded:</strong>{' '}
                      {formatDate(selectedDocument.uploadedAt)}
                    </p>
                    {selectedDocument.expiryDate && (
                      <p>
                        <strong>Expires:</strong>{' '}
                        {formatDate(selectedDocument.expiryDate)}
                      </p>
                    )}
                    {selectedDocument.documentNumber && (
                      <p>
                        <strong>Document #:</strong>{' '}
                        {selectedDocument.documentNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-medium mb-2'>Document Preview</h3>
                {selectedDocument.fileUrl ? (
                  selectedDocument.mimeType === 'application/pdf' ? (
                    <iframe
                      src={selectedDocument.fileUrl}
                      className='w-full h-96 border rounded'
                      title='Document Preview'
                    />
                  ) : (
                    <img
                      src={selectedDocument.fileUrl}
                      alt='Document Preview'
                      className='max-w-full h-auto border rounded'
                    />
                  )
                ) : (
                  <div className='text-center py-8 text-muted-foreground'>
                    Preview not available
                  </div>
                )}
              </div>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </Button>
                {selectedDocument.fileUrl && (
                  <a href={selectedDocument.fileUrl} download>
                    <Button>
                      <Download className='h-4 w-4 mr-1' />
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
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className='space-y-4'>
              <div>
                <p className='mb-2'>
                  Are you sure you want to reject{' '}
                  <strong>{selectedDocument.user?.name || 'the user'}</strong>'s
                  {getDocumentTypeLabel(selectedDocument.documentType)}?
                </p>
                <p className='text-sm text-muted-foreground mb-4'>
                  Please provide a reason for rejection. The user will be
                  notified and can re-upload their document.
                </p>
              </div>

              <div>
                <Label htmlFor='rejectionReason'>Rejection Reason</Label>
                <Textarea
                  id='rejectionReason'
                  placeholder='Enter reason for rejection...'
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>

              <DialogFooter>
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
    </div>
  );
};

export default DocumentVerification;
