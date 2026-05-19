import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-900/30 text-green-400 border-green-800' },
  INACTIVE: { label: 'Inactive', className: 'bg-gray-900/30 text-gray-400 border-gray-700' },
  PENDING: { label: 'Pending', className: 'bg-yellow-900/30 text-yellow-400 border-yellow-800' },
  SUSPENDED: { label: 'Suspended', className: 'bg-red-900/30 text-red-400 border-red-800' },
  DRAFT: { label: 'Draft', className: 'bg-gray-900/30 text-gray-400 border-gray-700' },
  SENT: { label: 'Sent', className: 'bg-blue-900/30 text-blue-400 border-blue-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-green-900/30 text-green-400 border-green-800' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-900/30 text-blue-400 border-blue-800' },
  SHIPPED: { label: 'Shipped', className: 'bg-purple-900/30 text-purple-400 border-purple-800' },
  DELIVERED: { label: 'Delivered', className: 'bg-green-900/30 text-green-400 border-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-900/30 text-red-400 border-red-800' },
  ACCEPTED: { label: 'Accepted', className: 'bg-green-900/30 text-green-400 border-green-800' },
  REJECTED: { label: 'Rejected', className: 'bg-red-900/30 text-red-400 border-red-800' },
  EXPIRED: { label: 'Expired', className: 'bg-orange-900/30 text-orange-400 border-orange-800' },
  PAID: { label: 'Paid', className: 'bg-green-900/30 text-green-400 border-green-800' },
  PARTIAL: { label: 'Partial', className: 'bg-yellow-900/30 text-yellow-400 border-yellow-800' },
  OVERDUE: { label: 'Overdue', className: 'bg-red-900/30 text-red-400 border-red-800' },
  FAILED: { label: 'Failed', className: 'bg-red-900/30 text-red-400 border-red-800' },
  APPROVED: { label: 'Approved', className: 'bg-green-900/30 text-green-400 border-green-800' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-900/30 text-blue-400 border-blue-800' },
  COMPLETED: { label: 'Completed', className: 'bg-green-900/30 text-green-400 border-green-800' },
  IN_TRANSIT: { label: 'In Transit', className: 'bg-purple-900/30 text-purple-400 border-purple-800' },
  DISPATCHED: { label: 'Dispatched', className: 'bg-blue-900/30 text-blue-400 border-blue-800' },
  RETURNED: { label: 'Returned', className: 'bg-orange-900/30 text-orange-400 border-orange-800' },
  ON_LEAVE: { label: 'On Leave', className: 'bg-yellow-900/30 text-yellow-400 border-yellow-800' },
  TERMINATED: { label: 'Terminated', className: 'bg-red-900/30 text-red-400 border-red-800' },
  POSTED: { label: 'Posted', className: 'bg-green-900/30 text-green-400 border-green-800' },
  REVERSED: { label: 'Reversed', className: 'bg-orange-900/30 text-orange-400 border-orange-800' },
  RECEIVED: { label: 'Received', className: 'bg-green-900/30 text-green-400 border-green-800' },
  VIP: { label: 'VIP', className: 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/40' },
  BRONZE: { label: 'Bronze', className: 'bg-orange-900/30 text-orange-400 border-orange-800' },
  SILVER: { label: 'Silver', className: 'bg-gray-700/30 text-gray-300 border-gray-600' },
  GOLD: { label: 'Gold', className: 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/40' },
  PLATINUM: { label: 'Platinum', className: 'bg-purple-900/30 text-purple-300 border-purple-700' },
  DISCONTINUED: { label: 'Discontinued', className: 'bg-red-900/30 text-red-400 border-red-800' },
  OPEN: { label: 'Open', className: 'bg-blue-900/30 text-blue-400 border-blue-800' },
  CLOSED: { label: 'Closed', className: 'bg-gray-900/30 text-gray-400 border-gray-700' },
  PRESENT: { label: 'Present', className: 'bg-green-900/30 text-green-400 border-green-800' },
  ABSENT: { label: 'Absent', className: 'bg-red-900/30 text-red-400 border-red-800' },
  LATE: { label: 'Late', className: 'bg-yellow-900/30 text-yellow-400 border-yellow-800' },
  HALF_DAY: { label: 'Half Day', className: 'bg-orange-900/30 text-orange-400 border-orange-800' },
  LEAVE: { label: 'Leave', className: 'bg-purple-900/30 text-purple-400 border-purple-800' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-900/30 text-gray-400 border-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
