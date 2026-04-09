import { useCallback, useEffect, useRef, useMemo } from "react";
import { nodes, edges, type SupplyNode } from "@/data/supplyChainData";
import type { NodeImpact } from "@/lib/simulationEngine";

interface Props {
  impactedNodes: NodeImpact[];
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
}

const NODE_COLORS: Record<SupplyNode["type"], string> = {
  industry: "#3b82f6",
  manufacturer: "#22c55e",
  logistics: "#f59e0b",
};

const typeRadius: Record<SupplyNode["type"], number> = {
  industry: 22,
  manufacturer: 16,
  logistics: 18,
};

export default function SupplyChainGraph({ impactedNodes, selectedNode, onNodeClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const hoverRef = useRef<string | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const positions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    // Arrange in a force-like layout (precomputed positions)
    const industries = nodes.filter(n => n.type === "industry");
    const manufacturers = nodes.filter(n => n.type === "manufacturer");
    const logistics = nodes.filter(n => n.type === "logistics");

    industries.forEach((n, i) => {
      const angle = (i / industries.length) * Math.PI * 2 - Math.PI / 2;
      pos.set(n.id, { x: 400 + Math.cos(angle) * 200, y: 300 + Math.sin(angle) * 180 });
    });
    manufacturers.forEach((n, i) => {
      const angle = (i / manufacturers.length) * Math.PI * 2 - Math.PI / 3;
      pos.set(n.id, { x: 400 + Math.cos(angle) * 120, y: 300 + Math.sin(angle) * 100 });
    });
    logistics.forEach((n, i) => {
      const angle = (i / logistics.length) * Math.PI * 2;
      pos.set(n.id, { x: 400 + Math.cos(angle) * 320, y: 300 + Math.sin(angle) * 250 });
    });
    return pos;
  }, []);

  const getNodeImpact = useCallback(
    (nodeId: string) => impactedNodes.find((n) => n.nodeId === nodeId),
    [impactedNodes]
  );

  const hitTest = useCallback(
    (mx: number, my: number) => {
      for (const node of nodes) {
        const p = positions.get(node.id);
        if (!p) continue;
        const r = typeRadius[node.type] + 4;
        if (Math.hypot(mx - p.x, my - p.y) < r) return node.id;
      }
      return null;
    },
    [positions]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;

    const draw = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw edges
      for (const edge of edges) {
        const from = positions.get(edge.source);
        const to = positions.get(edge.target);
        if (!from || !to) continue;

        const srcImpact = getNodeImpact(edge.source);
        const tgtImpact = getNodeImpact(edge.target);
        const isAffected = srcImpact || tgtImpact;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = isAffected
          ? `rgba(239, 68, 68, ${0.3 + Math.sin(t * 3) * 0.15})`
          : "rgba(100, 116, 139, 0.15)";
        ctx.lineWidth = isAffected ? 2 : 1;
        ctx.stroke();

        // Flow animation on affected edges
        if (isAffected) {
          const progress = (t * 0.5) % 1;
          const px = from.x + (to.x - from.x) * progress;
          const py = from.y + (to.y - from.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239, 68, 68, 0.7)";
          ctx.fill();
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const p = positions.get(node.id);
        if (!p) continue;
        const impact = getNodeImpact(node.id);
        const r = typeRadius[node.type];
        const isHovered = hoverRef.current === node.id;
        const isSelected = selectedNode === node.id;
        const baseColor = NODE_COLORS[node.type];

        // Glow for impacted nodes
        if (impact && impact.totalImpact > 0) {
          const glowR = r + 10 + Math.sin(t * 4) * 5;
          const gradient = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, glowR);
          gradient.addColorStop(0, `rgba(239, 68, 68, ${impact.totalImpact * 0.5})`);
          gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        if (impact && impact.totalImpact > 0) {
          const red = Math.min(255, Math.round(impact.totalImpact * 255));
          ctx.fillStyle = `rgb(${red}, ${Math.max(0, 100 - red)}, ${Math.max(0, 50 - red / 3)})`;
        } else {
          ctx.fillStyle = baseColor;
        }
        ctx.globalAlpha = isHovered || isSelected ? 1 : 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isSelected) {
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (isHovered) {
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.font = `${isHovered || isSelected ? "bold " : ""}11px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(node.name, p.x, p.y + r + 14);

        // Impact percentage
        if (impact && impact.totalImpact > 0) {
          ctx.font = "bold 10px JetBrains Mono, monospace";
          ctx.fillStyle = "#ef4444";
          ctx.fillText(`-${Math.round(impact.totalImpact * 100)}%`, p.x, p.y - r - 6);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [positions, getNodeImpact, selectedNode]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    mouseRef.current = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    hoverRef.current = hitTest(mouseRef.current.x, mouseRef.current.y);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hoverRef.current ? "pointer" : "default";
    }
  };

  const handleClick = () => {
    if (hoverRef.current) onNodeClick(hoverRef.current);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full rounded-lg"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ background: "hsl(220 20% 7%)" }}
    />
  );
}
