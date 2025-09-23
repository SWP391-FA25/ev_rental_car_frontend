import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

import { Badge } from '../../shared/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';

export function SectionCards() {
  return (
    <div className='*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6'>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            1,847
          </CardTitle>
          <div className='absolute right-4 top-4'>
            <Badge variant='outline' className='flex gap-1 rounded-lg text-xs'>
              <TrendingUpIcon className='size-3' />
              +8.2%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Growing user base <TrendingUpIcon className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            New users this month: +127
          </div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>Active Users</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            1,623
          </CardTitle>
          <div className='absolute right-4 top-4'>
            <Badge variant='outline' className='flex gap-1 rounded-lg text-xs'>
              <TrendingUpIcon className='size-3' />
              +5.1%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            High engagement rate <TrendingUpIcon className='size-4' />
          </div>
          <div className='text-muted-foreground'>87.9% of users are active</div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>Premium Users</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            342
          </CardTitle>
          <div className='absolute right-4 top-4'>
            <Badge variant='outline' className='flex gap-1 rounded-lg text-xs'>
              <TrendingUpIcon className='size-3' />
              +18.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Premium upgrades rising <TrendingUpIcon className='size-4' />
          </div>
          <div className='text-muted-foreground'>18.5% of total users</div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>Account Issues</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            23
          </CardTitle>
          <div className='absolute right-4 top-4'>
            <Badge variant='outline' className='flex gap-1 rounded-lg text-xs'>
              <TrendingDownIcon className='size-3' />
              -12%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Issues decreasing <TrendingDownIcon className='size-4' />
          </div>
          <div className='text-muted-foreground'>Improved support response</div>
        </CardFooter>
      </Card>
    </div>
  );
}
