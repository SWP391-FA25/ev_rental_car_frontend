import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../shared/components/ui/chart';

export default function RevenueAreaChart({ monthlyRevenue }) {
  const points = Array.isArray(monthlyRevenue) ? monthlyRevenue : [];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = points.map((v, i) => ({ month: monthNames[i], revenue: Number(v || 0) }));
  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))',
    },
  };

  if (!points.length || points.every(v => Number(v || 0) === 0)) {
    return (
      <div className='text-sm text-muted-foreground'>
        No data for selected year
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
      <AreaChart data={chartData} margin={{ left: 0, right: 10 }}>
        <defs>
          <linearGradient id='fillRevenue' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='var(--color-revenue)' stopOpacity={0.9} />
            <stop offset='95%' stopColor='var(--color-revenue)' stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey='month'
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={value => value}
          minTickGap={16}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={0}
          domain={[0, 'dataMax']}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator='dot' labelKey='month' />}
        />
        <Area
          dataKey='revenue'
          type='monotone'
          fill='url(#fillRevenue)'
          stroke='var(--color-revenue)'
        />
      </AreaChart>
    </ChartContainer>
  );
}