'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function StagesPage() {
  return (
    <div>
      <PageHeader title="Production Stages" subtitle="View stages for individual work orders from the Work Orders page" />
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-8 text-center">
        <p className="text-gray-400">Navigate to a work order to manage its stages.</p>
      </div>
    </div>
  );
}
