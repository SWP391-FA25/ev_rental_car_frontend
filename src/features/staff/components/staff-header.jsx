import { Search } from 'lucide-react';
import { ThemeToggle } from '../../shared/components/homepage/ThemeToggle';
import { NotificationBell } from '../../shared/components/NotificationBell';
import { Input } from '../../shared/components/ui/input';
import { Separator } from '../../shared/components/ui/separator';
import { SidebarTrigger } from '../../shared/components/ui/sidebar';

export function StaffHeader() {
  return (
    <header className='flex h-16 shrink-0 justify-between items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <h1 className='text-lg font-semibold'>Staff Dashboard</h1>
      </div>

      <div className='ml-auto flex items-center gap-2 px-4'>
        {/* Search */}
        <div className='relative hidden md:block'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder={'Search customers, cars, rentals...'}
            className='w-[300px] pl-8'
          />
        </div>

        {/* ThemeToggle */}
        <ThemeToggle />
        {/* Quick Actions */}
        {/* <Button variant='ghost' size='sm' className='gap-2'>
          <MessageSquare className='h-4 w-4' />
          <span className='hidden sm:inline'>{t('staffHeader.support')}</span>
          <Badge
            variant='destructive'
            className='h-5 w-5 rounded-full p-0 text-xs'
          >
            3
          </Badge>
        </Button> */}

        <NotificationBell />
      </div>
    </header>
  );
}
