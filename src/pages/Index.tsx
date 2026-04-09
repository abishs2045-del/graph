import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { scenarios, nodes } from "@/data/supplyChainData";
import { runSimulation, type SimulationResult } from "@/lib/simulationEngine";
import SupplyChainGraph from "@/components/SupplyChainGraph";
import SimulationPanel from "@/components/SimulationPanel";
import ImpactDashboard from "@/components/ImpactDashboard";

export default function Index() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRunScenario = useCallback((scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    setActiveScenario(scenarioId);
    setSelectedNode(scenario.targetNode);
    const sim = runSimulation(scenario.targetNode, scenario.severity);
    setResult(sim);
  }, []);

  const handleReset = useCallback(() => {
    setActiveScenario(null);
    setSelectedNode(null);
    setResult(null);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    const sim = runSimulation(nodeId, 0.7);
    setResult(sim);
    setActiveScenario(null);
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-mono font-bold text-sm">SC</span>
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-foreground tracking-wide">
                SUPPLY CHAIN RESILIENCE ENGINE
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground">
                National Dependency Graph · Shock Propagation Simulator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-node-industry" /> Industries
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-node-manufacturer" /> Manufacturers
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-node-logistics" /> Logistics
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground/60">
              {nodes.length} nodes · live
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Sidebar */}
        <aside className="space-y-4 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
          <SimulationPanel
            activeScenario={activeScenario}
            onRunScenario={handleRunScenario}
            onReset={handleReset}
          />
          
          {/* Node details */}
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <h3 className="text-xs font-mono text-muted-foreground uppercase mb-2">Selected Node</h3>
              {(() => {
                const node = nodes.find((n) => n.id === selectedNode);
                if (!node) return null;
                return (
                  <div className="space-y-2">
                    <p className="font-mono font-semibold text-foreground">{node.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Type</span>
                        <p className="text-foreground capitalize">{node.type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Region</span>
                        <p className="text-foreground">{node.region}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">GDP Contribution</span>
                        <p className="text-foreground">${node.gdpContribution}B</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Criticality</span>
                        <p className="text-foreground">{Math.round(node.criticality * 100)}%</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </aside>

        {/* Main content */}
        <main className="space-y-4">
          {/* Graph */}
          <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ height: "480px" }}>
            <SupplyChainGraph
              impactedNodes={result?.nodeImpacts || []}
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
            />
          </div>

          {/* Dashboard */}
          <ImpactDashboard result={result} />
        </main>
      </div>
    </div>
  );
}
