import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/features/shared/components/homepage/Navbar';
import Footer from '@/features/shared/components/homepage/Footer';
import StaffProfileSidebar from '../components/StaffProfileSidebar';
import StaffProfileContent from '../components/StaffProfileContent';
import StaffSettingsContent from '../components/StaffSettingsContent';

export default function StaffProfileLayout() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />
      <div className='flex min-h-[calc(100vh-80px)] mt-20'>
        <div className='w-80 bg-background border-r border-border flex-shrink-0'>
          <StaffProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className='flex-1 bg-muted/30'>
          <div className='p-8'>
            {activeTab === 'profile' && <StaffProfileContent />}
            {activeTab === 'settings' && <StaffSettingsContent />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
