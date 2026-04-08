import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import type { DeckCard } from '../../utils/formatRules';
import { getManaCurveData } from '../../utils/cardGrouping';

interface ManaCurveChartProps {
  mainboard: Record<string, DeckCard>;
}

export function ManaCurveChart({ mainboard }: ManaCurveChartProps) {
  const data = getManaCurveData(mainboard);
  const maxCount = Math.max(...data.map(d => d.count), 1);

  if (Object.keys(mainboard).length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-zinc-600 text-xs">
        No cards yet
      </div>
    );
  }

  const formatter = (value: ValueType, _name: NameType): [ValueType, string] => [value, 'Cards'];

  return (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={18}>
          <XAxis
            dataKey="cmc"
            tick={{ fontSize: 10, fill: '#71717a' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#71717a' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f4f4f5',
            }}
            formatter={formatter}
            labelFormatter={(label) => `CMC ${label}`}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count === maxCount ? '#f59e0b' : '#92400e'}
                opacity={entry.count === 0 ? 0.2 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
