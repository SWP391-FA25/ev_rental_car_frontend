import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { endpoints } from '../../shared/lib/endpoints';

import { Badge } from '../../shared/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';

// Hàm helper để định dạng phần trăm
const formatPercent = (value) => {
  if (value === null || value === 'N/A') return '...';
  const num = parseFloat(value);
  if (isNaN(num)) return '...';
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
};

// Hàm helper để hiển thị số (hoặc '...')
const formatCount = (value) => {
  if (value === null) return '...';
  return value;
};


export function SectionCards() {
  const { t } = useTranslation();
  const [renterCount, setRenterCount] = useState(null);
  const [activeCount, setActiveCount] = useState(null);
  const [updateCount, setUpdateCount] = useState(null); // sẽ bỏ
  const [deleteCount, setDeleteCount] = useState(null); // sẽ bỏ
  const [staffCount, setStaffCount] = useState(null);
  const [activeStaffCount, setActiveStaffCount] = useState(null);
  const [growthPercent, setGrowthPercent] = useState(null);
  const [newThisMonth, setNewThisMonth] = useState(null);
  const [updateGrowth, setUpdateGrowth] = useState(null);
  const [updateThisMonth, setUpdateThisMonth] = useState(null);
  const [deleteGrowth, setDeleteGrowth] = useState(null);
  const [deleteThisMonth, setDeleteThisMonth] = useState(null);
  const [staffGrowthPercent, setStaffGrowthPercent] = useState(null);
  const [newStaffThisMonth, setNewStaffThisMonth] = useState(null);

  useEffect(() => {
    let intervalId;
    async function fetchRenterStats() {
      console.log('Fetching renters stats...');
      try {
        const res = await axios.get(endpoints.renters.getAll(), { withCredentials: true });
        const renters = res.data.data?.renters || [];

        // Tổng user
        setRenterCount(renters.length);

        // Active user
        const active = renters.filter(r => r.accountStatus === 'ACTIVE').length;
        setActiveCount(active);

        // Updated user
        const updateUsers = renters.filter(r => r.updatedAt && r.updatedAt !== r.createdAt);
        setUpdateCount(updateUsers.length);

        // Deleted user
        const deleteUsers = renters.filter(r => r.deletedAt);
        setDeleteCount(deleteUsers.length);

        // Thời gian
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        // User mới trong tháng này
        const newUsers = renters.filter(r => {
          if (!r.createdAt) return false;
          const d = new Date(r.createdAt);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        setNewThisMonth(newUsers.length);

        // Tính growth % user
        const lastMonthTotalUsers = renters.filter(r => {
          if (!r.createdAt) return false;
          const d = new Date(r.createdAt);
          return (
            d.getFullYear() < thisYear ||
            (d.getFullYear() === thisYear && d.getMonth() < thisMonth)
          );
        }).length;
        let growth = 0;
        if (lastMonthTotalUsers === 0) {
          growth = renters.length > 0 ? 100 : 0;
        } else {
          growth = ((renters.length - lastMonthTotalUsers) / lastMonthTotalUsers) * 100;
        }
        setGrowthPercent(growth);

        // Updated this month
        const newUpdated = updateUsers.filter(r => {
          if (!r.updatedAt) return false;
          const d = new Date(r.updatedAt);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        setUpdateThisMonth(newUpdated.length);

        // Updated last month
        const lastMonthUpdated = updateUsers.filter(r => {
          if (!r.updatedAt) return false;
          const d = new Date(r.updatedAt);
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });
        const updateGrowthVal =
          lastMonthUpdated.length === 0
            ? 100
            : ((newUpdated.length - lastMonthUpdated.length) / lastMonthUpdated.length) * 100;
        setUpdateGrowth(updateGrowthVal);

        // Deleted this month
        const newDeleted = deleteUsers.filter(r => {
          if (!r.deletedAt) return false;
          const d = new Date(r.deletedAt);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        setDeleteThisMonth(newDeleted.length);

        // Deleted last month
        const lastMonthDeleted = deleteUsers.filter(r => {
          if (!r.deletedAt) return false;
          const d = new Date(r.deletedAt);
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });
        const deleteGrowthVal =
          lastMonthDeleted.length === 0
            ? 100
            : ((newDeleted.length - lastMonthDeleted.length) / lastMonthDeleted.length) * 100;
        setDeleteGrowth(deleteGrowthVal);

        // Fetch staff
        try {
          const resStaff = await axios.get(endpoints.staffs.getAll(), { withCredentials: true });
          // Đảm bảo lấy đúng mảng staff từ response (staffs hoặc staff)
          const staffs = resStaff.data.data?.staffs || resStaff.data.data?.staff || resStaff.data.staffs || resStaff.data.staff || [];
          setStaffCount(staffs.length);
          const activeStaff = staffs.filter(s => s.accountStatus === 'ACTIVE').length;
          setActiveStaffCount(activeStaff);

          console.log('API staffs response:', resStaff.data.data);


          // Staff mới trong tháng này (fix cho cả staff và staffs)
          const newStaffs = staffs.filter(s => {
            if (!s.createdAt) return false;
            const d = new Date(s.createdAt);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
          });
          console.log('New staff this month:', newStaffs);
          setNewStaffThisMonth(newStaffs.length);

          // Tính growth % staff
          const lastMonthTotalStaffs = staffs.filter(s => {
            if (!s.createdAt) return false;
            const d = new Date(s.createdAt);
            return (
              d.getFullYear() < thisYear ||
              (d.getFullYear() === thisYear && d.getMonth() < thisMonth)
            );
          }).length;
          let staffGrowth = 0;
          if (lastMonthTotalStaffs === 0) {
            staffGrowth = staffs.length > 0 ? 100 : 0;
          } else {
            staffGrowth = ((staffs.length - lastMonthTotalStaffs) / lastMonthTotalStaffs) * 100;
          }
          setStaffGrowthPercent(staffGrowth);
        } catch (err) {
          console.error('Error fetching staffs:', err);
          setStaffCount('N/A');
          setActiveStaffCount('N/A');
          setStaffGrowthPercent('N/A');
          setNewStaffThisMonth('N/A');
        }
      } catch (err) {
        console.error('Error fetching renters:', err);
        setRenterCount('N/A');
        setActiveCount('N/A');
        setUpdateCount('N/A');
        setDeleteCount('N/A');
        setGrowthPercent('N/A');
        setNewThisMonth('N/A');
        setUpdateGrowth('N/A');
        setDeleteGrowth('N/A');
      }
    }

    fetchRenterStats();
    // Thiết lập interval để tự động refetch mỗi 10 giây (hoặc thời gian bạn muốn)
    intervalId = setInterval(fetchRenterStats, 10000);
    return () => clearInterval(intervalId);
  }, []);
  // --- KẾT THÚC USEEFFECT ---

  // TÍNH TOÁN % ACTIVE STAFF
  const activeStaffPercentage =
    staffCount && activeStaffCount !== null && !isNaN(staffCount) && !isNaN(activeStaffCount) && staffCount > 0
      ? ((activeStaffCount / staffCount) * 100).toFixed(1)
      : staffCount === 0 && activeStaffCount === 0
        ? '0.0' // Nếu tổng số staff là 0, thì active 0 cũng là 0.0%
        : null;


  return (
    <div className='*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6'>
      {/* Total Users */}
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>{t('admin.dashboard.cards.totalUsers.title')}</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            {formatCount(renterCount)}
          </CardTitle>

          <div className='absolute right-4 top-4'>
            <Badge variant='outline' className='flex gap-1 rounded-lg text-xs'>
              <TrendingUpIcon className='size-3' />
              {formatPercent(growthPercent)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {t('admin.dashboard.cards.totalUsers.subtitle')} <TrendingUpIcon className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            {newThisMonth === null ? '...' : t('admin.dashboard.cards.totalUsers.newUsers', { count: `+${newThisMonth}` })}
          </div>
        </CardFooter>
      </Card>

      {/* Active Users */}
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>{t('admin.dashboard.cards.activeUsers.title')}</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            {formatCount(activeCount)}
          </CardTitle>
          <div className='absolute right-4 top-4'>
            <Badge variant='outline' className='flex gap-1 rounded-lg text-xs'>
              <TrendingUpIcon className='size-3' />
              {renterCount && activeCount !== null
                ? `${((activeCount / renterCount) * 100).toFixed(1)}%`
                : '...'}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {t('admin.dashboard.cards.activeUsers.subtitle')} <TrendingUpIcon className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            {renterCount && activeCount !== null
              ? t('admin.dashboard.cards.activeUsers.percentage', { percent: ((activeCount / renterCount) * 100).toFixed(1) })
              : '...'}
          </div>
        </CardFooter>
      </Card>

      {/* Total Staff */}
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>{t('admin.dashboard.cards.totalStaff.title')}</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            {formatCount(staffCount)}
          </CardTitle>
          <div className='absolute right-4 top-4'>
            <Badge variant='outline' className='flex gap-1 rounded-lg text-xs'>
              <TrendingUpIcon className='size-3' />
              {formatPercent(staffGrowthPercent)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {t('admin.dashboard.cards.totalStaff.subtitle')} <TrendingUpIcon className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            {newStaffThisMonth === null ? '...' : t('admin.dashboard.cards.totalStaff.newStaff', { count: `+${newStaffThisMonth}` })}
          </div>
        </CardFooter>
      </Card>

      {/* Active Staff */}
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>{t('admin.dashboard.cards.activeStaff.title')}</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            {formatCount(activeStaffCount)}
          </CardTitle>
          <div className='absolute right-4 top-4'>
            <Badge variant='outline' className='flex gap-1 rounded-lg text-xs'>
              <TrendingUpIcon className='size-3' />
              {activeStaffPercentage !== null ? `${activeStaffPercentage}%` : '...'}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {t('admin.dashboard.cards.activeStaff.subtitle')}
          </div>
          <div className='text-muted-foreground'>
            {staffCount && activeStaffCount !== null
              ? t('admin.dashboard.cards.activeStaff.percentage', { percent: activeStaffPercentage })
              : '...'}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}