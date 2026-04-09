export interface SupplyNode {
  id: string;
  name: string;
  type: "industry" | "manufacturer" | "logistics";
  gdpContribution: number; // billions USD
  employees: number; // thousands
  criticality: number; // 0-1
  region: string;
  x?: number;
  y?: number;
}

export interface SupplyEdge {
  source: string;
  target: string;
  weight: number; // dependency strength 0-1
  flowVolume: number; // billions USD annually
}

export interface ShockScenario {
  id: string;
  name: string;
  description: string;
  targetNode: string;
  severity: number; // 0-1
  icon: string;
}

export const nodes: SupplyNode[] = [
  // Industries
  { id: "auto", name: "Automotive", type: "industry", gdpContribution: 280, employees: 1700, criticality: 0.85, region: "Midwest" },
  { id: "semi", name: "Semiconductors", type: "industry", gdpContribution: 210, employees: 280, criticality: 0.95, region: "Southwest" },
  { id: "pharma", name: "Pharmaceuticals", type: "industry", gdpContribution: 350, employees: 820, criticality: 0.90, region: "Northeast" },
  { id: "energy", name: "Energy & Oil", type: "industry", gdpContribution: 520, employees: 1200, criticality: 0.92, region: "Gulf Coast" },
  { id: "agri", name: "Agriculture", type: "industry", gdpContribution: 180, employees: 2600, criticality: 0.88, region: "Great Plains" },
  { id: "aero", name: "Aerospace & Defense", type: "industry", gdpContribution: 400, employees: 890, criticality: 0.87, region: "West Coast" },
  { id: "tech", name: "Consumer Tech", type: "industry", gdpContribution: 620, employees: 1500, criticality: 0.80, region: "West Coast" },
  { id: "steel", name: "Steel & Metals", type: "industry", gdpContribution: 110, employees: 380, criticality: 0.82, region: "Midwest" },
  { id: "chem", name: "Chemicals", type: "industry", gdpContribution: 230, employees: 530, criticality: 0.86, region: "Gulf Coast" },
  
  // Manufacturers
  { id: "mfg-detroit", name: "Detroit Assembly", type: "manufacturer", gdpContribution: 45, employees: 120, criticality: 0.78, region: "Michigan" },
  { id: "mfg-texas", name: "Texas Fab Plants", type: "manufacturer", gdpContribution: 85, employees: 65, criticality: 0.92, region: "Texas" },
  { id: "mfg-nj", name: "NJ Pharma Labs", type: "manufacturer", gdpContribution: 55, employees: 42, criticality: 0.83, region: "New Jersey" },
  { id: "mfg-seattle", name: "Seattle Aerospace", type: "manufacturer", gdpContribution: 72, employees: 95, criticality: 0.88, region: "Washington" },
  { id: "mfg-ohio", name: "Ohio Steel Works", type: "manufacturer", gdpContribution: 28, employees: 35, criticality: 0.72, region: "Ohio" },
  
  // Logistics Hubs
  { id: "port-la", name: "Port of LA/LB", type: "logistics", gdpContribution: 12, employees: 45, criticality: 0.96, region: "California" },
  { id: "port-houston", name: "Port of Houston", type: "logistics", gdpContribution: 8, employees: 32, criticality: 0.91, region: "Texas" },
  { id: "port-ny", name: "Port of NY/NJ", type: "logistics", gdpContribution: 10, employees: 38, criticality: 0.89, region: "New York" },
  { id: "hub-chicago", name: "Chicago Rail Hub", type: "logistics", gdpContribution: 6, employees: 28, criticality: 0.87, region: "Illinois" },
  { id: "hub-memphis", name: "Memphis Air Hub", type: "logistics", gdpContribution: 5, employees: 22, criticality: 0.84, region: "Tennessee" },
  { id: "hub-atlanta", name: "Atlanta Intermodal", type: "logistics", gdpContribution: 4, employees: 18, criticality: 0.79, region: "Georgia" },
];

export const edges: SupplyEdge[] = [
  // Semiconductor dependencies (critical)
  { source: "semi", target: "auto", weight: 0.9, flowVolume: 52 },
  { source: "semi", target: "tech", weight: 0.95, flowVolume: 120 },
  { source: "semi", target: "aero", weight: 0.7, flowVolume: 35 },
  { source: "semi", target: "pharma", weight: 0.4, flowVolume: 15 },
  
  // Energy dependencies
  { source: "energy", target: "chem", weight: 0.85, flowVolume: 65 },
  { source: "energy", target: "steel", weight: 0.8, flowVolume: 42 },
  { source: "energy", target: "auto", weight: 0.6, flowVolume: 38 },
  { source: "energy", target: "agri", weight: 0.55, flowVolume: 28 },
  
  // Steel/Metals flows
  { source: "steel", target: "auto", weight: 0.75, flowVolume: 48 },
  { source: "steel", target: "aero", weight: 0.65, flowVolume: 32 },
  { source: "steel", target: "mfg-detroit", weight: 0.7, flowVolume: 22 },
  { source: "steel", target: "mfg-ohio", weight: 0.85, flowVolume: 18 },
  
  // Chemicals
  { source: "chem", target: "pharma", weight: 0.8, flowVolume: 45 },
  { source: "chem", target: "agri", weight: 0.6, flowVolume: 25 },
  { source: "chem", target: "auto", weight: 0.45, flowVolume: 18 },
  
  // Manufacturer connections
  { source: "auto", target: "mfg-detroit", weight: 0.9, flowVolume: 85 },
  { source: "semi", target: "mfg-texas", weight: 0.95, flowVolume: 72 },
  { source: "pharma", target: "mfg-nj", weight: 0.85, flowVolume: 55 },
  { source: "aero", target: "mfg-seattle", weight: 0.9, flowVolume: 65 },
  { source: "steel", target: "mfg-ohio", weight: 0.8, flowVolume: 20 },
  
  // Logistics connections
  { source: "port-la", target: "semi", weight: 0.85, flowVolume: 95 },
  { source: "port-la", target: "tech", weight: 0.8, flowVolume: 110 },
  { source: "port-houston", target: "energy", weight: 0.9, flowVolume: 85 },
  { source: "port-houston", target: "chem", weight: 0.75, flowVolume: 45 },
  { source: "port-ny", target: "pharma", weight: 0.7, flowVolume: 40 },
  { source: "port-ny", target: "tech", weight: 0.5, flowVolume: 55 },
  { source: "hub-chicago", target: "auto", weight: 0.65, flowVolume: 60 },
  { source: "hub-chicago", target: "steel", weight: 0.7, flowVolume: 35 },
  { source: "hub-chicago", target: "agri", weight: 0.75, flowVolume: 42 },
  { source: "hub-memphis", target: "pharma", weight: 0.55, flowVolume: 28 },
  { source: "hub-memphis", target: "tech", weight: 0.6, flowVolume: 38 },
  { source: "hub-atlanta", target: "auto", weight: 0.45, flowVolume: 22 },
  { source: "hub-atlanta", target: "mfg-detroit", weight: 0.4, flowVolume: 15 },
  
  // Cross-logistics
  { source: "port-la", target: "hub-chicago", weight: 0.7, flowVolume: 75 },
  { source: "port-houston", target: "hub-memphis", weight: 0.55, flowVolume: 32 },
  { source: "port-ny", target: "hub-atlanta", weight: 0.5, flowVolume: 28 },
];

export const scenarios: ShockScenario[] = [
  { id: "port-la-close", name: "Port of LA Closure", description: "Major earthquake damages LA/Long Beach port infrastructure. 40% of Pacific trade halted for 3 months.", targetNode: "port-la", severity: 0.85, icon: "🚢" },
  { id: "texas-fab-fire", name: "Texas Fab Fire", description: "Fire at major semiconductor fabrication plant. Production drops 60% for 6 months.", targetNode: "mfg-texas", severity: 0.75, icon: "🔥" },
  { id: "energy-disruption", name: "Gulf Energy Crisis", description: "Hurricane disrupts Gulf Coast energy infrastructure. Refining capacity drops 50%.", targetNode: "energy", severity: 0.80, icon: "⚡" },
  { id: "steel-shortage", name: "Steel Supply Shock", description: "Trade sanctions cut steel imports by 70%. Domestic production can't compensate.", targetNode: "steel", severity: 0.65, icon: "🏗️" },
  { id: "chicago-rail", name: "Chicago Rail Collapse", description: "Critical rail junction failure. Midwest logistics capacity drops 80%.", targetNode: "hub-chicago", severity: 0.70, icon: "🚂" },
  { id: "pharma-crisis", name: "Pharma Supply Break", description: "Key API ingredient supply from overseas halted. Drug production falls 45%.", targetNode: "pharma", severity: 0.72, icon: "💊" },
];
