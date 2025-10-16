import { format, formatDistanceToNow } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Eye,
  Info,
  Plus,
  Search,
  Send,
  Trash2,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../shared/components/ui/dialog';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui/table';
import { Textarea } from '../../shared/components/ui/textarea';
import { apiClient } from '../../shared/lib/apiClient';

export default function NotificationManagement() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'INFO',
    priority: 1,
  });
  const [broadcastNotification, setBroadcastNotification] = useState({
    userIds: [],
    title: '',
    message: '',
    type: 'INFO',
    priority: 1,
  });
  const [users, setUsers] = useState([]);
  const locale = i18n.language === 'vi' ? vi : enUS;

  // Fetch notifications
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/api/notifications/all?page=${page}&limit=10`
      );
      if (response.success) {
        setNotifications(response.data.notifications);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(response.data.pagination.page);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(t('admins.notifications.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for notification targeting
  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/renters');
      if (response.success) {
        setUsers(response.data.renters);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  // Handle create notification
  const handleCreateNotification = async () => {
    try {
      const response = await apiClient.post(
        '/api/notifications',
        newNotification
      );
      if (response.success) {
        toast.success(t('admins.notifications.createSuccess'));
        setIsCreateDialogOpen(false);
        setNewNotification({
          userId: '',
          title: '',
          message: '',
          type: 'INFO',
          priority: 1,
        });
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error(t('admins.notifications.createError'));
    }
  };

  // Handle broadcast notification
  const handleBroadcastNotification = async () => {
    try {
      // For demo purposes, we'll broadcast to all users
      const userIds = users.map(user => user.id);
      const response = await apiClient.post('/api/notifications/broadcast', {
        ...broadcastNotification,
        userIds,
      });
      if (response.success) {
        toast.success(t('admins.notifications.broadcastSuccess'));
        setIsBroadcastDialogOpen(false);
        setBroadcastNotification({
          userIds: [],
          title: '',
          message: '',
          type: 'INFO',
          priority: 1,
        });
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      toast.error(t('admins.notifications.broadcastError'));
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async id => {
    try {
      const response = await apiClient.delete(`/api/notifications/${id}/admin`);
      if (response.success) {
        toast.success(t('admins.notifications.deleteSuccess'));
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(t('admins.notifications.deleteError'));
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch =
      searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.user &&
        (notification.user.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          notification.user.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase())));

    const matchesType =
      filterType === 'all' || notification.type === filterType;
    const matchesPriority =
      filterPriority === 'all' ||
      notification.priority.toString() === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  // Get notification icon by type
  const getNotificationIcon = type => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'WARNING':
        return <AlertTriangle className='h-4 w-4 text-yellow-500' />;
      case 'ERROR':
        return <AlertCircle className='h-4 w-4 text-red-500' />;
      default:
        return <Info className='h-4 w-4 text-blue-500' />;
    }
  };

  // Get notification type badge
  const getTypeBadge = type => {
    switch (type) {
      case 'SUCCESS':
        return (
          <Badge variant='default'>{t('notifications.types.success')}</Badge>
        );
      case 'ERROR':
        return (
          <Badge variant='destructive'>{t('notifications.types.error')}</Badge>
        );
      case 'WARNING':
        return (
          <Badge variant='secondary'>{t('notifications.types.warning')}</Badge>
        );
      default:
        return <Badge variant='outline'>{t('notifications.types.info')}</Badge>;
    }
  };

  // Get priority badge
  const getPriorityBadge = priority => {
    switch (priority) {
      case 3:
        return (
          <Badge variant='destructive'>
            {t('notifications.priority.high')}
          </Badge>
        );
      case 2:
        return (
          <Badge variant='default'>{t('notifications.priority.medium')}</Badge>
        );
      case 1:
      default:
        return (
          <Badge variant='secondary'>{t('notifications.priority.low')}</Badge>
        );
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('admins.notifications.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('admins.notifications.description')}
          </p>
        </div>
        <div className='flex gap-2'>
          <Dialog
            open={isBroadcastDialogOpen}
            onOpenChange={setIsBroadcastDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsBroadcastDialogOpen(true)}>
                <Send className='mr-2 h-4 w-4' />
                {t('admins.notifications.broadcast')}
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>
                  {t('admins.notifications.broadcastTitle')}
                </DialogTitle>
                <DialogDescription>
                  {t('admins.notifications.broadcastDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='broadcastTitle'>
                    {t('admins.notifications.titleField')}
                  </Label>
                  <Input
                    id='broadcastTitle'
                    value={broadcastNotification.title}
                    onChange={e =>
                      setBroadcastNotification({
                        ...broadcastNotification,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='broadcastMessage'>
                    {t('admins.notifications.messageField')}
                  </Label>
                  <Textarea
                    id='broadcastMessage'
                    value={broadcastNotification.message}
                    onChange={e =>
                      setBroadcastNotification({
                        ...broadcastNotification,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='broadcastType'>
                      {t('admins.notifications.type')}
                    </Label>
                    <Select
                      value={broadcastNotification.type}
                      onValueChange={value =>
                        setBroadcastNotification({
                          ...broadcastNotification,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='INFO'>Info</SelectItem>
                        <SelectItem value='SUCCESS'>Success</SelectItem>
                        <SelectItem value='WARNING'>Warning</SelectItem>
                        <SelectItem value='ERROR'>Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='broadcastPriority'>
                      {t('admins.notifications.priority')}
                    </Label>
                    <Select
                      value={broadcastNotification.priority.toString()}
                      onValueChange={value =>
                        setBroadcastNotification({
                          ...broadcastNotification,
                          priority: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='1'>
                          {t('notifications.priority.low')}
                        </SelectItem>
                        <SelectItem value='2'>
                          {t('notifications.priority.medium')}
                        </SelectItem>
                        <SelectItem value='3'>
                          {t('notifications.priority.high')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsBroadcastDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleBroadcastNotification}>
                  {t('admins.notifications.send')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className='mr-2 h-4 w-4' />
                {t('admins.notifications.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>
                  {t('admins.notifications.createTitle')}
                </DialogTitle>
                <DialogDescription>
                  {t('admins.notifications.createDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='userId'>
                    {t('admins.notifications.user')}
                  </Label>
                  <Select
                    value={newNotification.userId}
                    onValueChange={value =>
                      setNewNotification({ ...newNotification, userId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('admins.notifications.selectUser')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='notificationTitle'>
                    {t('admins.notifications.titleField')}
                  </Label>
                  <Input
                    id='notificationTitle'
                    value={newNotification.title}
                    onChange={e =>
                      setNewNotification({
                        ...newNotification,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='notificationMessage'>
                    {t('admins.notifications.messageField')}
                  </Label>
                  <Textarea
                    id='notificationMessage'
                    value={newNotification.message}
                    onChange={e =>
                      setNewNotification({
                        ...newNotification,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='notificationType'>
                      {t('admins.notifications.type')}
                    </Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={value =>
                        setNewNotification({ ...newNotification, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='INFO'>Info</SelectItem>
                        <SelectItem value='SUCCESS'>Success</SelectItem>
                        <SelectItem value='WARNING'>Warning</SelectItem>
                        <SelectItem value='ERROR'>Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='notificationPriority'>
                      {t('admins.notifications.priority')}
                    </Label>
                    <Select
                      value={newNotification.priority.toString()}
                      onValueChange={value =>
                        setNewNotification({
                          ...newNotification,
                          priority: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='1'>
                          {t('notifications.priority.low')}
                        </SelectItem>
                        <SelectItem value='2'>
                          {t('notifications.priority.medium')}
                        </SelectItem>
                        <SelectItem value='3'>
                          {t('notifications.priority.high')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleCreateNotification}>
                  {t('admins.notifications.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='h-5 w-5' />
              {t('admins.notifications.notificationsList')}
            </CardTitle>
            <div className='flex flex-col sm:flex-row gap-2'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder={t('admins.notifications.search')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-8 w-full sm:w-[200px]'
                />
              </div>
              <div className='flex gap-2'>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className='w-[120px]'>
                    <SelectValue
                      placeholder={t('admins.notifications.filterType')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('notifications.filters.all')}
                    </SelectItem>
                    <SelectItem value='INFO'>
                      {t('notifications.types.info')}
                    </SelectItem>
                    <SelectItem value='SUCCESS'>
                      {t('notifications.types.success')}
                    </SelectItem>
                    <SelectItem value='WARNING'>
                      {t('notifications.types.warning')}
                    </SelectItem>
                    <SelectItem value='ERROR'>
                      {t('notifications.types.error')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                >
                  <SelectTrigger className='w-[120px]'>
                    <SelectValue
                      placeholder={t('admins.notifications.filterPriority')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('notifications.filters.all')}
                    </SelectItem>
                    <SelectItem value='1'>
                      {t('notifications.priority.low')}
                    </SelectItem>
                    <SelectItem value='2'>
                      {t('notifications.priority.medium')}
                    </SelectItem>
                    <SelectItem value='3'>
                      {t('notifications.priority.high')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className='text-center py-12'>
              <Bell className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-4 text-lg font-medium'>
                {t('admins.notifications.noNotifications')}
              </h3>
              <p className='mt-1 text-muted-foreground'>
                {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                  ? t('admins.notifications.noFilteredNotifications')
                  : t('admins.notifications.noNotificationsDefault')}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admins.notifications.user')}</TableHead>
                    <TableHead>{t('admins.notifications.title')}</TableHead>
                    <TableHead>{t('admins.notifications.type')}</TableHead>
                    <TableHead>{t('admins.notifications.priority')}</TableHead>
                    <TableHead>{t('admins.notifications.date')}</TableHead>
                    <TableHead className='text-right'>
                      {t('admins.notifications.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map(notification => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-muted-foreground' />
                          <div>
                            <div className='font-medium'>
                              {notification.user
                                ? notification.user.name
                                : 'Unknown User'}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {notification.user
                                ? notification.user.email
                                : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='font-medium'>{notification.title}</div>
                        <div className='text-sm text-muted-foreground line-clamp-2'>
                          {notification.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getNotificationIcon(notification.type)}
                          {getTypeBadge(notification.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(notification.priority)}
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          {format(new Date(notification.createdAt), 'PP', {
                            locale,
                          })}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true, locale }
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button variant='outline' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className='flex items-center justify-between mt-4'>
                  <div className='text-sm text-muted-foreground'>
                    {t('admins.notifications.pageInfo', {
                      current: currentPage,
                      total: totalPages,
                    })}
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => fetchNotifications(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {t('admins.notifications.previous')}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => fetchNotifications(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {t('admins.notifications.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
