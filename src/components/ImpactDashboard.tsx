import type { SimulationResult } from "@/lib/simulationEngine";
import { nodes } from "@/data/supplyChainData";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

interface Props {
  result: SimulationResult | null;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4"
    >
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-mono font-bold mt-1 ${color || "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function ImpactDashboard({ result }: Props) {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-mono text-sm">Select a shock scenario to run simulation</p>
        </div>
      </div>
    );
  }

  const barData = result.nodeImpacts.slice(0, 8).map((ni) => ({
    name: ni.name.length > 12 ? ni.name.slice(0, 12) + "…" : ni.name,
    gdpLoss: ni.gdpLoss,
    type: ni.type,
  }));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="results"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="GDP Impact" value={`-$${result.totalGdpLoss}B`} sub={`${result.totalGdpPercent}% of national GDP`} color="text-shock" />
          <StatCard label="Workers Affected" value={`${result.totalEmployeesAffected}K`} color="text-warning" />
          <StatCard label="Nodes Impacted" value={`${result.nodeImpacts.length}`} sub={`of ${nodes.length} total`} color="text-node-industry" />
          <StatCard label="Recovery Time" value={`${result.timeToRecover} mo`} color="text-primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Propagation chart */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase mb-3">Cascade Propagation</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={result.propagationSteps}>
                <defs>
                  <linearGradient id="gdpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="step" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `Step ${v}`} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${v}B`} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220,15%,18%)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area type="monotone" dataKey="cumulativeGdpLoss" stroke="hsl(0, 72%, 55%)" fill="url(#gdpGrad)" strokeWidth={2} name="GDP Loss ($B)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Impact by sector */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase mb-3">Impact by Sector</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${v}B`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#94a3b8" }} width={90} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220,15%,18%)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="gdpLoss" name="GDP Loss ($B)" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.type === "industry" ? "#3b82f6" : entry.type === "manufacturer" ? "#22c55e" : "#f59e0b"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chokepoints */}
        {result.chokepoints.length > 0 && (
          <div className="bg-card border border-shock/30 rounded-lg p-4">
            <h3 className="text-xs font-mono text-shock uppercase mb-2">⚠ Critical Chokepoints Identified</h3>
            <div className="flex flex-wrap gap-2">
              {result.chokepoints.map((id) => {
                const node = nodes.find((n) => n.id === id);
                return (
                  <span key={id} className="px-3 py-1 rounded-full bg-shock/15 border border-shock/30 text-xs font-mono text-shock">
                    {node?.name || id}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
