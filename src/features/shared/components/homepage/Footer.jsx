import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Separator } from '../ui/separator';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className='bg-background border-t'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <h3 className='text-3xl font-bold text-primary font-dancing'>
              {t('footer.companyName')}
            </h3>
            <p className='text-muted-foreground'>
              {t('footer.companyDescription')}
            </p>
          </div>

          <div className='space-y-4'>
            <h4 className='font-semibold text-foreground'>
              {t('footer.sections.product.title')}
            </h4>
            <ul className='space-y-2 text-muted-foreground'>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.product.features')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.product.pricing')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.product.api')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.product.integrations')}
                </a>
              </li>
            </ul>
          </div>

          <div className='space-y-4'>
            <h4 className='font-semibold text-foreground'>
              {t('footer.sections.company.title')}
            </h4>
            <ul className='space-y-2 text-muted-foreground'>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.company.about')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.company.blog')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.company.careers')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.company.contact')}
                </a>
              </li>
            </ul>
          </div>

          <div className='space-y-4'>
            <h4 className='font-semibold text-foreground'>
              {t('footer.sections.support.title')}
            </h4>
            <ul className='space-y-2 text-muted-foreground'>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.support.helpCenter')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.support.documentation')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.support.status')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-foreground transition-colors'>
                  {t('footer.sections.support.community')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className='my-8' />

        <div className='flex flex-col md:flex-row justify-between items-center'>
          <p className='text-muted-foreground text-sm'>
            {t('footer.copyright')}
          </p>
          <div className='flex space-x-6 mt-4 md:mt-0'>
            <Link
              to='/policy'
              className='text-muted-foreground hover:text-foreground transition-colors text-sm'
            >
              Chính sách & Quy định
            </Link>
            <a
              href='#'
              className='text-muted-foreground hover:text-foreground transition-colors text-sm'
            >
              {t('footer.legal.termsOfService')}
            </a>
            <a
              href='#'
              className='text-muted-foreground hover:text-foreground transition-colors text-sm'
            >
              {t('footer.legal.cookiePolicy')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
