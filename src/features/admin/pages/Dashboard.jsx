import { useEffect, useState } from 'react';
import axios from 'axios';
import { endpoints } from '../../shared/lib/endpoints';
import { ChartAreaInteractive } from '../components/chart-area-interactive';
import { DataTable } from '../components/data-table';
import { SectionCards } from '../components/section-cards';

export default function Dashboard() {
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
        setError(err.message || 'Failed to fetch users');
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
            <h3 className='text-lg font-semibold mb-4'>Recent User Activity</h3>
            <div className='space-y-3'>
              {/* Newest user registration (createdAt mới nhất) */}
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-green-500'></div>
                <span className='text-sm text-muted-foreground'>
                  {userData && userData.length > 0 && userData.some(u => u.createdAt)
                    ? (() => {
                      const newest = [...userData]
                        .filter(u => u.createdAt)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                      return newest.length > 0
                        ? `New user registration: ${newest[0].header}`
                        : 'New user registration: ...';
                    })()
                    : 'New user registration: ...'}
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
                        ? `Account updated: ${updated[0].header}`
                        : 'Account updated: ...';
                    })()
                    : 'Account updated: ...'}
                </span>
              </div>
              {/* Account suspended (giữ nguyên) */}
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-orange-500'></div>
                <span className='text-sm text-muted-foreground'>
                  Account suspended: Mike Chen
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className='rounded-lg border bg-card mx-4 lg:mx-6'>
        <div className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>
            User Account Management
          </h3>
          {loading ? (
            <div className='py-8 text-center'>Loading users...</div>
          ) : error ? (
            <div className='py-8 text-center text-red-500'>Error: {error}</div>
          ) : (
            <DataTable data={userData} />
          )}
        </div>
      </div>
    </>
  );
}