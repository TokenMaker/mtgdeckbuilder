import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface MatchDataPoint {
  date: string;
  winRate: number;
  matchesPlayed: number;
}

interface WinRateChartProps {
  data: MatchDataPoint[];
}

export function WinRateChart({ data }: WinRateChartProps) {
  if (data.length < 2) {
    return (
      <div className="bg-[#1e1f27] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
          Win Rate Trend
        </h3>
        <div className="flex items-center justify-center h-28 text-zinc-600 text-sm">
          Not enough data to display trend.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e1f27] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
          Win Rate Trend
        </h3>
        <span className="text-xs text-zinc-500">By week</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
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
          <ReferenceLine y={50} stroke="#3f3f46" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{
              background: '#292931',
              border: 'none',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#d4d4d8',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            }}
            formatter={(value: any) => [`${value}%`, 'Win Rate']}
          />
          <Line
            type="monotone"
            dataKey="winRate"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={{ fill: '#fbbf24', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#fde68a', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
