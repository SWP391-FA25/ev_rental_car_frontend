import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Calendar, CheckCircle, AlertCircle, TrendingUp, Clock, FileText, Bell } from 'lucide-react';

const Dashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');

  // State for dashboard stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    completedBookings: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      setErrorStats('');
      try {
        const res = await axios.get('/api/bookings');
        const bookings = res.data?.data?.bookings || res.data?.bookings || res.data || [];
        const totalBookings = Array.isArray(bookings) ? bookings.length : 0;
        const activeBookings = bookings.filter(b => (b.status || b.bookingStatus) === 'IN_PROGRESS').length;
        const completedBookings = bookings.filter(b => (b.status || b.bookingStatus) === 'COMPLETED').length;
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Tính toán booking theo tháng
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthBookings = bookings.filter(b => {
          const d = new Date(b.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const lastMonthBookings = bookings.filter(b => {
          const d = new Date(b.createdAt);
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        const currentMonthCount = currentMonthBookings.length;
        const lastMonthCount = lastMonthBookings.length;
        const growthBookings = lastMonthCount === 0 ? 100 : Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100);

        setStats({
          totalBookings,
          activeBookings,
          totalRevenue,
          completedBookings,
          growthBookings,
          newBookings: currentMonthCount,
        });
      } catch (err) {
        setErrorStats('Không thể tải dữ liệu booking');
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  const bookingData = [
    { date: 'Oct 3', value: 45 },
    { date: 'Oct 6', value: 32 },
    { date: 'Oct 9', value: 58 },
    { date: 'Oct 12', value: 42 },
    { date: 'Oct 15', value: 65 },
    { date: 'Oct 18', value: 38 },
    { date: 'Oct 21', value: 52 },
    { date: 'Oct 24', value: 48 },
    { date: 'Oct 27', value: 55 },
    { date: 'Oct 30', value: 42 },
  ];

  const recentActivities = [
    { type: 'new', message: 'Booking mới: Nguyễn Văn A đặt VinFast VF8', time: '5 phút trước' },
    { type: 'payment', message: 'Thanh toán: BK001 đã thanh toán 15,000,000đ', time: '15 phút trước' },
    { type: 'warning', message: 'Cảnh báo: Xe RT002 quá hạn trả 2 ngày', time: '1 giờ trước' },
    { type: 'completed', message: 'Hoàn thành: Trả xe BK098 thành công', time: '2 giờ trước' },
  ];

  const urgentTasks = [
    { title: 'Xe cần bàn giao hôm nay', count: 3, color: 'yellow', icon: Clock },
    { title: 'Xe quá hạn trả', count: 1, color: 'red', icon: AlertCircle },
    { title: 'Booking chờ xác nhận', count: 5, color: 'blue', icon: Calendar },
    { title: 'Hợp đồng cần duyệt', count: 2, color: 'purple', icon: FileText },
  ];

  const todaySchedule = [
    { time: '09:00', type: 'receive', customer: 'Phạm Văn D', car: 'VinFast VF8', status: 'pending' },
    { time: '10:00', type: 'return', customer: 'Vũ Văn F', car: 'VinFast VF9', status: 'pending' },
    { time: '14:00', type: 'receive', customer: 'Hoàng Thị E', car: 'Tesla Model Y', status: 'completed' },
    { time: '16:00', type: 'return', customer: 'Đỗ Thị G', car: 'Tesla Model 3', status: 'overdue' },
  ];

  const maxValue = Math.max(...bookingData.map(d => d.value));

  return (
    <div className="w-full min-h-screen p-8 transition-colors duration-300" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Admin Dashboard</h2>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Tổng quan hệ thống EV Rental</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-xl shadow-sm border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Bookings</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                {loadingStats ? '...' : stats.totalBookings}
              </p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp size={16} />
              <span>{stats.growthBookings > 0 ? `+${stats.growthBookings}%` : `${stats.growthBookings || 0}%`}</span>
            </div>
          </div>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
            <TrendingUp size={12} />
            Tổng số booking tháng này
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>New bookings: +{stats.newBookings || 0}</p>
        </div>

        <div className="p-6 rounded-xl shadow-sm border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>Active Bookings</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                {loadingStats ? '...' : stats.activeBookings}
              </p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp size={16} />
              <span>100%</span>
            </div>
          </div>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
            <TrendingUp size={12} />
            Đang trong quá trình thuê
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>100.0 active bookings</p>
        </div>

        <div className="p-6 rounded-xl shadow-sm border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Revenue</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                {loadingStats ? '...' : `${(stats.totalRevenue / 1000000).toFixed(0)}M`}
              </p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp size={16} />
              <span>+0%</span>
            </div>
          </div>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
            <TrendingUp size={12} />
            Doanh thu tháng này
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Revenue growth: +8%</p>
        </div>

        <div className="p-6 rounded-xl shadow-sm border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>Completed Bookings</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                {loadingStats ? '...' : stats.completedBookings}
              </p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp size={16} />
              <span>+0%</span>
            </div>
          </div>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
            <CheckCircle size={12} />
            Hoàn thành thành công
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Success rate: 94.5%</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Booking Analysis Chart */}
        <div className="lg:col-span-2 rounded-xl shadow-sm border p-6" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Booking Analysis</h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Booking activity in the past 3 months</p>
            </div>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>

          <div className="relative h-64">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((percent) => (
                <line
                  key={percent}
                  x1="0"
                  y1={`${percent}%`}
                  x2="100%"
                  y2={`${percent}%`}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              ))}

              {/* Area chart */}
              <path
                d={`M 0 ${256 - (bookingData[0].value / maxValue) * 256} ${bookingData.map((d, i) =>
                  `L ${(i / (bookingData.length - 1)) * 100}% ${256 - (d.value / maxValue) * 256}`
                ).join(' ')} L 100% 256 L 0 256 Z`}
                fill="url(#gradient)"
              />

              {/* Line chart */}
              <path
                d={`M 0 ${256 - (bookingData[0].value / maxValue) * 256} ${bookingData.map((d, i) =>
                  `L ${(i / (bookingData.length - 1)) * 100}% ${256 - (d.value / maxValue) * 256}`
                ).join(' ')}`}
                fill="none"
                stroke="#6B7280"
                strokeWidth="2"
              />
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {bookingData.filter((_, i) => i % 3 === 0).map((d, i) => (
                <span key={i}>{d.date}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl shadow-sm border p-6" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>Recent User Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.type === 'new' ? 'bg-green-500' :
                  activity.type === 'payment' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-orange-500' :
                      'bg-gray-400'
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>{activity.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Tasks & Today Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <div className="rounded-xl shadow-sm border p-6" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <AlertCircle className="text-red-500" size={20} />
            Cần xử lý ngay
          </h3>
          <div className="space-y-3">
            {urgentTasks.map((task, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 mb-2
                  ${task.color === 'yellow'
                    ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40'
                    : task.color === 'red'
                      ? 'border-red-500 bg-red-100 dark:bg-red-900/40'
                      : task.color === 'blue'
                        ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40'
                        : 'border-purple-500 bg-purple-100 dark:bg-purple-900/40'}
                `}
                style={{ color: 'var(--foreground)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <task.icon
                      size={18}
                      className={
                        task.color === 'yellow'
                          ? 'text-yellow-600 dark:text-yellow-300'
                          : task.color === 'red'
                            ? 'text-red-600 dark:text-red-400'
                            : task.color === 'blue'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-purple-600 dark:text-purple-400'
                      }
                    />
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{task.title}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{task.count} items</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${task.color === 'yellow'
                        ? 'bg-yellow-600 text-white'
                        : task.color === 'red'
                          ? 'bg-red-600 text-white'
                          : task.color === 'blue'
                            ? 'bg-blue-600 text-white'
                            : 'bg-purple-600 text-white'}
                    `}
                  >
                    {task.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today Schedule */}
        <div className="rounded-xl shadow-sm border p-6" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>Lịch hôm nay</h3>
          <div className="space-y-3">
            {todaySchedule.map((schedule, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{schedule.time}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{schedule.type === 'receive' ? 'Nhận' : 'Trả'}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{schedule.customer}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{schedule.car}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${schedule.status === 'completed' ? 'bg-green-100 text-green-700' :
                  schedule.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                  {schedule.status === 'completed' ? 'Xong' :
                    schedule.status === 'overdue' ? 'Quá hạn' : 'Chờ'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;