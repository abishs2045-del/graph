import { nodes, edges, type SupplyNode, type SupplyEdge } from "@/data/supplyChainData";

export interface NodeImpact {
  nodeId: string;
  name: string;
  type: SupplyNode["type"];
  directImpact: number;
  cascadeImpact: number;
  totalImpact: number;
  gdpLoss: number;
  employeesAffected: number;
  propagationDepth: number;
}

export interface SimulationResult {
  totalGdpLoss: number;
  totalGdpPercent: number;
  totalEmployeesAffected: number;
  chokepoints: string[];
  nodeImpacts: NodeImpact[];
  propagationSteps: { step: number; nodesAffected: number; cumulativeGdpLoss: number }[];
  timeToRecover: number; // months
}

const NATIONAL_GDP = 25_500; // billions USD

export function runSimulation(targetNodeId: string, severity: number): SimulationResult {
  const impactMap = new Map<string, { direct: number; cascade: number; depth: number }>();
  
  // Initialize target node
  impactMap.set(targetNodeId, { direct: severity, cascade: 0, depth: 0 });
  
  const propagationSteps: SimulationResult["propagationSteps"] = [];
  const visited = new Set<string>([targetNodeId]);
  let frontier = [targetNodeId];
  let step = 0;
  
  // BFS propagation with decay
  while (frontier.length > 0 && step < 6) {
    const nextFrontier: string[] = [];
    step++;
    
    for (const nodeId of frontier) {
      const currentImpact = impactMap.get(nodeId)!;
      const sourceStrength = currentImpact.direct + currentImpact.cascade;
      
      // Find downstream edges
      const downstream = edges.filter(e => e.source === nodeId || e.target === nodeId);
      
      for (const edge of downstream) {
        const neighborId = edge.source === nodeId ? edge.target : edge.source;
        if (visited.has(neighborId)) continue;
        
        const cascadeStrength = sourceStrength * edge.weight * 0.6; // 60% propagation factor
        if (cascadeStrength < 0.05) continue; // threshold
        
        const existing = impactMap.get(neighborId);
        if (existing) {
          existing.cascade = Math.max(existing.cascade, cascadeStrength);
        } else {
          impactMap.set(neighborId, { direct: 0, cascade: cascadeStrength, depth: step });
          visited.add(neighborId);
          nextFrontier.push(neighborId);
        }
      }
    }
    
    let cumulativeLoss = 0;
    impactMap.forEach((impact, id) => {
      const node = nodes.find(n => n.id === id);
      if (node) cumulativeLoss += node.gdpContribution * (impact.direct + impact.cascade);
    });
    
    propagationSteps.push({
      step,
      nodesAffected: visited.size,
      cumulativeGdpLoss: Math.round(cumulativeLoss * 10) / 10,
    });
    
    frontier = nextFrontier;
  }
  
  // Calculate impacts
  const nodeImpacts: NodeImpact[] = [];
  let totalGdpLoss = 0;
  let totalEmployees = 0;
  
  impactMap.forEach((impact, id) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    
    const totalImpact = Math.min(impact.direct + impact.cascade, 1);
    const gdpLoss = node.gdpContribution * totalImpact;
    const employeesAffected = Math.round(node.employees * totalImpact);
    
    totalGdpLoss += gdpLoss;
    totalEmployees += employeesAffected;
    
    nodeImpacts.push({
      nodeId: id,
      name: node.name,
      type: node.type,
      directImpact: impact.direct,
      cascadeImpact: impact.cascade,
      totalImpact,
      gdpLoss: Math.round(gdpLoss * 10) / 10,
      employeesAffected,
      propagationDepth: impact.depth,
    });
  });
  
  nodeImpacts.sort((a, b) => b.gdpLoss - a.gdpLoss);
  
  // Identify chokepoints: nodes with high criticality that are affected
  const chokepoints = nodeImpacts
    .filter(ni => {
      const node = nodes.find(n => n.id === ni.nodeId);
      return node && node.criticality > 0.85 && ni.totalImpact > 0.3;
    })
    .map(ni => ni.nodeId);
  
  const timeToRecover = Math.round(severity * 18 + nodeImpacts.length * 0.5);
  
  return {
    totalGdpLoss: Math.round(totalGdpLoss * 10) / 10,
    totalGdpPercent: Math.round((totalGdpLoss / NATIONAL_GDP) * 10000) / 100,
    totalEmployeesAffected: totalEmployees,
    chokepoints,
    nodeImpacts,
    propagationSteps,
    timeToRecover,
  };
}
