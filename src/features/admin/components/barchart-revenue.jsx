'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from 'recharts';
import axios from 'axios';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import { ChartContainer, ChartTooltip } from '../../shared/components/ui/chart';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../shared/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';

const chartConfig = {
  desktop: {
    label: 'Total Revenue',
    color: '#6b7280', // Tailwind gray-500
  },
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;

  return (
    <div className='rounded-md border bg-background p-2 shadow-sm'>
      <div className='text-sm font-medium text-muted-foreground'>{label}</div>
      <div className='text-sm font-medium text-foreground'>
        Total Revenue:{' '}
        <span className='text-sm font-bold text-foreground'>
          {value.toLocaleString('vi-VN')} ₫
        </span>
      </div>
    </div>
  );
};

export function ChartBarDefault() {
  const [timeRange, setTimeRange] = React.useState('30d');
  const [chartData, setChartData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchRevenueData() {
      setLoading(true);
      try {
        const res = await axios.get('/api/bookings');
        const bookings =
          res.data?.data?.bookings || res.data?.bookings || res.data || [];

        const now = new Date();
        let days = 30;
        if (timeRange === '90d') days = 90;
        if (timeRange === '7d') days = 7;
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);

        const filtered = bookings.filter(b => {
          const completedDate = b.actualEndTime;
          if (!completedDate) return false;
          const d = new Date(completedDate);
          return (
            (b.status || b.bookingStatus) === 'COMPLETED' &&
            d >= startDate &&
            d <= now
          );
        });

        let chartArr = [];

        if (timeRange === '90d') {
          const revenueByMonth = {};

          filtered.forEach(b => {
            const d = new Date(b.actualEndTime);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const base = b.basePrice || 0;
            const insurance = b.insuranceAmount || 0;
            const discount = b.discountAmount || 0;
            const revenue = base + insurance - discount;
            if (!revenueByMonth[key]) revenueByMonth[key] = 0;
            revenueByMonth[key] += revenue;
          });

          chartArr = Object.entries(revenueByMonth)
            .map(([key, value]) => {
              const [year, month] = key.split('-');
              const dateObj = new Date(`${year}-${month}-01`);
              return {
                date: dateObj.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                }),
                totalRevenue: value,
                sortKey: dateObj.getTime(),
              };
            })
            .sort((a, b) => a.sortKey - b.sortKey)
            .map(({ sortKey, ...rest }) => rest);
        } else {
          const revenueByDay = {};

          filtered.forEach(b => {
            const d = new Date(b.actualEndTime);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            const base = b.basePrice || 0;
            const insurance = b.insuranceAmount || 0;
            const discount = b.discountAmount || 0;
            const revenue = base + insurance - discount;
            if (!revenueByDay[key]) revenueByDay[key] = 0;
            revenueByDay[key] += revenue;
          });

          const sortedDates = Object.keys(revenueByDay).sort(
            (a, b) => new Date(a) - new Date(b)
          );
          chartArr = sortedDates.map(dateStr => {
            const date = new Date(dateStr);
            return {
              date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              totalRevenue: revenueByDay[dateStr],
            };
          });
        }

        setChartData(chartArr);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenueData();
  }, [timeRange]);

  const isSingle = chartData.length === 1;

  return (
    <Card className='@container/card'>
      <CardHeader className='relative'>
        <CardTitle>Revenue Chart</CardTitle>
        <CardDescription>
          Total revenue from completed bookings
          {timeRange === '90d' && ' over the past 3 months'}
          {timeRange === '30d' && ' in the last 30 days'}
          {timeRange === '7d' && ' in the last 7 days'}
        </CardDescription>
        <div className='absolute right-4 top-4'>
          <ToggleGroup
            type='single'
            value={timeRange}
            onValueChange={setTimeRange}
            variant='outline'
            className='@[767px]/card:flex hidden'
          >
            <ToggleGroupItem value='90d' className='h-8 px-2.5'>
              Last 3 Months
            </ToggleGroupItem>
            <ToggleGroupItem value='30d' className='h-8 px-2.5'>
              Last 30 Days
            </ToggleGroupItem>
            <ToggleGroupItem value='7d' className='h-8 px-2.5'>
              Last 7 Days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className='@[767px]/card:hidden flex w-40'
              aria-label='Select time range'
            >
              <SelectValue placeholder='Last 3 Months' />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              <SelectItem value='90d' className='rounded-lg'>
                Last 3 Months
              </SelectItem>
              <SelectItem value='30d' className='rounded-lg'>
                Last 30 Days
              </SelectItem>
              <SelectItem value='7d' className='rounded-lg'>
                Last 7 Days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {isSingle ? (
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-sm text-muted-foreground'>
                Revenue on {chartData[0]?.date}
              </div>
              <div className='text-3xl font-bold'>
                {(chartData[0]?.totalRevenue || 0).toLocaleString('vi-VN')} ₫
              </div>
            </div>
            <div className='w-48 h-28'>
              <ChartContainer config={chartConfig} className='h-full w-full'>
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  barSize={28}
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='date' tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<CustomTooltip />} />
                  <Bar
                    dataKey='totalRevenue'
                    fill='var(--color-desktop)'
                    radius={[10, 10, 0, 0]}
                  >
                    <LabelList
                      dataKey='totalRevenue'
                      position='top'
                      formatter={v => `${v.toLocaleString('vi-VN')} ₫`}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <BarChart accessibilityLayer data={chartData} barCategoryGap='28%'>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Bar
                dataKey='totalRevenue'
                fill='var(--color-desktop)'
                radius={[10, 10, 0, 0]}
              >
                <LabelList dataKey='totalRevenue' position='top' formatter={(v) => `${v.toLocaleString('vi-VN')} ₫`} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
