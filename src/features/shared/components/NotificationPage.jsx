import { format, formatDistanceToNow } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../../app/providers/useNotifications';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function NotificationPage() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();
  const { t, i18n } = useTranslation();
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, read, unread
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10;
  const locale = i18n.language === 'vi' ? vi : enUS;

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications based on filter and search term
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'read' && notification.read) ||
      (filter === 'unread' && !notification.read);

    const matchesSearch =
      searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'priority':
        return b.priority - a.priority;
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination
  const totalPages = Math.ceil(
    sortedNotifications.length / notificationsPerPage
  );
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const paginatedNotifications = sortedNotifications.slice(
    startIndex,
    startIndex + notificationsPerPage
  );

  const handleSelectAll = checked => {
    if (checked) {
      setSelectedNotifications(paginatedNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (id, checked) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, id]);
    } else {
      setSelectedNotifications(prev =>
        prev.filter(notificationId => notificationId !== id)
      );
    }
  };

  const handleMarkSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedNotifications) {
      await deleteNotification(id);
    }
    setSelectedNotifications([]);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setSelectedNotifications([]);
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
    setSelectedNotifications([]);
  };

  const getNotificationIcon = type => {
    switch (type) {
      case 'SUCCESS':
        return <Check className='h-5 w-5 text-green-500' />;
      case 'ERROR':
        return <X className='h-5 w-5 text-red-500' />;
      case 'WARNING':
        return <AlertTriangle className='h-5 w-5 text-yellow-500' />;
      default:
        return <Info className='h-5 w-5 text-blue-500' />;
    }
  };

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

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='container py-6'>
      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-6 w-6' />
                {t('notifications.title')}
              </CardTitle>
              <CardDescription>
                {t('notifications.description', {
                  count: notifications.length,
                })}
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                {t('notifications.markAllAsRead')}
              </Button>
              <Button
                variant='destructive'
                onClick={handleDeleteAll}
                disabled={notifications.length === 0}
              >
                {t('notifications.deleteAll')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className='flex flex-col md:flex-row gap-4 mb-6'>
            <div className='flex-1'>
              <Input
                placeholder={t('notifications.search')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full'
              />
            </div>
            <div className='flex gap-2'>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className='w-[120px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>
                    {t('notifications.filters.all')}
                  </SelectItem>
                  <SelectItem value='read'>
                    {t('notifications.filters.read')}
                  </SelectItem>
                  <SelectItem value='unread'>
                    {t('notifications.filters.unread')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>
                    {t('notifications.sort.newest')}
                  </SelectItem>
                  <SelectItem value='oldest'>
                    {t('notifications.sort.oldest')}
                  </SelectItem>
                  <SelectItem value='priority'>
                    {t('notifications.sort.priority')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className='flex gap-2 mb-4 p-3 bg-muted rounded-md'>
              <Checkbox
                checked={
                  selectedNotifications.length ===
                    paginatedNotifications.length &&
                  paginatedNotifications.length > 0
                }
                onCheckedChange={handleSelectAll}
                id='select-all'
              />
              <label
                htmlFor='select-all'
                className='mr-4 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                {t('notifications.selectAll')}
              </label>
              <Button
                variant='outline'
                size='sm'
                onClick={handleMarkSelectedAsRead}
              >
                <Eye className='h-4 w-4 mr-2' />
                {t('notifications.markAsRead')}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleDeleteSelected}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                {t('notifications.delete')}
              </Button>
              <span className='ml-2 text-sm text-muted-foreground'>
                {t('notifications.selected', {
                  count: selectedNotifications.length,
                })}
              </span>
            </div>
          )}

          {/* Notifications List */}
          <div className='space-y-2'>
            {paginatedNotifications.length === 0 ? (
              <div className='text-center py-12'>
                <Bell className='mx-auto h-12 w-12 text-muted-foreground' />
                <h3 className='mt-4 text-lg font-medium'>
                  {t('notifications.empty.title')}
                </h3>
                <p className='mt-1 text-muted-foreground'>
                  {searchTerm || filter !== 'all'
                    ? t('notifications.empty.filtered')
                    : t('notifications.empty.default')}
                </p>
              </div>
            ) : (
              paginatedNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    !notification.read ? 'bg-muted' : ''
                  }`}
                >
                  <div className='flex items-start gap-4'>
                    <div className='mt-1'>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className='flex-1'>
                      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2'>
                        <div>
                          <h3
                            className={`font-medium ${
                              !notification.read
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p className='text-sm text-muted-foreground mt-1'>
                            {notification.message}
                          </p>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {getTypeBadge(notification.type)}
                          {getPriorityBadge(notification.priority)}
                        </div>
                      </div>
                      <div className='flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground'>
                        <span>
                          {format(new Date(notification.createdAt), 'PPp', {
                            locale,
                          })}
                        </span>
                        <span>
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true, locale }
                          )}
                        </span>
                        {notification.expiresAt && (
                          <span>
                            {t('notifications.expires')}{' '}
                            {formatDistanceToNow(
                              new Date(notification.expiresAt),
                              { addSuffix: true, locale }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                      <Checkbox
                        checked={selectedNotifications.includes(
                          notification.id
                        )}
                        onCheckedChange={checked =>
                          handleSelectNotification(notification.id, checked)
                        }
                      />
                      <div className='flex flex-col gap-1'>
                        {!notification.read && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Eye className='h-4 w-4' />
                            <span className='sr-only'>
                              {t('notifications.markAsRead')}
                            </span>
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                          <span className='sr-only'>
                            {t('notifications.delete')}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between mt-6'>
              <div className='text-sm text-muted-foreground'>
                {t('notifications.pagination.showing', {
                  start: startIndex + 1,
                  end: Math.min(
                    startIndex + notificationsPerPage,
                    sortedNotifications.length
                  ),
                  total: sortedNotifications.length,
                })}
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <div className='text-sm font-medium'>
                  {t('notifications.pagination.page', {
                    current: currentPage,
                    total: totalPages,
                  })}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage(prev => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
