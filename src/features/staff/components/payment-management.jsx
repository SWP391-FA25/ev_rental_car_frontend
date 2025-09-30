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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
            <CardTitle className='text-sm font-medium'>
              {t('staffPayments.overview.totalRevenue')}
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${totalRevenue.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>
              <TrendingUp className='inline h-3 w-3 mr-1' />
              {t('staffPayments.overview.deltaRevenue')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('staffPayments.overview.pendingPayments')}
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{pendingPayments}</div>
            <p className='text-xs text-muted-foreground'>
              {t('staffPayments.overview.awaitingProcessing')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('staffPayments.overview.failedPayments')}
            </CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {failedPayments}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('staffPayments.overview.requireAttention')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('staffPayments.overview.totalRefunds')}
            </CardTitle>
            <Undo className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${totalRefunds.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>
              <TrendingDown className='inline h-3 w-3 mr-1' />
              {t('staffPayments.overview.thisMonth')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('staffPayments.transactions.title')}</CardTitle>
          <CardDescription>
            {t('staffPayments.transactions.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('staffPayments.table.paymentId')}</TableHead>
                <TableHead>{t('staffPayments.table.customer')}</TableHead>
                <TableHead>{t('staffPayments.table.amount')}</TableHead>
                <TableHead>{t('staffPayments.table.method')}</TableHead>
                <TableHead>{t('staffPayments.table.status')}</TableHead>
                <TableHead>{t('staffPayments.table.date')}</TableHead>
                <TableHead className='text-right'>
                  {t('staffPayments.table.actions')}
                </TableHead>
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
                        <DropdownMenuLabel>
                          {t('staffPayments.menu.actions')}
                        </DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Receipt className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.generateReceipt')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <RefreshCw className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.retryPayment')}
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
  const { t } = useTranslation();
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
          <CardTitle>{t('staffPayments.process.title')}</CardTitle>
          <CardDescription>
            {t('staffPayments.process.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>{t('staffPayments.process.bookingCustomer')}</Label>
              <Select
                value={selectedPayment}
                onValueChange={setSelectedPayment}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('staffPayments.process.bookingPlaceholder')}
                  />
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
              <Label>{t('staffPayments.common.amount')}</Label>
              <Input
                type='number'
                placeholder={t('staffPayments.placeholders.amount')}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                step='0.01'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>{t('staffPayments.common.method')}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('staffPayments.placeholders.method')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='cash'>
                  {t('staffPayments.methods.cash')}
                </SelectItem>
                <SelectItem value='credit-card'>
                  {t('staffPayments.methods.creditCard')}
                </SelectItem>
                <SelectItem value='debit-card'>
                  {t('staffPayments.methods.debitCard')}
                </SelectItem>
                <SelectItem value='bank-transfer'>
                  {t('staffPayments.methods.bankTransfer')}
                </SelectItem>
                <SelectItem value='digital-wallet'>
                  {t('staffPayments.methods.digitalWallet')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>{t('staffPayments.process.notes')}</Label>
            <Textarea
              placeholder={t('staffPayments.placeholders.notes')}
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
            {t('staffPayments.actions.processPayment')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending & Failed Payments</CardTitle>
          <CardDescription>
            {t('staffPayments.process.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('staffPayments.table.paymentId')}</TableHead>
                <TableHead>{t('staffPayments.table.customer')}</TableHead>
                <TableHead>{t('staffPayments.table.amount')}</TableHead>
                <TableHead>{t('staffPayments.table.status')}</TableHead>
                <TableHead>{t('staffPayments.table.failureReason')}</TableHead>
                <TableHead>{t('staffPayments.table.date')}</TableHead>
                <TableHead className='text-right'>
                  {' '}
                  {t('staffPayments.table.actions')}
                </TableHead>
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
                        <DropdownMenuLabel>
                          {t('staffPayments.menu.actions')}
                        </DropdownMenuLabel>
                        <DropdownMenuItem>
                          <RefreshCw className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.retryPayment')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.manualPayment')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Ban className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.cancelPayment')}
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
  const { t } = useTranslation();
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
          <CardTitle>{t('staffPayments.refunds.title')}</CardTitle>
          <CardDescription>
            {t('staffPayments.refunds.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>{t('staffPayments.refunds.selectPayment')}</Label>
            <Select value={selectedPayment} onValueChange={setSelectedPayment}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('staffPayments.refunds.paymentPlaceholder')}
                />
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
              <Label>{t('staffPayments.refunds.amount')}</Label>
              <Input
                type='number'
                placeholder={t('staffPayments.placeholders.refundAmount')}
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
                step='0.01'
              />
            </div>
            <div className='space-y-2'>
              <Label>{t('staffPayments.refunds.type')}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('staffPayments.refunds.typePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='full'>
                    {t('staffPayments.refunds.types.full')}
                  </SelectItem>
                  <SelectItem value='partial'>
                    {t('staffPayments.refunds.types.partial')}
                  </SelectItem>
                  <SelectItem value='adjustment'>
                    {t('staffPayments.refunds.types.adjustment')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>{t('staffPayments.refunds.reason')}</Label>
            <Textarea
              placeholder={t('staffPayments.placeholders.refundReason')}
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
            {t('staffPayments.actions.processRefund')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('staffPayments.history.title')}</CardTitle>
          <CardDescription>
            {t('staffPayments.history.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('staffPayments.history.refundId')}</TableHead>
                <TableHead>{t('staffPayments.table.customer')}</TableHead>
                <TableHead>
                  {t('staffPayments.history.originalAmount')}
                </TableHead>
                <TableHead>{t('staffPayments.history.refundAmount')}</TableHead>
                <TableHead>{t('staffPayments.history.reason')}</TableHead>
                <TableHead>{t('staffPayments.table.status')}</TableHead>
                <TableHead>{t('staffPayments.history.processedBy')}</TableHead>
                <TableHead className='text-right'>
                  {t('staffPayments.table.actions')}
                </TableHead>
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
                        <DropdownMenuLabel>
                          {t('staffPayments.menu.actions')}
                        </DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.downloadReceipt')}
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
  const { t } = useTranslation();
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
          <h3 className='text-lg font-medium'>
            {t('staffPayments.issues.title')}
          </h3>
          <p className='text-sm text-muted-foreground'>
            {t('staffPayments.issues.subtitle')}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              {t('staffPayments.issues.reportIssue')}
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>
                {t('staffPayments.issues.dialog.title')}
              </DialogTitle>
              <DialogDescription>
                {t('staffPayments.issues.dialog.subtitle')}
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='space-y-2'>
                <Label>{t('staffPayments.issues.dialog.issueType')}</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'staffPayments.issues.dialog.issueTypePlaceholder'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='payment-failed'>
                      {t('staffPayments.issues.types.paymentFailed')}
                    </SelectItem>
                    <SelectItem value='billing-dispute'>
                      {t('staffPayments.issues.types.billingDispute')}
                    </SelectItem>
                    <SelectItem value='overcharge'>
                      {t('staffPayments.issues.types.overcharge')}
                    </SelectItem>
                    <SelectItem value='duplicate-charge'>
                      {t('staffPayments.issues.types.duplicateCharge')}
                    </SelectItem>
                    <SelectItem value='refund-request'>
                      {t('staffPayments.issues.types.refundRequest')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>{t('staffPayments.issues.dialog.priority')}</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'staffPayments.issues.dialog.priorityPlaceholder'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='High'>
                      {t('staffPayments.issues.priority.high')}
                    </SelectItem>
                    <SelectItem value='Medium'>
                      {t('staffPayments.issues.priority.medium')}
                    </SelectItem>
                    <SelectItem value='Low'>
                      {t('staffPayments.issues.priority.low')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>{t('staffPayments.issues.dialog.description')}</Label>
                <Textarea
                  placeholder={t(
                    'staffPayments.issues.dialog.descriptionPlaceholder'
                  )}
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
                {t('staffPayments.issues.dialog.create')}
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
                <TableHead>{t('staffPayments.issues.table.issueId')}</TableHead>
                <TableHead>{t('staffPayments.table.customer')}</TableHead>
                <TableHead>{t('staffPayments.issues.table.type')}</TableHead>
                <TableHead>
                  {t('staffPayments.issues.table.priority')}
                </TableHead>
                <TableHead>
                  {t('staffPayments.issues.table.description')}
                </TableHead>
                <TableHead>{t('staffPayments.table.status')}</TableHead>
                <TableHead>
                  {t('staffPayments.issues.table.assignedTo')}
                </TableHead>
                <TableHead className='text-right'>
                  {t('staffPayments.table.actions')}
                </TableHead>
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
                        <DropdownMenuLabel>
                          {t('staffPayments.menu.actions')}
                        </DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.addNote')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CheckCircle className='mr-2 h-4 w-4' />
                          {t('staffPayments.menu.markResolved')}
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
  const { t } = useTranslation();
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          {t('staffPayments.title')}
        </h2>
        <p className='text-muted-foreground'>{t('staffPayments.subtitle')}</p>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>
            {t('staffPayments.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value='process'>
            {t('staffPayments.tabs.process')}
          </TabsTrigger>
          <TabsTrigger value='refunds'>
            {t('staffPayments.tabs.refunds')}
          </TabsTrigger>
          <TabsTrigger value='issues'>
            {t('staffPayments.tabs.issues')}
          </TabsTrigger>
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
