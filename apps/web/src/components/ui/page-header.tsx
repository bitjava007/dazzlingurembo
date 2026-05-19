import { Button } from './button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function PageHeader({ title, subtitle, onAction, actionLabel = 'Create New' }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
