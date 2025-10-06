import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { endpoints } from '../../shared/lib/endpoints';
import { ChartAreaInteractive } from '../components/chart-area-interactive';
import { DataTable } from '../components/data-table';
import { SectionCards } from '../components/section-cards';

export default function Dashboard() {
  const { t } = useTranslation();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(endpoints.renters.getAll(), {
          withCredentials: true,
        });
        // Transform API data to match DataTable format if needed
        const renters = response.data.data.renters || [];
        const formatted = renters.map(renter => ({
          id: renter.id,
          header: renter.name,
          type: renter.membershipType,
          status: renter.status,
          target: renter.target || '0',
          limit: renter.limit || '0',
          reviewer: renter.email,
        }));
        setUserData(formatted);
        console.log('Fetched renters for dashboard:', formatted);
      } catch (err) {
        setError(err.message || t('admin.dashboard.errors.fetchUsers'));
        console.error('Dashboard fetch renters error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <>
      <SectionCards />
      <div className='grid gap-6 lg:grid-cols-2 px-4 lg:px-6'>
        <ChartAreaInteractive />
        <div className='flex flex-col gap-4'>
          <div className='rounded-lg border bg-card p-6'>
            <h3 className='text-lg font-semibold mb-4'>{t('admin.dashboard.recentUserActivity.title')}</h3>
            <div className='space-y-3'>
              {/* Newest user registration */}
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-green-500'></div>
                <span className='text-sm text-muted-foreground'>
                  {userData && userData.length > 0 && userData.some(u => u.createdAt)
                    ? (() => {
                      const newest = [...userData]
                        .filter(u => u.createdAt)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                      return newest.length > 0
                        ? t('admin.dashboard.recentUserActivity.newUser', { name: newest[0].header })
                        : t('admin.dashboard.recentUserActivity.newUserLoading');
                    })()
                    : t('admin.dashboard.recentUserActivity.newUserLoading')}
                </span>
              </div>
              {/* Most recently updated account */}
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                <span className='text-sm text-muted-foreground'>
                  {userData && userData.length > 0 && userData.some(u => u.updatedAt)
                    ? (() => {
                      const updated = [...userData]
                        .filter(u => u.updatedAt)
                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                      return updated.length > 0
                        ? t('admin.dashboard.recentUserActivity.accountUpdated', { name: updated[0].header })
                        : t('admin.dashboard.recentUserActivity.accountUpdatedLoading');
                    })()
                    : t('admin.dashboard.recentUserActivity.accountUpdatedLoading')}
                </span>
              </div>
              {/* Account suspended */}
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-orange-500'></div>
                <span className='text-sm text-muted-foreground'>
                  {t('admin.dashboard.recentUserActivity.accountSuspended', { name: 'Mike Chen' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}