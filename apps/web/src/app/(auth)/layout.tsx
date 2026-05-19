import { BarChart3 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-[#C9A84C]" />
          <span className="text-2xl font-bold text-[#C9A84C] tracking-widest">DAZZLING UM</span>
        </div>
        <p className="text-gray-500 text-sm">Premium ERP Management System</p>
      </div>
      {children}
    </div>
  );
}
