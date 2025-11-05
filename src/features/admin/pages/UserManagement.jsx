import {
  FilterIcon,
  PlusIcon,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { MoreVerticalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import { ConfirmDialog } from '../../shared/components/ui/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import { Input } from '../../shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui/table';
import UserDetails from '../components/renter/UserDetails';
import { UserForm } from '../components/renter/UserForm';
import { useUsers } from '../hooks/useUsers';
import DocumentVerification from '../../staff/components/document-verification';

export default function UserManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDocVerifyOpen, setIsDocVerifyOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { users, loading, createUser, updateUser, deleteUser, fetchUsers } =
    useUsers();

  // Pagination state: 10 users per page
  const [page, setPage] = useState(1);
  const limit = 10;

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      user.accountStatus?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Derived pagination data
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / limit));
  const currentUsers = filteredUsers.slice((page - 1) * limit, page * limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  const handleViewDetails = userId => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
  };

  const handleViewDocuments = userId => {
    setSelectedUserId(userId);
    setIsDocVerifyOpen(true);
  };

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

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('userManagement.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('userManagement.description')}
          </p>
        </div>
        <Button onClick={() => setIsCreateFormOpen(true)}>
          <PlusIcon className='mr-2 h-4 w-4' />
          {t('userManagement.buttons.addUser')}
        </Button>
      </div>

      {/* Stats (moved to top) */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>{users.length}</div>
          <div className='text-sm text-muted-foreground'>
            {t('userManagement.stats.totalUsers')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {users.filter(u => u.accountStatus === 'ACTIVE').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('userManagement.stats.activeUsers')}
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-2xl font-bold'>
            {users.filter(u => u.accountStatus === 'BANNED').length}
          </div>
          <div className='text-sm text-muted-foreground'>
            Banned Users
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('userManagement.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='mr-2 h-4 w-4' />
              {t('userManagement.statusLabel')}:{' '}
              {filterStatus === 'all'
                ? t('userManagement.statusAll')
                : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('all')}>
              {t('userManagement.statusAll')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('active')}>
              {t('userManagement.badges.active')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('banned')}>
              Banned
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Users Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('userManagement.table.name')}</TableHead>
              <TableHead>{t('userManagement.table.email')}</TableHead>
              <TableHead>{t('userManagement.table.phone')}</TableHead>
              <TableHead>{t('userManagement.table.status')}</TableHead>
              <TableHead>{t('userManagement.table.joinDate')}</TableHead>
              <TableHead>{t('userManagement.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8'>
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-center py-8 text-muted-foreground'
                >
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.accountStatus)}>
                      {user.accountStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreVerticalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(user.id)}
                        >
                          {t('userManagement.action.viewDetails')}
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem
                          onClick={() => handleViewDocuments(user.id)}
                        >
                          {t('staffSidebar.documents')}
                        </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToDelete(user.id);
                            setDeleteDialogOpen(true);
                          }}
                          className='text-red-600'
                        >
                          {t('userManagement.action.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls (match Customer Management style) */}
      <div className='flex items-center justify-between px-4 py-3 border-t'>
        <div className='text-sm text-muted-foreground'>
          Hiển thị {filteredUsers.length === 0 ? 0 : startIndex + 1}–
          {Math.min(endIndex, filteredUsers.length)} trong{' '}
          {filteredUsers.length} người dùng
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className='mr-1 h-4 w-4' />
            Trước
          </Button>
          <span className='text-sm'>
            Trang {page}/{totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Sau
            <ChevronRight className='ml-1 h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Details */}
      <UserDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        userId={selectedUserId}
        onUserUpdated={(updatedUser) => {
          // Refresh the users list after update
          fetchUsers();
        }}
      />

      {/* Document Verification
      <Dialog open={isDocVerifyOpen} onOpenChange={setIsDocVerifyOpen}>
        <DialogContent className='max-w-5xl'>
          <DialogHeader>
            <DialogTitle>{t('staffSidebar.documents')}</DialogTitle>
            <DialogDescription>
              {t('staffDocuments.description', {
                defaultValue: 'Verify customer documents',
              })}
            </DialogDescription>
          </DialogHeader>
          <DocumentVerification
            userId={selectedUserId}
            onVerificationUpdated={() => {
              // Sau khi duyệt/từ chối tài liệu, làm mới danh sách
              // để hiển thị trạng thái và ảnh tài liệu mới nhất.
              fetchUsers();
            }}
          />
        </DialogContent>
      </Dialog> */}

      {/* Form */}
      <UserForm
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        createUser={createUser}
      />

      {/* Confirm */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('common.delete')}
        description={t('userManagement.confirmDelete')}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete);
            setUserToDelete(null);
          }
        }}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant='destructive'
      />
    </div>
  );
}
