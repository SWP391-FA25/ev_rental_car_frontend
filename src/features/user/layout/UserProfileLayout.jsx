import { useAuth } from '../../../app/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer from '../../shared/components/homepage/Footer';
import Navbar from '../../shared/components/homepage/Navbar';
import BookingsContent from '../components/BookingsContent';
import ChangePassword from '../components/ChangePassword';
import FavoriteCars from '../components/FavoriteCars';
import ProfileContent from '../components/ProfileContent';
import UserSidebar from '../components/UserSidebar';
import UserDocumentsPage from '../pages/UserDocumentsPage';
import CarRentalContract from '../components/CarRentalContract';

export default function UserProfileLayout() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />

      <div className='flex min-h-[calc(100vh-80px)] mt-20'>
        {/* Sidebar */}
        <div className='w-80 bg-background border-r border-border flex-shrink-0'>
          <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content */}
        <div className='flex-1 bg-muted/30'>
          <div className='p-8'>
            {activeTab === 'profile' && <ProfileContent user={user} />}
            {activeTab === 'documents' && <UserDocumentsPage />}
            {activeTab === 'contracts' && <CarRentalContract />}
            {activeTab === 'favorites' && <FavoriteCars />}
            {activeTab === 'trips' && <BookingsContent />}
            {activeTab === 'longterm' && (
              <div className='text-center py-12'>
                <h2 className='text-xl font-semibold text-foreground'>
                  Long-term Rentals
                </h2>
                <p className='text-muted-foreground mt-2'>
                  Feature under development
                </p>
              </div>
            )}
            {activeTab === 'gifts' && (
              <div className='text-center py-12'>
                <h2 className='text-xl font-semibold text-foreground'>
                  Gifts
                </h2>
                <p className='text-muted-foreground mt-2'>
                  Feature under development
                </p>
              </div>
            )}
            {activeTab === 'addresses' && (
              <div className='text-center py-12'>
                <h2 className='text-xl font-semibold text-foreground'>
                  My Addresses
                </h2>
                <p className='text-muted-foreground mt-2'>
                  Feature under development
                </p>
              </div>
            )}
            {activeTab === 'password' && <ChangePassword />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
