import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import axios from 'axios';
import { endpoints } from '../../shared/lib/endpoints';

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
    label: 'New Users',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Active Users',
    color: 'hsl(var(--chart-2))',
  },
};

export function ChartAreaInteractive() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('30d');
  const [chartData, setChartData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  React.useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const renterRes = await axios.get(endpoints.renters.getAll(), { withCredentials: true });
        const renters = renterRes.data.data.renters || [];
        // Lọc theo timeRange
        const now = new Date();
        let days = 30;
        if (timeRange === '90d') days = 90;
        if (timeRange === '7d') days = 7;
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);
        const filtered = renters.filter(u => {
          if (!u.createdAt) return false;
          const d = new Date(u.createdAt);
          return d >= startDate && d <= now;
        });
        // Gom nhóm theo ngày
        const dateMap = {};
        filtered.forEach(u => {
          const d = new Date(u.createdAt).toISOString().slice(0, 10);
          if (!dateMap[d]) dateMap[d] = { date: d, desktop: 0 };
          dateMap[d].desktop++;
        });
        // Chuyển thành mảng, sort theo ngày
        const chartArr = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
        setChartData(chartArr);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, [timeRange]);

  return (
    <Card className='@container/card'>
      <CardHeader className='relative'>
        <CardTitle>{t('admin.dashboard.userActivity.title')}</CardTitle>
        <CardDescription>
          <span className='@[540px]/card:block hidden'>
            {t('admin.dashboard.userActivity.subtitleLong')}
          </span>
          <span className='@[540px]/card:hidden'>{t('admin.dashboard.userActivity.subtitleShort')}</span>
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
            <SelectTrigger
              className='@[767px]/card:hidden flex w-40'
              aria-label='Select a value'
            >
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
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id='fillDesktop' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-desktop)'
                  stopOpacity={1.0}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-desktop)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillMobile' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-mobile)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-mobile)'
                  stopOpacity={0.1}
                />
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
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={value => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  indicator='dot'
                />
              }
            />
            <Area
              dataKey='mobile'
              type='natural'
              fill='url(#fillMobile)'
              stroke='var(--color-mobile)'
              stackId='a'
            />
            <Area
              dataKey='desktop'
              type='natural'
              fill='url(#fillDesktop)'
              stroke='var(--color-desktop)'
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
