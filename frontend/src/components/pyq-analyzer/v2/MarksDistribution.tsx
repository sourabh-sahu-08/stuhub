import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

interface MarksDistributionProps {
  marksDistribution: Array<{ unit: string; marks: number; percentage: number }>;
}

const COLORS = ["#FF9000", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111118] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="text-white font-bold">{payload[0].name}</p>
        <p className="text-zinc-400">{payload[0].value} marks ({payload[0].payload.percentage}%)</p>
      </div>
    );
  }
  return null;
};

export function MarksDistribution({ marksDistribution }: MarksDistributionProps) {
  const data = marksDistribution?.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
    name: d.unit.length > 18 ? d.unit.slice(0, 18) + "…" : d.unit,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Marks Distribution</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-[#0d0d12] border border-white/8 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-zinc-300 mb-4">By Unit (Pie)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="marks"
              >
                {data?.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {data?.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#0d0d12] border border-white/8 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-zinc-300 mb-4">By Unit (Bar)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#52525b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#52525b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="marks" radius={[6, 6, 0, 0]}>
                {data?.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
