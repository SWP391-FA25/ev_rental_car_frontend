import { ThemeToggle } from '../../shared/components/homepage/ThemeToggle';
import LanguageToggle from '../../shared/components/homepage/LanguageToggle';
import { Separator } from '../../shared/components/ui/separator';
import { SidebarTrigger } from '../../shared/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

export function SiteHeader() {
  const { t } = useTranslation();

  return (
    <header className='group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear'>
      <div className='flex w-full items-center gap-10 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4'
        />
        <h1 className='text-base font-medium'>{t('admin.header.title')}</h1>
        <div className='ml-auto flex items-center gap-2'>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
