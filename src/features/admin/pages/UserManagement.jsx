import { FilterIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useState } from 'react';
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

export default function UserManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const { users, loading, createUser, suspendUser, deleteUser } = useUsers();

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      user.accountStatus?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = userId => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
  };

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'secondary';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('userManagement.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('userManagement.description')}
          </p>
        </div>
        <Button onClick={() => setIsCreateFormOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t('userManagement.buttons.addUser')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('userManagement.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FilterIcon className="mr-2 h-4 w-4" />
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
            <DropdownMenuItem onClick={() => setFilterStatus('suspended')}>
              {t('userManagement.badges.suspended')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('banned')}>
              Banned
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
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
                <TableCell colSpan={6} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
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
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(user.id)}
                        >
                          {t('userManagement.action.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToSuspend(user.id);
                            setSuspendDialogOpen(true);
                          }}
                          className="text-orange-600"
                        >
                          {t('userManagement.action.suspend')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToDelete(user.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-sm text-muted-foreground">
            {t('userManagement.stats.totalUsers')}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {users.filter(u => u.accountStatus === 'ACTIVE').length}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('userManagement.stats.activeUsers')}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {users.filter(u => u.accountStatus === 'SUSPENDED').length}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('userManagement.stats.suspendedUsers')}
          </div>
        </div>
      </div>

      {/* Details */}
      <UserDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        userId={selectedUserId}
      />

      {/* Form */}
      <UserForm
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        createUser={createUser}
      />

      {/* Confirm */}
      <ConfirmDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        title={t('common.suspend')}
        description={t('userManagement.confirmSuspend')}
        onConfirm={() => {
          if (userToSuspend) {
            suspendUser(userToSuspend);
            setUserToSuspend(null);
          }
        }}
        confirmText={t('common.suspend')}
        cancelText={t('common.cancel')}
        confirmVariant="destructive"
      />

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
        confirmVariant="destructive"
      />
    </div>
  );
}
