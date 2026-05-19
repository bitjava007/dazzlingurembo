'use client';

interface DataPoint {
  label: string;
  value: number;
}

interface StatsChartProps {
  data: DataPoint[];
  title?: string;
}

export function StatsChart({ data, title }: StatsChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
      {title && <h3 className="text-sm font-semibold text-gray-400 mb-4">{title}</h3>}
      <div className="flex items-end gap-2 h-32">
        {data.map((point, index) => {
          const height = Math.max((point.value / max) * 100, 4);
          return (
            <div key={index} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full rounded-sm bg-[#C9A84C]/60 hover:bg-[#C9A84C] transition-colors"
                style={{ height: `${height}%` }}
                title={`${point.label}: ${point.value}`}
              />
              <span className="text-[10px] text-gray-500">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
