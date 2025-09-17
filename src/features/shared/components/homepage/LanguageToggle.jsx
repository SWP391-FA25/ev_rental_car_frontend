import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'en'
      ? t('common.english')
      : t('common.vietnamese');
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={toggleLanguage}
      className='flex items-center gap-2'
    >
      <Globe className='h-4 w-4' />
      <span className='hidden sm:inline-block'>
        {getCurrentLanguageLabel()}
      </span>
    </Button>
  );
}
