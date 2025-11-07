import { useAuth } from '@/app/providers/AuthProvider';
import { Briefcase, FileText, Lock, LogOut, User } from 'lucide-react';

const menuItems = [
  { id: 'profile', label: 'My Account', icon: User },
  { id: 'documents', label: 'Personal Documents', icon: FileText },
  { id: 'contracts', label: 'Rental Contracts', icon: FileText },
  // { id: 'favorites', label: 'Favorite Cars', icon: Heart },
  { id: 'trips', label: 'My Trips', icon: Briefcase },
  // { id: 'longterm', label: 'Long-term Rentals', icon: CheckSquare },
  // { id: 'gifts', label: 'Gifts', icon: Gift },
  // { id: 'addresses', label: 'My Addresses', icon: MapPin },
  { id: 'password', label: 'Change Password', icon: Lock },
];

export default function UserSidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();
  return (
    <div className='h-full bg-background'>
      {/* Greeting */}
      <div className='p-6 border-border'>
        <h2 className='text-2xl font-semibold text-foreground'>
          {/* Xin chào {user}! */}
        </h2>
      </div>

      {/* Navigation Menu */}
      <nav className='p-4 flex-1'>
        <ul className='space-y-2'>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border-l-4 border-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span className='font-medium'>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className='p-4 border-t border-border'>
        <button
          onClick={() => {
            logout();
          }}
          className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 hover:text-red-700'
        >
          <LogOut className='h-5 w-5' />
          <span className='font-medium'>Logout</span>
        </button>
      </div>
    </div>
  );
}
