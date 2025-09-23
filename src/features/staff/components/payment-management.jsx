import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  Receipt,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Undo,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '../../shared/components/ui/badge';
import { Button } from '../../shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../shared/components/ui/tabs';
import { Textarea } from '../../shared/components/ui/textarea';

const mockPayments = [
  {
    id: 'PAY001',
    bookingId: 'BOOK001',
    customer: {
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      id: 'CUST001',
    },
    amount: 245.5,
    currency: 'USD',
    method: 'Credit Card (Visa **** 1234)',
    status: 'Completed',
    transactionDate: '2024-01-20T09:15:00Z',
    dueDate: '2024-01-22T18:00:00Z',
    description: 'Tesla Model 3 rental - 3 days',
    breakdown: {
      baseRate: 180.0,
      insurance: 45.0,
      taxes: 20.5,
      fees: 0.0,
    },
    refundable: 245.5,
    refunded: 0.0,
  },
  {
    id: 'PAY002',
    bookingId: 'BOOK002',
    customer: {
      name: 'Bob Wilson',
      email: 'bob.wilson@email.com',
      id: 'CUST002',
    },
    amount: 120.75,
    currency: 'USD',
    method: 'Debit Card (MC **** 5678)',
    status: 'Pending',
    transactionDate: '2024-01-21T14:30:00Z',
    dueDate: '2024-01-23T12:00:00Z',
    description: 'Nissan Leaf rental - 2 days',
    breakdown: {
      baseRate: 90.0,
      insurance: 22.5,
      taxes: 8.25,
      fees: 0.0,
    },
    refundable: 120.75,
    refunded: 0.0,
  },
  {
    id: 'PAY003',
    bookingId: 'BOOK003',
    customer: {
      name: 'Carol Davis',
      email: 'carol.davis@email.com',
      id: 'CUST003',
    },
    amount: 89.99,
    currency: 'USD',
    method: 'Digital Wallet (PayPal)',
    status: 'Failed',
    transactionDate: '2024-01-19T16:45:00Z',
    dueDate: '2024-01-21T10:00:00Z',
    description: 'BMW i3 rental - 1 day',
    breakdown: {
      baseRate: 70.0,
      insurance: 15.0,
      taxes: 4.99,
      fees: 0.0,
    },
    refundable: 0.0,
    refunded: 0.0,
    failureReason: 'Insufficient funds',
  },
  {
    id: 'PAY004',
    bookingId: 'BOOK004',
    customer: {
      name: 'David Kim',
      email: 'david.kim@email.com',
      id: 'CUST004',
    },
    amount: 320.25,
    currency: 'USD',
    method: 'Credit Card (Amex **** 9012)',
    status: 'Refunded',
    transactionDate: '2024-01-15T11:20:00Z',
    dueDate: '2024-01-18T15:00:00Z',
    description: 'Tesla Model S rental - 4 days',
    breakdown: {
      baseRate: 240.0,
      insurance: 60.0,
      taxes: 20.25,
      fees: 0.0,
    },
    refundable: 0.0,
    refunded: 320.25,
    refundDate: '2024-01-16T10:30:00Z',
    refundReason: 'Customer cancellation',
  },
];

const mockRefunds = [
  {
    id: 'REF001',
    paymentId: 'PAY004',
    bookingId: 'BOOK004',
    customer: 'David Kim',
    originalAmount: 320.25,
    refundAmount: 320.25,
    reason: 'Customer cancellation',
    requestDate: '2024-01-16T09:00:00Z',
    processedDate: '2024-01-16T10:30:00Z',
    status: 'Completed',
    processedBy: 'John Smith',
  },
  {
    id: 'REF002',
    paymentId: 'PAY005',
    bookingId: 'BOOK005',
    customer: 'Emma Brown',
    originalAmount: 150.0,
    refundAmount: 75.0,
    reason: 'Partial refund - early return',
    requestDate: '2024-01-17T14:15:00Z',
    processedDate: null,
    status: 'Pending',
    processedBy: null,
  },
];

const mockBillingIssues = [
  {
    id: 'ISSUE001',
    paymentId: 'PAY003',
    customer: 'Carol Davis',
    type: 'Payment Failed',
    description: 'Payment declined due to insufficient funds',
    priority: 'High',
    reportedDate: '2024-01-19T16:50:00Z',
    status: 'Open',
    assignedTo: 'Sarah Johnson',
    resolution: null,
  },
  {
    id: 'ISSUE002',
    paymentId: 'PAY001',
    customer: 'Alice Johnson',
    type: 'Billing Dispute',
    description: 'Customer disputes insurance charge',
    priority: 'Medium',
    reportedDate: '2024-01-20T11:30:00Z',
    status: 'In Review',
    assignedTo: 'John Smith',
    resolution: null,
  },
  {
    id: 'ISSUE003',
    paymentId: 'PAY006',
    customer: 'Frank Miller',
    type: 'Overcharge',
    description: 'Customer charged twice for the same booking',
    priority: 'High',
    reportedDate: '2024-01-18T09:45:00Z',
    status: 'Resolved',
    assignedTo: 'Mike Chen',
    resolution: 'Duplicate charge refunded - $125.00',
  },
];

function PaymentStatusBadge({ status }) {
  const config = {
    Completed: {
      variant: 'default',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    Pending: { variant: 'secondary', icon: Clock, color: 'text-blue-600' },
    Failed: {
      variant: 'destructive',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    Refunded: { variant: 'outline', icon: Undo, color: 'text-gray-600' },
    Cancelled: { variant: 'destructive', icon: Ban, color: 'text-red-600' },
  };

  const { variant, icon: Icon, color } = config[status] || config['Pending'];

  return (
    <Badge variant={variant} className='gap-1'>
      <Icon className={`h-3 w-3 ${color}`} />
      {status}
    </Badge>
  );
}

function PaymentOverview() {
  const totalRevenue = mockPayments
    .filter(payment => payment.status === 'Completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingPayments = mockPayments.filter(
    payment => payment.status === 'Pending'
  ).length;
  const failedPayments = mockPayments.filter(
    payment => payment.status === 'Failed'
  ).length;
  const totalRefunds = mockPayments
    .filter(payment => payment.status === 'Refunded')
    .reduce((sum, payment) => sum + payment.refunded, 0);

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${totalRevenue.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>
              <TrendingUp className='inline h-3 w-3 mr-1' />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Payments
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{pendingPayments}</div>
            <p className='text-xs text-muted-foreground'>Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Failed Payments
            </CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {failedPayments}
            </div>
            <p className='text-xs text-muted-foreground'>Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Refunds</CardTitle>
            <Undo className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${totalRefunds.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>
              <TrendingDown className='inline h-3 w-3 mr-1' />
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest payment transactions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayments.slice(0, 5).map(payment => (
                <TableRow key={payment.id}>
                  <TableCell className='font-medium'>{payment.id}</TableCell>
                  <TableCell>{payment.customer.name}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(payment.transactionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='z-50'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Receipt className='mr-2 h-4 w-4' />
                          Generate Receipt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <RefreshCw className='mr-2 h-4 w-4' />
                          Retry Payment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ProcessPayments() {
  const [selectedPayment, setSelectedPayment] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const pendingPayments = mockPayments.filter(
    payment => payment.status === 'Pending' || payment.status === 'Failed'
  );

  const handleProcessPayment = () => {
    console.log('Processing payment:', {
      selectedPayment,
      amount,
      paymentMethod,
      notes,
    });
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Process Manual Payment</CardTitle>
          <CardDescription>
            Process payments manually for cash transactions or payment
            corrections
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Booking/Customer</Label>
              <Select
                value={selectedPayment}
                onValueChange={setSelectedPayment}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select booking for payment' />
                </SelectTrigger>
                <SelectContent>
                  {pendingPayments.map(payment => (
                    <SelectItem key={payment.id} value={payment.id}>
                      {payment.bookingId} - {payment.customer.name} ($
                      {payment.amount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Amount</Label>
              <Input
                type='number'
                placeholder='Enter amount'
                value={amount}
                onChange={e => setAmount(e.target.value)}
                step='0.01'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder='Select payment method' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='cash'>Cash</SelectItem>
                <SelectItem value='credit-card'>Credit Card</SelectItem>
                <SelectItem value='debit-card'>Debit Card</SelectItem>
                <SelectItem value='bank-transfer'>Bank Transfer</SelectItem>
                <SelectItem value='digital-wallet'>Digital Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Payment Notes</Label>
            <Textarea
              placeholder='Add any notes about this payment...'
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <Button
            onClick={handleProcessPayment}
            className='w-full'
            disabled={!selectedPayment || !amount || !paymentMethod}
          >
            <CreditCard className='mr-2 h-4 w-4' />
            Process Payment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending & Failed Payments</CardTitle>
          <CardDescription>
            Payments that require attention or retry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Failure Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell className='font-medium'>{payment.id}</TableCell>
                  <TableCell>{payment.customer.name}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>{payment.failureReason || '-'}</TableCell>
                  <TableCell>
                    {new Date(payment.transactionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='z-50'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <RefreshCw className='mr-2 h-4 w-4' />
                          Retry Payment
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className='mr-2 h-4 w-4' />
                          Manual Payment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Ban className='mr-2 h-4 w-4' />
                          Cancel Payment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RefundsAndAdjustments() {
  const [refundAmount, setRefundAmount] = React.useState('');
  const [refundReason, setRefundReason] = React.useState('');
  const [selectedPayment, setSelectedPayment] = React.useState('');

  const refundablePayments = mockPayments.filter(
    payment => payment.status === 'Completed' && payment.refundable > 0
  );

  const handleRefund = () => {
    console.log('Processing refund:', {
      selectedPayment,
      refundAmount,
      refundReason,
    });
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Process Refund</CardTitle>
          <CardDescription>
            Issue refunds for completed payments and booking cancellations
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>Select Payment to Refund</Label>
            <Select value={selectedPayment} onValueChange={setSelectedPayment}>
              <SelectTrigger>
                <SelectValue placeholder='Choose payment for refund' />
              </SelectTrigger>
              <SelectContent>
                {refundablePayments.map(payment => (
                  <SelectItem key={payment.id} value={payment.id}>
                    {payment.id} - {payment.customer.name} ($
                    {payment.refundable} refundable)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Refund Amount</Label>
              <Input
                type='number'
                placeholder='Enter refund amount'
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
                step='0.01'
              />
            </div>
            <div className='space-y-2'>
              <Label>Refund Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='Select refund type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='full'>Full Refund</SelectItem>
                  <SelectItem value='partial'>Partial Refund</SelectItem>
                  <SelectItem value='adjustment'>Billing Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Refund Reason</Label>
            <Textarea
              placeholder='Explain the reason for this refund...'
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
            />
          </div>

          <Button
            onClick={handleRefund}
            className='w-full'
            disabled={!selectedPayment || !refundAmount || !refundReason}
          >
            <Undo className='mr-2 h-4 w-4' />
            Process Refund
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund History</CardTitle>
          <CardDescription>
            Recent refunds and their processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Refund ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Original Amount</TableHead>
                <TableHead>Refund Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processed By</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRefunds.map(refund => (
                <TableRow key={refund.id}>
                  <TableCell className='font-medium'>{refund.id}</TableCell>
                  <TableCell>{refund.customer}</TableCell>
                  <TableCell>${refund.originalAmount.toFixed(2)}</TableCell>
                  <TableCell>${refund.refundAmount.toFixed(2)}</TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {refund.reason}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge
                      status={
                        refund.status === 'Completed' ? 'Completed' : 'Pending'
                      }
                    />
                  </TableCell>
                  <TableCell>{refund.processedBy || 'Pending'}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='z-50'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className='mr-2 h-4 w-4' />
                          Download Receipt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function BillingIssues() {
  const [issueType, setIssueType] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleCreateIssue = () => {
    console.log('Creating billing issue:', {
      issueType,
      priority,
      description,
    });
  };

  const getPriorityBadge = priority => {
    const variants = {
      High: 'destructive',
      Medium: 'default',
      Low: 'secondary',
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const getStatusBadge = status => {
    const variants = {
      Open: 'destructive',
      'In Review': 'default',
      Resolved: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h3 className='text-lg font-medium'>Billing Issues</h3>
          <p className='text-sm text-muted-foreground'>
            Track and resolve payment disputes and billing problems
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>Report Billing Issue</DialogTitle>
              <DialogDescription>
                Create a new billing issue report for investigation
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='space-y-2'>
                <Label>Issue Type</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select issue type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='payment-failed'>
                      Payment Failed
                    </SelectItem>
                    <SelectItem value='billing-dispute'>
                      Billing Dispute
                    </SelectItem>
                    <SelectItem value='overcharge'>Overcharge</SelectItem>
                    <SelectItem value='duplicate-charge'>
                      Duplicate Charge
                    </SelectItem>
                    <SelectItem value='refund-request'>
                      Refund Request
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select priority' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='High'>High</SelectItem>
                    <SelectItem value='Medium'>Medium</SelectItem>
                    <SelectItem value='Low'>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Description</Label>
                <Textarea
                  placeholder='Describe the billing issue in detail...'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateIssue}
                disabled={!issueType || !priority || !description}
              >
                Create Issue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBillingIssues.map(issue => (
                <TableRow key={issue.id}>
                  <TableCell className='font-medium'>{issue.id}</TableCell>
                  <TableCell>{issue.customer}</TableCell>
                  <TableCell>{issue.type}</TableCell>
                  <TableCell>{getPriorityBadge(issue.priority)}</TableCell>
                  <TableCell className='max-w-xs truncate'>
                    {issue.description}
                  </TableCell>
                  <TableCell>{getStatusBadge(issue.status)}</TableCell>
                  <TableCell>{issue.assignedTo}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='z-50'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className='mr-2 h-4 w-4' />
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CheckCircle className='mr-2 h-4 w-4' />
                          Mark Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentManagement() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          Payment Management
        </h2>
        <p className='text-muted-foreground'>
          Process payments, handle refunds, and resolve billing issues
        </p>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='process'>Process Payments</TabsTrigger>
          <TabsTrigger value='refunds'>Refunds & Adjustments</TabsTrigger>
          <TabsTrigger value='issues'>Billing Issues</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <PaymentOverview />
        </TabsContent>

        <TabsContent value='process' className='space-y-4'>
          <ProcessPayments />
        </TabsContent>

        <TabsContent value='refunds' className='space-y-4'>
          <RefundsAndAdjustments />
        </TabsContent>

        <TabsContent value='issues' className='space-y-4'>
          <BillingIssues />
        </TabsContent>
      </Tabs>
    </div>
  );
}
