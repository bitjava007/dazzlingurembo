'use client';

interface DataPoint {
  label: string;
  value: number;
}

interface StatsChartProps {
  data: DataPoint[];
  title?: string;
  type?: 'bar' | 'line';
  color?: string;
  formatValue?: (v: number) => string;
}

function BarChart({ data, max, color, formatValue }: { data: DataPoint[]; max: number; color: string; formatValue: (v: number) => string }) {
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((point, index) => {
        const height = Math.max((point.value / max) * 100, 2);
        return (
          <div key={index} className="flex flex-col items-center gap-1 flex-1 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
              <div
                className="w-full rounded-t-sm transition-all duration-200 cursor-default"
                style={{ height: `${height}%`, background: color, opacity: 0.7 }}
                title={`${point.label}: ${formatValue(point.value)}`}
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-[#2A2A2A] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {formatValue(point.value)}
              </div>
            </div>
            <span className="text-[9px] text-gray-500 truncate w-full text-center">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data, max, color, formatValue }: { data: DataPoint[]; max: number; color: string; formatValue: (v: number) => string }) {
  const w = 100;
  const h = 80;
  const pad = 4;

  if (data.length < 2) return <BarChart data={data} max={max} color={color} formatValue={formatValue} />;

  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - d.value / max) * (h - pad * 2);
    return { x, y, ...d };
  });

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M${pts[0].x},${h} ` + pts.map((p) => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length - 1].x},${h} Z`;

  return (
    <div className="relative h-32">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#area-grad)" />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} className="cursor-default">
            <title>{`${p.label}: ${formatValue(p.value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-gray-500 flex-1 text-center truncate">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function StatsChart({ data, title, type = 'bar', color = '#C9A84C', formatValue }: StatsChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatValue ?? ((v: number) => v.toLocaleString());

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
      {title && <h3 className="text-sm font-semibold text-gray-400 mb-4">{title}</h3>}
      {type === 'line'
        ? <LineChart data={data} max={max} color={color} formatValue={fmt} />
        : <BarChart data={data} max={max} color={color} formatValue={fmt} />
      }
    </div>
  );
}
