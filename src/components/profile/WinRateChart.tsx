import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-zinc-100 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
          Win Rate Over Time
        </h2>
        <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
          Not enough match data to display chart.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-zinc-100 mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
        Win Rate Over Time
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#3f3f46' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#3f3f46' }}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#d4d4d8',
            }}
            formatter={(value: any) => [`${value}%`, 'Win Rate']}
          />
          <Line
            type="monotone"
            dataKey="winRate"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
            activeDot={{ r: 5, fill: '#fbbf24' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
