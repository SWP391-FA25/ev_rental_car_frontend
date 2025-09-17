import {
  Award,
  Clock,
  CreditCard,
  HeadphonesIcon,
  Leaf,
  Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

export default function WhyChooseUsSection() {
  const { t } = useTranslation();

  const reasons = [
    {
      icon: Shield,
      titleKey: 'whyChooseUs.reasons.trustedSecure.title',
      descriptionKey: 'whyChooseUs.reasons.trustedSecure.description',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Clock,
      titleKey: 'whyChooseUs.reasons.availability.title',
      descriptionKey: 'whyChooseUs.reasons.availability.description',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Award,
      titleKey: 'whyChooseUs.reasons.premiumQuality.title',
      descriptionKey: 'whyChooseUs.reasons.premiumQuality.description',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      icon: CreditCard,
      titleKey: 'whyChooseUs.reasons.flexiblePricing.title',
      descriptionKey: 'whyChooseUs.reasons.flexiblePricing.description',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Leaf,
      titleKey: 'whyChooseUs.reasons.ecoFriendly.title',
      descriptionKey: 'whyChooseUs.reasons.ecoFriendly.description',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      icon: HeadphonesIcon,
      titleKey: 'whyChooseUs.reasons.expertSupport.title',
      descriptionKey: 'whyChooseUs.reasons.expertSupport.description',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <section className='py-20 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-foreground mb-4'>
            {t('whyChooseUs.title')}
          </h2>
          <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
            {t('whyChooseUs.description')}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
          {reasons.map((reason, index) => {
            const IconComponent = reason.icon;
            return (
              <Card
                key={index}
                className='hover:shadow-lg transition-all duration-300 group border-0 shadow-sm'
              >
                <CardHeader className='text-center pb-4'>
                  <div
                    className={`w-16 h-16 ${reason.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={`w-8 h-8 ${reason.color}`} />
                  </div>
                  <CardTitle className='text-xl font-bold text-foreground mb-2'>
                    {t(reason.titleKey)}
                  </CardTitle>
                </CardHeader>
                <CardContent className='text-center pt-0'>
                  <CardDescription className='text-base text-muted-foreground leading-relaxed'>
                    {t(reason.descriptionKey)}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className='mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-primary mb-2'>10,000+</div>
            <div className='text-muted-foreground'>
              {t('whyChooseUs.stats.happyCustomers')}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-primary mb-2'>500+</div>
            <div className='text-muted-foreground'>
              {t('whyChooseUs.stats.premiumVehicles')}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-primary mb-2'>50+</div>
            <div className='text-muted-foreground'>
              {t('whyChooseUs.stats.citiesCovered')}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-primary mb-2'>24/7</div>
            <div className='text-muted-foreground'>
              {t('whyChooseUs.stats.customerSupport')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
