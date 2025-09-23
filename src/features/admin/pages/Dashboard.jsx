import { ChartAreaInteractive } from '../components/chart-area-interactive';
import { DataTable } from '../components/data-table';
import { SectionCards } from '../components/section-cards';

// Mock data for user accounts table
const mockUserData = [
  {
    id: 1,
    header: 'John Smith',
    type: 'Premium',
    status: 'Active',
    target: '15',
    limit: '20',
    reviewer: 'john.smith@email.com',
  },
  {
    id: 2,
    header: 'Sarah Johnson',
    type: 'Standard',
    status: 'Active',
    target: '8',
    limit: '10',
    reviewer: 'sarah.j@email.com',
  },
  {
    id: 3,
    header: 'Mike Chen',
    type: 'Basic',
    status: 'Suspended',
    target: '2',
    limit: '5',
    reviewer: 'mike.chen@email.com',
  },
  {
    id: 4,
    header: 'Emma Wilson',
    type: 'Premium',
    status: 'Active',
    target: '12',
    limit: '20',
    reviewer: 'emma.w@email.com',
  },
  {
    id: 5,
    header: 'David Brown',
    type: 'Standard',
    status: 'Pending',
    target: '0',
    limit: '10',
    reviewer: 'david.brown@email.com',
  },
];

export default function Dashboard() {
  return (
    <>
      <SectionCards />
      <div className='grid gap-6 lg:grid-cols-2 px-4 lg:px-6'>
        <ChartAreaInteractive />
        <div className='flex flex-col gap-4'>
          <div className='rounded-lg border bg-card p-6'>
            <h3 className='text-lg font-semibold mb-4'>Recent User Activity</h3>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-green-500'></div>
                <span className='text-sm text-muted-foreground'>
                  New user registration: Sarah Johnson
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                <span className='text-sm text-muted-foreground'>
                  Account upgraded: John Smith → Premium
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-orange-500'></div>
                <span className='text-sm text-muted-foreground'>
                  Account suspended: Mike Chen
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-purple-500'></div>
                <span className='text-sm text-muted-foreground'>
                  Password reset requested: Emma Wilson
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
          <DataTable data={mockUserData} />
        </div>
      </div>
    </>
  );
}
