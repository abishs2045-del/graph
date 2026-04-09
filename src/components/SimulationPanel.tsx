import { scenarios } from "@/data/supplyChainData";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
  activeScenario: string | null;
  onRunScenario: (scenarioId: string) => void;
  onReset: () => void;
}

export default function SimulationPanel({ activeScenario, onRunScenario, onReset }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-semibold text-foreground tracking-wider uppercase">
          Shock Scenarios
        </h2>
        {activeScenario && (
          <Button variant="outline" size="sm" onClick={onReset} className="text-xs font-mono h-7">
            Reset
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {scenarios.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRunScenario(s.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              activeScenario === s.id
                ? "border-shock bg-shock/10 glow-shock"
                : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{s.icon}</span>
              <span className="text-sm font-medium text-foreground">{s.name}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">Severity:</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-warning to-shock"
                  style={{ width: `${s.severity * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-shock">{Math.round(s.severity * 100)}%</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
