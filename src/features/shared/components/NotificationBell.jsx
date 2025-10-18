import { formatDistanceToNow } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import { Bell, Check, Eye, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../../app/providers/useNotifications';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const locale = i18n.language === 'vi' ? vi : enUS;

  // Get recent notifications (limit to 5)
  const recentNotifications = notifications.slice(0, 5);

  const handleMarkAsRead = async id => {
    await markAsRead(id);
  };

  const handleDelete = async id => {
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAllNotifications = async () => {
    // Gọi API xóa all
    await deleteAllNotifications();

    // Đóng dropdown sau khi xóa
    setOpen(false);
  };

  const getNotificationIcon = type => {
    switch (type) {
      case 'SUCCESS':
        return <Check className='h-4 w-4 text-green-500' />;
      case 'WARNING':
        return <Bell className='h-4 w-4 text-yellow-500' />;
      case 'ERROR':
        return <X className='h-4 w-4 text-red-500' />;
      default:
        return <Bell className='h-4 w-4 text-blue-500' />;
    }
  };

  const getPriorityBadge = priority => {
    switch (priority) {
      case 3:
        return <Badge variant='destructive'>High</Badge>;
      case 2:
        return <Badge variant='default'>Medium</Badge>;
      case 1:
      default:
        return <Badge variant='secondary'>Low</Badge>;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='relative gap-2'>
          <Bell className='h-4 w-4' />
          <span className='sr-only'>Notifications</span>
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align='end'>
        <DropdownMenuLabel className='flex items-center justify-between'>
          <span>{t('notifications.title')}</span>
          {notifications.length > 0 && (
            <div className='flex items-center gap-1'>
              {/* Mark All as Read button */}
              {unreadCount > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleMarkAllAsRead}
                  className='h-6 px-2 text-xs'
                >
                  {t('notifications.markAllAsRead')}
                </Button>
              )}
              {/* Clear All button */}
              <Button
                variant='ghost'
                size='sm'
                onClick={handleClearAllNotifications}
                className='h-6 px-2 text-xs text-destructive hover:bg-destructive/10'
              >
                {t('notifications.clearAll')}
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {recentNotifications.length === 0 ? (
            <div className='p-4 text-center text-sm text-muted-foreground'>
              {t('notifications.noNotifications')}
            </div>
          ) : (
            <ScrollArea className='h-80'>
              {recentNotifications.map(notification => (
                <DropdownMenuItem
                  key={notification.id}
                  className='flex flex-col items-start p-3 focus:bg-muted'
                  onSelect={e => e.preventDefault()}
                >
                  <div className='flex w-full items-start gap-2'>
                    <div className='mt-0.5'>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className='flex-1 space-y-1'>
                      <p
                        className={`text-sm font-medium leading-none ${
                          !notification.read
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {notification.message}
                      </p>
                      <div className='flex items-center justify-between'>
                        <p className='text-xs text-muted-foreground'>
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true, locale }
                          )}
                        </p>
                        {getPriorityBadge(notification.priority)}
                      </div>
                    </div>
                    <div className='flex flex-col gap-1'>
                      {!notification.read && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6'
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Eye className='h-3 w-3' />
                          <span className='sr-only'>Mark as read</span>
                        </Button>
                      )}
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className='h-3 w-3' />
                        <span className='sr-only'>Delete</span>
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}
        </DropdownMenuGroup>
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem asChild>
          <a href='/notifications' className='w-full text-center'>
            {t('notifications.viewAll')}
          </a>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
