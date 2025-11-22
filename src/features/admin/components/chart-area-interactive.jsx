import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../shared/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../shared/components/ui/toggle-group';
import { useIsMobile } from '../hooks/use-mobile';
import { useTranslation } from 'react-i18next';

const chartConfig = {
  desktop: {
    label: 'Completed Bookings',
    color: 'hsl(var(--chart-1))',
  },
};

export function ChartAreaInteractive() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('30d');
  const [completedChartData, setCompletedChartData] = React.useState([]);
  const [loadingCompletedChart, setLoadingCompletedChart] = React.useState(false);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  React.useEffect(() => {
    async function fetchCompletedChartData() {
      setLoadingCompletedChart(true);
      try {
        const res = await axios.get('/api/bookings');
        const bookings = res.data?.data?.bookings || res.data?.bookings || res.data || [];

        // Filter only COMPLETED bookings (no date range filter)
        const filtered = bookings.filter(b => {
          const completedDate = b.actualEndDate || b.endTime || b.createdAt;
          return completedDate && (b.status || b.bookingStatus) === 'COMPLETED';
        });

        if (filtered.length === 0) {
          setCompletedChartData([]);
          return;
        }

        // Find date range from actual data
        const dates = filtered.map(b => new Date(b.actualEndDate || b.endTime || b.createdAt));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        // Fill in all dates in range with 0 by default
        const dateMap = {};
        const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
        for (let i = 0; i <= daysDiff; i++) {
          const d = new Date(minDate);
          d.setDate(minDate.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          dateMap[key] = { date: key, completed: 0 };
        }

        // Count completed bookings per day
        filtered.forEach(b => {
          const d = new Date(b.actualEndDate || b.endTime || b.createdAt).toISOString().slice(0, 10);
          if (dateMap[d]) {
            dateMap[d].completed++;
          }
        });

        const chartArr = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
        setCompletedChartData(chartArr);
      } catch (err) {
        console.error('Error fetching completed bookings chart:', err);
      } finally {
        setLoadingCompletedChart(false);
      }
    }

    fetchCompletedChartData();
  }, [timeRange]);

  const CustomCompletedTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const value = payload[0].value;
    const date = new Date(label);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getFullYear()}`;
    return (
      <div className="rounded-md border bg-background p-2 shadow-sm">
        <div className="text-sm font-medium text-muted-foreground">
          {formattedDate}
        </div>
        <div className="text-sm font-medium text-foreground">
          Bookings completed: <span className="text-sm font-bold text-foreground">{value}</span>
        </div>
      </div>
    );
  };


  return (
    <Card className='@container/card'>
      <CardHeader className='relative'>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>
          Bookings have been completed
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
              {t('admin.dashboard.userActivity.filter.last3Months')}
            </ToggleGroupItem>
            <ToggleGroupItem value='30d' className='h-8 px-2.5'>
              {t('admin.dashboard.userActivity.filter.last30Days')}
            </ToggleGroupItem>
            <ToggleGroupItem value='7d' className='h-8 px-2.5'>
              {t('admin.dashboard.userActivity.filter.last7Days')}
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className='@[767px]/card:hidden flex w-40' aria-label='Select a value'>
              <SelectValue placeholder={t('admin.dashboard.userActivity.filter.last3Months')} />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              <SelectItem value='90d' className='rounded-lg'>
                {t('admin.dashboard.userActivity.filter.last3Months')}
              </SelectItem>
              <SelectItem value='30d' className='rounded-lg'>
                {t('admin.dashboard.userActivity.filter.last30Days')}
              </SelectItem>
              <SelectItem value='7d' className='rounded-lg'>
                {t('admin.dashboard.userActivity.filter.last7Days')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <AreaChart data={completedChartData}>
            <defs>
              <linearGradient id='fillDesktop' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-desktop)' stopOpacity={1.0} />
                <stop offset='95%' stopColor='var(--color-desktop)' stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={value => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                }); // → "Oct 30"
              }}

            />
            <ChartTooltip
              cursor={false}
              content={<CustomCompletedTooltip />}
            />


            <Area
              dataKey='completed'
              type='natural'
              fill='url(#fillDesktop)'
              stroke='var(--color-desktop)'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
