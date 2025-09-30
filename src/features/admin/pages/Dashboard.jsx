import { useEffect, useState } from 'react';
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
import { ChartAreaInteractive } from '../components/chart-area-interactive';
import { SectionCards } from '../components/section-cards';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/components/ui/table";
import { Badge } from "../../shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../shared/components/ui/dropdown-menu";
import { Button } from "../../shared/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import UserDetails from "../components/UserDetails";

export default function Dashboard() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State cho UserDetails
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.get(endpoints.renters.getAll());
        const renters = response.data?.renters || [];
        const formatted = renters.map(renter => ({
          id: renter.id,
          name: renter.name,
          role: renter.role,
          status: renter.accountStatus,
          address: renter.address,
          phone: renter.phone,
          email: renter.email,
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
      {/* Cards + Chart */}
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

          {loading ? (
            <div className='py-8 text-center'>Loading users...</div>
          ) : error ? (
            <div className='py-8 text-center text-red-500'>Error: {error}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.map((renter, i) => (
                    <TableRow key={renter.id || i}>
                      <TableCell className="font-medium">{renter.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{renter.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                          {renter.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{renter.address}</TableCell>
                      <TableCell>{renter.phone}</TableCell>
                      <TableCell>{renter.email}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserId(renter.id);
                                setIsDetailsOpen(true);
                              }}
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Account</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* UserDetails dialog */}
      <UserDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        userId={selectedUserId}
      />
    </>
  );
}
