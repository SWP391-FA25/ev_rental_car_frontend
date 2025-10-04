import { useEffect, useState } from 'react';
import { Input } from "../../shared/components/ui/input";
import { MoreHorizontal, SearchIcon, FilterIcon } from "lucide-react";
import { apiClient } from '../../shared/lib/apiClient';
import { endpoints } from '../../shared/lib/endpoints';
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
import UserDetails from "../../admin/components/UserDetails";

export default function StaffUserList() {
    const [userData, setUserData] = useState([]);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);
                setError('');
                const response = await apiClient.get(endpoints.staff.getAll());
                const staff = response.data?.staff || [];
                const formatted = staff.map(staff => ({
                    id: staff.id,
                    name: staff.name,
                    role: staff.role,
                    status: staff.accountStatus,
                    address: staff.address,
                    phone: staff.phone,
                    email: staff.email,
                }));
                setUserData(formatted);
            } catch (err) {
                setError(err.message || 'Failed to fetch staff');
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const getStatusBadgeVariant = status => {
        switch (status) {
            case 'ACTIVE':
                return 'default';
            case 'SUSPENDED':
                return 'secondary';
            case 'BANNED':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className='rounded-lg border bg-card mx-4 lg:mx-6'>
            <div className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Staff Management</h3>
                <div className="relative mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search staff..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <FilterIcon className="mr-2 h-4 w-4" />
                                    Role: {filterRole || "All"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setFilterRole("")}>All</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterRole("manager")}>Manager</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterRole("staff")}>Staff</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <FilterIcon className="mr-2 h-4 w-4" />
                                    Status: {filterStatus || "All"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setFilterStatus("")}>All</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus("ACTIVE")}>Active</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus("SUSPENDED")}>Suspended</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus("BANNED")}>Banned</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="rounded-md border min-h-[400px]">
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
                            {userData
                                .filter(staff => {
                                    const keyword = search.toLowerCase();
                                    if (
                                        keyword &&
                                        !(
                                            staff.name.toLowerCase().includes(keyword) ||
                                            staff.email.toLowerCase().includes(keyword) ||
                                            staff.phone.toLowerCase().includes(keyword)
                                        )
                                    ) {
                                        return false;
                                    }
                                    if (filterRole && staff.role !== filterRole) return false;
                                    if (filterStatus && staff.status !== filterStatus) return false;
                                    return true;
                                })
                                .map((staff, i) => (
                                    <TableRow key={staff.id || i}>
                                        <TableCell className="font-medium">{staff.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{staff.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(staff.status)}>{staff.status}</Badge>
                                        </TableCell>
                                        <TableCell>{staff.address}</TableCell>
                                        <TableCell>{staff.phone}</TableCell>
                                        <TableCell>{staff.email}</TableCell>
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
                                                            setSelectedUserId(staff.id);
                                                            setIsDetailsOpen(true);
                                                        }}
                                                    >
                                                        View Profile
                                                    </DropdownMenuItem>
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
                <UserDetails
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    userId={selectedUserId}
                />
            </div>
        </div>
    );
}
