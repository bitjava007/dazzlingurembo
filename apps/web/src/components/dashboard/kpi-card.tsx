import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
}

export function KpiCard({ title, value, icon: Icon, trend, trendValue, subtitle }: KpiCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6 hover:border-[#C9A84C]/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="p-2 rounded-md bg-[#C9A84C]/10">
          <Icon className="h-5 w-5 text-[#C9A84C]" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-[#C9A84C]">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {trend && trendValue && (
          <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
            <TrendIcon className="h-3 w-3" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
