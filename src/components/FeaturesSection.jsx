import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Smart Fleet Management',
      description:
        'AI-powered vehicle tracking and maintenance scheduling for optimal fleet performance.',
      badge: 'AI Powered',
    },
    {
      title: 'Real-time Analytics',
      description:
        'Comprehensive dashboards with live data insights and predictive analytics.',
      badge: 'Analytics',
    },
    {
      title: 'Mobile App Integration',
      description:
        'Seamless mobile experience for customers and fleet managers on the go.',
      badge: 'Mobile',
    },
    {
      title: 'Automated Billing',
      description:
        'Streamlined billing system with automated invoicing and payment processing.',
      badge: 'Automation',
    },
    {
      title: 'Customer Portal',
      description:
        'Self-service portal for bookings, reservations, and account management.',
      badge: 'Self-Service',
    },
    {
      title: '24/7 Support',
      description:
        'Round-the-clock customer support with AI chatbots and human assistance.',
      badge: 'Support',
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your rental business efficiently and
            scale with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
