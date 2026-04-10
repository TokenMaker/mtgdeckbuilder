import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DataPoint {
  date: string;
  winRate: number;
  matchesPlayed: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
}

const WEEK_LABELS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.slice(-8).map((d, i) => ({
    ...d,
    label: WEEK_LABELS[i] ?? d.date,
  }));

  if (data.length < 2) {
    return (
      <div className="bg-[#1e1f27] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
            Performance Matrix
          </h3>
        </div>
        <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
          Log matches to see your performance trend.
        </div>
      </div>
    );
  }

  const maxRate = Math.max(...chartData.map(d => d.winRate));

  return (
    <div className="bg-[#1e1f27] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
          Performance Matrix
        </h3>
        <span className="text-xs text-zinc-500">Weekly win rate</span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 16, right: 0, left: -20, bottom: 0 }} barCategoryGap="30%">
          <XAxis
            dataKey="label"
            tick={{ fill: '#52525b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#52525b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              background: '#292931',
              border: 'none',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#d4d4d8',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            }}
            formatter={(value: any) => [`${value}%`, 'Win Rate']}
            labelStyle={{ color: '#a1a1aa', marginBottom: 4 }}
          />
          <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.winRate === maxRate ? '#fbbf24' : '#3f3f46'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
