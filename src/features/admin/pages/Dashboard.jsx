import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { ChartAreaInteractive } from '../components/chart-area-interactive';
import { ChartBarDefault } from '../components/barchart-revenue';

const Dashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');

  // State for dashboard stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    completedBookings: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      setErrorStats('');
      try {
        const res = await axios.get('/api/bookings');
        const bookings =
          res.data?.data?.bookings || res.data?.bookings || res.data || [];
        const totalBookings = Array.isArray(bookings) ? bookings.length : 0;
        const activeBookings = bookings.filter(
          b => (b.status || b.bookingStatus) === 'IN_PROGRESS'
        ).length;
        const completedBookings = bookings.filter(
          b => (b.status || b.bookingStatus) === 'COMPLETED'
        ).length;

        // Tính tổng doanh thu
        // Doanh thu KHÔNG tính thuế, KHÔNG tính đặt cọc
        const totalRevenue = bookings
          .filter(b => (b.status || b.bookingStatus) === 'COMPLETED')
          .reduce((sum, b) => {
            const base = b.basePrice || 0;
            const insurance = b.insuranceAmount || 0;
            const discount = b.discountAmount || 0;
            return sum + (base + insurance - discount);
          }, 0);

        // Tính doanh thu theo thời gian
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Doanh thu hôm nay
        const todayRevenue = bookings
          .filter(b => {
            const completedDate = b.actualEndDate
              ? new Date(b.actualEndDate)
              : null;
            return (
              completedDate &&
              completedDate >= today &&
              (b.status || b.bookingStatus) === 'COMPLETED'
            );
          })
          .reduce((sum, b) => {
            const base = b.basePrice || 0;
            const insurance = b.insuranceAmount || 0;
            const discount = b.discountAmount || 0;
            return sum + (base + insurance - discount);
          }, 0);

        // Doanh thu tuần này
        const weekRevenue = bookings
          .filter(b => {
            const completedDate = b.actualEndDate
              ? new Date(b.actualEndDate)
              : null;
            return (
              completedDate &&
              completedDate >= weekAgo &&
              (b.status || b.bookingStatus) === 'COMPLETED'
            );
          })
          .reduce((sum, b) => {
            const base = b.basePrice || 0;
            const insurance = b.insuranceAmount || 0;
            const discount = b.discountAmount || 0;
            return sum + (base + insurance - discount);
          }, 0);

        // Doanh thu tháng này
        const monthRevenue = bookings
          .filter(b => {
            const completedDate = b.actualEndDate
              ? new Date(b.actualEndDate)
              : null;
            return (
              completedDate &&
              completedDate >= monthStart &&
              (b.status || b.bookingStatus) === 'COMPLETED'
            );
          })
          .reduce((sum, b) => {
            const base = b.basePrice || 0;
            const insurance = b.insuranceAmount || 0;
            const discount = b.discountAmount || 0;
            return sum + (base + insurance - discount);
          }, 0);

        // Doanh thu tháng trước
        const lastMonthRevenue = bookings
          .filter(b => {
            const completedDate = b.actualEndDate
              ? new Date(b.actualEndDate)
              : null;
            return (
              completedDate &&
              completedDate >= lastMonthStart &&
              completedDate <= lastMonthEnd &&
              (b.status || b.bookingStatus) === 'COMPLETED'
            );
          })
          .reduce((sum, b) => {
            const base = b.basePrice || 0;
            const insurance = b.insuranceAmount || 0;
            const discount = b.discountAmount || 0;
            return sum + (base + insurance - discount);
          }, 0);

        // Tính % tăng trưởng doanh thu
        const revenueGrowth =
          lastMonthRevenue === 0
            ? monthRevenue > 0
              ? 100
              : 0
            : Math.round(
                ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
              );

        // Tính booking theo tháng để hiển thị growth
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear =
          currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthBookings = bookings.filter(b => {
          const d = new Date(b.createdAt);
          return (
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        });
        const lastMonthBookings = bookings.filter(b => {
          const d = new Date(b.createdAt);
          return (
            d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
          );
        });

        const currentMonthCount = currentMonthBookings.length;
        const lastMonthCount = lastMonthBookings.length;
        const growthBookings =
          lastMonthCount === 0
            ? currentMonthCount > 0
              ? 100
              : 0
            : Math.round(
                ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100
              );

        // Tính tăng trưởng Active Bookings
        const currentMonthActive = bookings.filter(b => {
          const d = new Date(b.createdAt);
          return (
            (b.status || b.bookingStatus) === 'IN_PROGRESS' &&
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
          );
        }).length;
        const lastMonthActive = bookings.filter(b => {
          const d = new Date(b.createdAt);
          return (
            (b.status || b.bookingStatus) === 'IN_PROGRESS' &&
            d.getMonth() === lastMonth &&
            d.getFullYear() === lastMonthYear
          );
        }).length;
        const growthActive =
          lastMonthActive === 0
            ? currentMonthActive > 0
              ? 100
              : 0
            : Math.round(
                ((currentMonthActive - lastMonthActive) / lastMonthActive) * 100
              );

        // Tính tăng trưởng Completed Bookings
        const currentMonthCompleted = bookings.filter(b => {
          const d = new Date(b.actualEndDate || b.endTime || b.createdAt);
          return (
            (b.status || b.bookingStatus) === 'COMPLETED' &&
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
          );
        }).length;
        const lastMonthCompleted = bookings.filter(b => {
          const d = new Date(b.actualEndDate || b.endTime || b.createdAt);
          return (
            (b.status || b.bookingStatus) === 'COMPLETED' &&
            d.getMonth() === lastMonth &&
            d.getFullYear() === lastMonthYear
          );
        }).length;
        const growthCompleted =
          lastMonthCompleted === 0
            ? currentMonthCompleted > 0
              ? 100
              : 0
            : Math.round(
                ((currentMonthCompleted - lastMonthCompleted) /
                  lastMonthCompleted) *
                  100
              );

        // Tạo dữ liệu biểu đồ: số booking COMPLETED theo ngày (30 ngày gần nhất)
        const completedByDay = {};
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          last30Days.push(dateStr);
          completedByDay[dateStr] = 0;
        }

        bookings
          .filter(
            b =>
              (b.status || b.bookingStatus) === 'COMPLETED' &&
              (b.actualEndDate || b.endTime || b.createdAt)
          )
          .forEach(b => {
            let dateObj = null;
            if (b.actualEndDate) dateObj = new Date(b.actualEndDate);
            else if (b.endTime) dateObj = new Date(b.endTime);
            else if (b.createdAt) dateObj = new Date(b.createdAt);
            if (!dateObj) return;
            const dateStr = dateObj.toISOString().split('T')[0];
            if (completedByDay.hasOwnProperty(dateStr)) {
              completedByDay[dateStr] += 1;
            }
          });

        // Tạo mảng dữ liệu cho biểu đồ (lấy mỗi 3 ngày để đẹp hơn)
        const chartData = last30Days
          .filter((_, idx) => idx % 3 === 0)
          .map(dateStr => {
            const date = new Date(dateStr);
            return {
              date: `${date.getDate()}/${date.getMonth() + 1}`,
              value: completedByDay[dateStr], // Số booking hoàn thành
            };
          });

        setRevenueData(chartData);
        setStats({
          totalBookings,
          activeBookings,
          totalRevenue,
          completedBookings,
          growthBookings,
          growthActive,
          growthCompleted,
          newBookings: currentMonthCount,
          todayRevenue,
          weekRevenue,
          monthRevenue,
          revenueGrowth,
        });
      } catch (err) {
        setErrorStats('Không thể tải dữ liệu booking');
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div
      className='w-full min-h-screen p-8 transition-colors duration-300'
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <div className='mb-8'>
        <h2
          className='text-3xl font-bold'
          style={{ color: 'var(--foreground)' }}
        >
          Admin Dashboard
        </h2>
        <p className='mt-1' style={{ color: 'var(--muted-foreground)' }}>
          Overview of the EV Rental System
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div
          className='p-6 rounded-xl shadow-sm border'
          style={{
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            borderColor: 'var(--border)',
          }}
        >
          <div className='flex items-start justify-between mb-3'>
            <div>
              <p
                className='text-sm mb-1'
                style={{ color: 'var(--muted-foreground)' }}
              >
                Total Bookings
              </p>
              <p
                className='text-3xl font-bold'
                style={{ color: 'var(--foreground)' }}
              >
                {loadingStats ? '...' : stats.totalBookings}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                stats.growthBookings >= 0
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              {stats.growthBookings >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span>
                {stats.growthBookings > 0
                  ? `+${stats.growthBookings}%`
                  : `${stats.growthBookings || 0}%`}
              </span>
            </div>
          </div>
          <p
            className='text-xs flex items-center gap-1'
            style={{ color: 'var(--muted-foreground)' }}
          >
            {stats.growthBookings >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            Total Bookings This Month
          </p>
          <p
            className='text-xs mt-1'
            style={{ color: 'var(--muted-foreground)' }}
          >
            New bookings: +{stats.newBookings || 0}
          </p>
        </div>

        <div
          className='p-6 rounded-xl shadow-sm border'
          style={{
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            borderColor: 'var(--border)',
          }}
        >
          <div className='flex items-start justify-between mb-3'>
            <div>
              <p
                className='text-sm mb-1'
                style={{ color: 'var(--muted-foreground)' }}
              >
                Active Bookings
              </p>
              <p
                className='text-3xl font-bold'
                style={{ color: 'var(--foreground)' }}
              >
                {loadingStats ? '...' : stats.activeBookings}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                stats.growthActive >= 0
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              {stats.growthActive >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span>
                {stats.growthActive > 0
                  ? `+${stats.growthActive}%`
                  : `${stats.growthActive || 0}%`}
              </span>
            </div>
          </div>
          <p
            className='text-xs flex items-center gap-1'
            style={{ color: 'var(--muted-foreground)' }}
          >
            {stats.growthActive >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            Active Bookings This Month
          </p>
          <p
            className='text-xs mt-1'
            style={{ color: 'var(--muted-foreground)' }}
          >
            {stats.activeBookings} active bookings
          </p>
        </div>

        <div
          className='p-6 rounded-xl shadow-sm border'
          style={{
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            borderColor: 'var(--border)',
          }}
        >
          <div className='flex items-start justify-between mb-3'>
            <div>
              <p
                className='text-sm mb-1'
                style={{ color: 'var(--muted-foreground)' }}
              >
                Total Revenue
              </p>
              <p
                className='text-2xl font-bold'
                style={{ color: 'var(--foreground)' }}
              >
                {loadingStats
                  ? '...'
                  : `${stats.totalRevenue.toLocaleString('vi-VN')} ₫`}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                stats.revenueGrowth >= 0
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              {stats.revenueGrowth >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span>
                {stats.revenueGrowth > 0
                  ? `+${stats.revenueGrowth}%`
                  : `${stats.revenueGrowth || 0}%`}
              </span>
            </div>
          </div>
          <p
            className='text-xs flex items-center gap-1'
            style={{ color: 'var(--muted-foreground)' }}
          >
            {stats.revenueGrowth >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            Total Revenue from Completed Bookings
          </p>
          <div className='mt-2 space-y-1'>
            {/* Đã xoá các dòng doanh thu hôm nay, tuần này, tháng này */}
          </div>
        </div>

        <div
          className='p-6 rounded-xl shadow-sm border'
          style={{
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            borderColor: 'var(--border)',
          }}
        >
          <div className='flex items-start justify-between mb-3'>
            <div>
              <p
                className='text-sm mb-1'
                style={{ color: 'var(--muted-foreground)' }}
              >
                Completed Bookings
              </p>
              <p
                className='text-3xl font-bold'
                style={{ color: 'var(--foreground)' }}
              >
                {loadingStats ? '...' : stats.completedBookings}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                stats.growthCompleted >= 0
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              {stats.growthCompleted >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span>
                {stats.growthCompleted > 0
                  ? `+${stats.growthCompleted}%`
                  : `${stats.growthCompleted || 0}%`}
              </span>
            </div>
          </div>
          <p
            className='text-xs flex items-center gap-1'
            style={{ color: 'var(--muted-foreground)' }}
          >
            <CheckCircle size={12} />
            Completed Bookings This Month
          </p>
          <p
            className='text-xs mt-1'
            style={{ color: 'var(--muted-foreground)' }}
          >
            Success rate:{' '}
            {stats.totalBookings > 0
              ? Math.round(
                  (stats.completedBookings / stats.totalBookings) * 100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ChartAreaInteractive />
        <ChartBarDefault />
      </div>
    </div>
  );
};

export default Dashboard;
