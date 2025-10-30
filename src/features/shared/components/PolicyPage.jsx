import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Footer from './homepage/Footer';
import Navbar from './homepage/Navbar';

// Accordion Section Component
const AccordionSection = ({
  id,
  title,
  children,
  isExpanded,
  onToggle,
  sectionNumber,
}) => (
  <section id={id} className='mb-6'>
    <div
      className='flex items-center justify-between cursor-pointer p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors'
      onClick={() => onToggle(id)}
    >
      <h2 className='text-xl font-semibold text-foreground'>
        {sectionNumber}. {title}
      </h2>
      {isExpanded ? (
        <ChevronDown className='h-5 w-5 text-muted-foreground' />
      ) : (
        <ChevronRight className='h-5 w-5 text-muted-foreground' />
      )}
    </div>
    {isExpanded && (
      <div className='mt-4 p-4 bg-muted/30 rounded-lg'>
        <div className='space-y-4 text-muted-foreground'>{children}</div>
      </div>
    )}
  </section>
);

const policySections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'data-protection', title: 'Data Protection' },
  { id: 'user-rights', title: 'User Rights & Responsibilities' },
  { id: 'account-management', title: 'Account Management' },
  { id: 'vehicle-rental', title: 'Vehicle Rental Terms' },
  { id: 'booking-payment', title: 'Booking & Payment Policy' },
  { id: 'out-of-area', title: 'Out-of-Area Policy' },
  { id: 'station-management', title: 'Station Management' },
  { id: 'staff-management', title: 'Staff Management' },
  { id: 'vehicle-usage', title: 'Vehicle Usage Guidelines' },
  { id: 'liability-insurance', title: 'Liability & Insurance' },
  { id: 'dispute-resolution', title: 'Dispute Resolution' },
  { id: 'violation-enforcement', title: 'Violations & Enforcement' },
  { id: 'general-terms', title: 'General Terms' },
];

export default function PolicyPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [expandedSections, setExpandedSections] = useState({
    introduction: true,
    'data-protection': false,
    'user-rights': false,
    'account-management': false,
    'vehicle-rental': false,
    'booking-payment': false,
    'out-of-area': false,
    'station-management': false,
    'staff-management': false,
    'vehicle-usage': false,
    'liability-insurance': false,
    'dispute-resolution': false,
    'violation-enforcement': false,
    'general-terms': false,
  });

  const scrollToSection = sectionId => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSection = sectionId => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />

      <div className='flex min-h-[calc(100vh-80px)] mt-20'>
        {/* Sidebar */}
        <div className='w-80 bg-muted/30 border-r border-border flex-shrink-0'>
          <div className='p-6'>
            <h2 className='text-xl font-bold text-foreground mb-6'>
              Policies & Regulations
            </h2>
            <nav className='space-y-2'>
              {policySections.map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    scrollToSection(section.id);
                    toggleSection(section.id);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-muted text-foreground border-l-4 border-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className='text-left'>{section.title}</span>
                  {expandedSections[section.id] ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronRight className='h-4 w-4' />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 bg-background overflow-y-auto'>
          <div className='max-w-4xl mx-auto p-8'>
            <h1 className='text-3xl font-bold text-foreground mb-8'>
              EV-Rental Policies & Regulations
            </h1>

            {/* Introduction */}
            <AccordionSection
              id='introduction'
              title='Introduction'
              sectionNumber={1}
              isExpanded={expandedSections.introduction}
              onToggle={toggleSection}
            >
              <p>
                <strong>1.1 About the EV-Rental Platform</strong>
                <br />
                Welcome to EV-Rental, an innovative electric vehicle rental platform that provides sustainable transportation solutions. By accessing or using EV-Rental, creating an account, or using our services, you agree to comply with these Terms and Conditions and all applicable policies.
              </p>
              <p>
                <strong>1.2 Scope of Services</strong>
                <br />
                The EV-Rental platform allows customers to:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Browse and rent electric vehicles across multiple stations</li>
                <li>Manage bookings and payments via the digital platform</li>
                <li>Access customer support and vehicle maintenance services</li>
                <li>Participate in promotions and loyalty rewards programs</li>
              </ul>
              <p>
                <strong>1.3 Platform Rights</strong>
                <br />
                EV-Rental reserves the right to:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Modify, update, suspend, or terminate any terms and conditions at any time</li>
                <li>Deny service requests or account creation where legally required</li>
                <li>Update services and pricing based on market conditions</li>
              </ul>
            </AccordionSection>

            {/* Data Protection */}
            <AccordionSection
              id='data-protection'
              title='Data Protection & Privacy Policy'
              sectionNumber={2}
              isExpanded={expandedSections['data-protection']}
              onToggle={toggleSection}
            >
              <p>
                <strong>2.1 Data Collection and Processing</strong>
                <br />
                EV-Rental is committed to protecting users’ personal data. We collect and process the following information:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Personal identifying data (name, phone number, address, date of birth)</li>
                <li>Account login information (email, password)</li>
                <li>Financial information (payment methods, transaction history)</li>
                <li>Vehicle usage data (rental history, ratings, feedback)</li>
                <li>Location data for station and vehicle tracking</li>
              </ul>
              <p>
                <strong>2.2 Use of Data</strong>
                <br />
                Your data is used to:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Manage accounts and authentication</li>
                <li>Process bookings and payments</li>
                <li>Improve services and customer support</li>
                <li>Monitor safety and security</li>
                <li>Comply with legal and audit requirements</li>
              </ul>
            </AccordionSection>

            {/* User Rights */}
            <AccordionSection
              id='user-rights'
              title='User Rights and Responsibilities'
              sectionNumber={3}
              isExpanded={expandedSections['user-rights']}
              onToggle={toggleSection}
            >
              <p>
                <strong>3.1 User Rights</strong>
                <br />
                Registered users have the right to:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Access available vehicles and make bookings</li>
                <li>Receive technical support and platform usage guidance</li>
                <li>Provide feedback and suggestions to improve services</li>
                <li>Request account information updates and data deletion</li>
                <li>Be treated fairly with non-discriminatory service</li>
              </ul>
              <p>
                <strong>3.2 User Responsibilities</strong>
                <br />
                Users must:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Maintain account security and report unauthorized access</li>
                <li>Provide accurate and truthful information</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Use vehicles responsibly and return them in good condition</li>
                <li>Pay all fees and charges on time</li>
              </ul>
            </AccordionSection>

            {/* Account Management */}
            <AccordionSection
              id='account-management'
              title='Account Management and Security'
              sectionNumber={4}
              isExpanded={expandedSections['account-management']}
              onToggle={toggleSection}
            >
              <p>
                <strong>4.1 Account Creation</strong>
                <br />
                To create an account, users must:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Be at least 21 years old with a valid driver’s license</li>
                <li>Provide accurate personal and contact information</li>
                <li>Verify identity by submitting required documents</li>
                <li>Agree to all terms and conditions</li>
              </ul>
              <p>
                <strong>4.2 Account Security</strong>
                <br />
                Users are responsible for:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Keeping login credentials confidential</li>
                <li>Signing out after each session on shared devices</li>
                <li>Reporting suspicious account activity immediately</li>
                <li>Updating account information when changes occur</li>
              </ul>
            </AccordionSection>

            {/* Vehicle Rental */}
            <AccordionSection
              id='vehicle-rental'
              title='Vehicle Rental Terms'
              sectionNumber={5}
              isExpanded={expandedSections['vehicle-rental']}
              onToggle={toggleSection}
            >
              <p>
                <strong>5.1 Vehicle Types and Availability</strong>
                <br />
                EV-Rental offers various electric vehicle types:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Sedan, SUV, Hatchback, Coupe</li>
                <li>Different battery capacities and ranges</li>
                <li>Availability varies based on demand and maintenance schedules</li>
              </ul>
              <p>
                <strong>5.2 Rental Requirements</strong>
                <br />
                To rent a vehicle, users must:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Have an active, verified account</li>
                <li>Hold a valid driver’s license</li>
                <li>Meet the minimum age requirement (21+)</li>
                <li>Provide a valid payment method</li>
                <li>Complete vehicle inspection before use</li>
              </ul>
            </AccordionSection>

            {/* Booking and Payment */}
            <AccordionSection
              id='booking-payment'
              title='Booking and Payment Policy'
              sectionNumber={6}
              isExpanded={expandedSections['booking-payment']}
              onToggle={toggleSection}
            >
              <p>
                <strong>6.1 Booking Process</strong>
                <br />
                Bookings can be made through the platform up to 30 days in advance.
                Bookings require immediate payment or valid payment authorization.
                Cancellations must be made at least 2 hours before the pickup time.
                No-shows will result in full charges and may incur account penalties.
              </p>
              <p>
                <strong>6.2 Payment Methods</strong>
                <br />
                Accepted payment methods include:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Credit cards (Visa, MasterCard, American Express)</li>
                <li>Debit cards</li>
                <li>Bank transfer</li>
                <li>E-wallets (where available)</li>
                <li>Cash payments at select locations</li>
              </ul>
            </AccordionSection>

            {/* Out of Area Policy */}
            <AccordionSection
              id='out-of-area'
              title='EV-Rental Out-of-Area Policy'
              sectionNumber={7}
              isExpanded={expandedSections['out-of-area']}
              onToggle={toggleSection}
            >
              <p>
                Vehicle usage is primarily intended for the Ho Chi Minh City Metropolitan Area.
                Travel outside this area is permitted but carries additional risks,
                responsibilities, and fees.
              </p>
              <p>
                <strong>7.1 Travel Requirements</strong>
                <br />
                Advance notice to EV-Rental is required for any trip outside Ho Chi Minh City.
                An additional deposit may be required. Customers acknowledge and assume
                increased personal and legal responsibility for vehicle safety and security.
              </p>
              <p>
                <strong>7.2 Emergency and Roadside Assistance</strong>
                <br />
                Emergency and roadside assistance may be limited or unavailable outside
                designated service areas. Additional fees apply for incidents, recovery,
                or services required outside Ho Chi Minh City. Emergency response surcharge:
                VND 3,000,000 for incidents outside HCMC.
              </p>
            </AccordionSection>

            {/* Station Management */}
            <AccordionSection
              id='station-management'
              title='Station Management and Operations'
              sectionNumber={8}
              isExpanded={expandedSections['station-management']}
              onToggle={toggleSection}
            >
              <p>
                <strong>8.1 Station Locations and Operating Hours</strong>
                <br />
                Stations are strategically located within the Ho Chi Minh City service area.
                Operating hours vary by location (24/7 or limited hours). Real-time station
                status updates are available. Maintenance windows may affect availability.
              </p>
              <p>
                <strong>8.2 Pickup and Return</strong>
                <br />
                Vehicles must be picked up and returned at designated stations in Ho Chi Minh City.
                Same-station return is required unless otherwise agreed. Cross-station returns
                incur additional fees. After-hours pickup/return is available at select locations.
              </p>
            </AccordionSection>

            {/* Staff Management */}
            <AccordionSection
              id='staff-management'
              title='Staff Management and Authorization'
              sectionNumber={9}
              isExpanded={expandedSections['staff-management']}
              onToggle={toggleSection}
            >
              <p>
                <strong>9.1 Staff Roles and Responsibilities</strong>
                <br />
                <strong>Admin Staff:</strong> Full system access; user management; station and vehicle management;
                policy enforcement and dispute resolution; financial oversight and reporting.
              </p>
              <p>
                <strong>Station Staff:</strong> Vehicle inspection and maintenance coordination; customer support and assistance;
                station operations management; incident reporting and resolution.
              </p>
            </AccordionSection>

            {/* Vehicle Usage */}
            <AccordionSection
              id='vehicle-usage'
              title='Vehicle Usage and Safety Guidelines'
              sectionNumber={10}
              isExpanded={expandedSections['vehicle-usage']}
              onToggle={toggleSection}
            >
              <p>
                <strong>10.1 Driver Requirements</strong>
                <br />
                A valid driver’s license is required at all times. Age restriction: minimum 21 years.
                International drivers must hold appropriate documentation. Commercial use requires special authorization.
              </p>
              <p>
                <strong>10.2 Vehicle Operation</strong>
                <br />
                Maximum passenger limits apply per vehicle. No smoking, pets, or prohibited substances.
                Seat belts are mandatory for all passengers. Mobile phone use is permitted only with hands-free devices.
              </p>
            </AccordionSection>

            {/* Liability and Insurance */}
            <AccordionSection
              id='liability-insurance'
              title='Liability and Insurance'
              sectionNumber={11}
              isExpanded={expandedSections['liability-insurance']}
              onToggle={toggleSection}
            >
              <p>
                <strong>11.1 Insurance</strong>
                <br />
                All rentals include comprehensive insurance within Ho Chi Minh City:
                Full comprehensive coverage; third-party liability protection; theft and vandalism coverage;
                roadside emergency assistance; vehicle recovery services; accident response support.
              </p>
              <p>
                <strong>11.2 User Responsibilities</strong>
                <br />
                Users are responsible for: Damage beyond normal wear and tear; traffic violations and fines incurred
                during the rental period; theft due to negligence or improper security; exceeding vehicle passenger capacity.
              </p>
            </AccordionSection>

            {/* Dispute Resolution */}
            <AccordionSection
              id='dispute-resolution'
              title='Dispute Resolution'
              sectionNumber={12}
              isExpanded={expandedSections['dispute-resolution']}
              onToggle={toggleSection}
            >
              <p>
                <strong>12.1 Customer Complaints</strong>
                <br />
                Complaints should be submitted via: the platform support system; email to support@ev-rental.com;
                phone during business hours; or in writing to the customer service center.
              </p>
              <p>
                <strong>12.2 Resolution Process</strong>
                <br />
                Initial response within 24 hours; investigation and fact-finding; proposed resolution within
                5 business days; implementation of the agreed solution; follow-up to ensure satisfaction.
              </p>
            </AccordionSection>

            {/* Violation and Enforcement */}
            <AccordionSection
              id='violation-enforcement'
              title='Violations and Enforcement'
              sectionNumber={13}
              isExpanded={expandedSections['violation-enforcement']}
              onToggle={toggleSection}
            >
              <p>
                <strong>13.1 Violation Classification</strong>
                <br />
                <strong>Minor Violations:</strong> Late returns (up to 1 hour); minor vehicle cleanliness issues;
                failure to report minor damage.
              </p>
              <p>
                <strong>Serious Violations:</strong> Significant property damage; illegal vehicle use; fraud or
                providing false information; safety violations.
              </p>
              <p>
                <strong>Severe Violations:</strong> Criminal activities involving the vehicle; repeated serious violations;
                threatening behavior toward staff; intentional damage or theft.
              </p>
            </AccordionSection>

            {/* General Terms */}
            <AccordionSection
              id='general-terms'
              title='General Terms'
              sectionNumber={14}
              isExpanded={expandedSections['general-terms']}
              onToggle={toggleSection}
            >
              <p>
                <strong>14.1 Policy Updates</strong>
                <br />
                EV-Rental reserves the right to update these policies at any time.
                Users will be notified of significant changes via: platform notifications; email notices;
                website updates; and in-app messages.
              </p>
              <p>
                <strong>14.3 Contact Information</strong>
                <br />
                EV-Rental Customer Service
                <br />
                Email: support@ev-rental.com
                <br />
                Phone: 1900 EVRENTAL (1900 387 3682)
                <br />
                Website: www.ev-rental.com
                <br />
                Address: 100 Le Loi, Ben Nghe, District 1, Ho Chi Minh City,
                Vietnam
              </p>
            </AccordionSection>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
