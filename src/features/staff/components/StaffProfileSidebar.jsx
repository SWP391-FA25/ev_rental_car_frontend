import { useAuth } from '@/app/providers/AuthProvider';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/features/shared/components/ui/avatar';
import { Card } from '@/features/shared/components/ui/card';
import { Separator } from '@/features/shared/components/ui/separator';
import { Button } from '@/features/shared/components/ui/button';
import { Calendar, Settings, User2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const menuItems = [
  { id: 'profile', icon: User2 },
  { id: 'settings', icon: Settings },
];

export default function StaffProfileSidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const displayName = user?.name || user?.email || 'Staff';
  const initials = (() => {
    const name = displayName || '';
    const parts = name.trim().split(' ').filter(Boolean);
    const first = parts[0]?.[0] || 'S';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  })();

  const labelFor = id => {
    switch (id) {
      case 'profile':
        return t('staffSidebar.profile');
      case 'settings':
        return t('staffSidebar.settings');
      default:
        return id;
    }
  };

  return (
    <div className='h-full bg-background'>
      <Card className='m-4 p-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-12 w-12'>
            <AvatarImage src={user?.avatar || ''} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className='text-sm font-semibold'>{displayName}</div>
            <div className='text-xs text-muted-foreground'>
              {user?.email || ''}
            </div>
          </div>
        </div>
      </Card>

      <Separator />

      <nav className='p-4 flex-1'>
        <ul className='space-y-2'>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${
                    isActive ? 'bg-amber-400 text-black hover:bg-amber-400' : ''
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className='h-5 w-5' />
                  <span className='font-medium'>{labelFor(item.id)}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
