import type { TrafficEdge } from './traffic.types';

const ACCENT = '#38bdf8';

// Fixed node positions in a layered layout (normalized 0-1)
const NODE_POS: Record<string, [number, number]> = {
  A: [0.05, 0.5],
  B: [0.28, 0.2],
  C: [0.28, 0.5],
  D: [0.28, 0.8],
  E: [0.55, 0.3],
  F: [0.55, 0.7],
  G: [0.78, 0.2],
  H: [0.78, 0.65],
  T: [0.95, 0.42],
};

interface Props { edges: TrafficEdge[]; }

export default function TrafficGraph({ edges }: Props) {
  const W = 560, H = 300, R = 20;

  function pos(node: string): [number, number] {
    const [nx, ny] = NODE_POS[node];
    return [nx * W, ny * H];
  }

  function arrowHead(x1: number, y1: number, x2: number, y2: number): string {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 10;
    const spread = 0.4;
    const tx = x2 - Math.cos(angle) * (R + 2);
    const ty = y2 - Math.sin(angle) * (R + 2);
    return `M${tx},${ty} L${tx - len * Math.cos(angle - spread)},${ty - len * Math.sin(angle - spread)} L${tx - len * Math.cos(angle + spread)},${ty - len * Math.sin(angle + spread)} Z`;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* Edges */}
        {edges.map((e) => {
          const [x1, y1] = pos(e.from);
          const [x2, y2] = pos(e.to);
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const capRatio = (e.capacity - 5) / 10;
          const color = capRatio > 0.6 ? '#10b981' : capRatio > 0.3 ? ACCENT : '#f59e0b';
          const strokeW = 1 + capRatio * 2;
          return (
            <g key={`${e.from}-${e.to}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={strokeW} opacity="0.5" />
              <path d={arrowHead(x1, y1, x2, y2)} fill={color} opacity="0.8" />
              <rect x={mx - 12} y={my - 9} width="24" height="18" rx="4" fill="#0e1018" stroke={color} strokeWidth="0.5" opacity="0.9" />
              <text x={mx} y={my + 4} textAnchor="middle" fill={color} fontSize="10" fontFamily="var(--font-mono)" fontWeight="600">{e.capacity}</text>
            </g>
          );
        })}
        {/* Nodes */}
        {Object.entries(NODE_POS).map(([node]) => {
          const [x, y] = pos(node);
          const isSource = node === 'A';
          const isSink = node === 'T';
          const fill = isSource ? '#10b981' : isSink ? '#fb7185' : ACCENT;
          return (
            <g key={node}>
              <circle cx={x} cy={y} r={R} fill={fill + '25'} stroke={fill} strokeWidth="1.5" />
              <text x={x} y={y + 5} textAnchor="middle" fill={fill} fontSize="13" fontFamily="var(--font-display)" fontWeight="700">{node}</text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
        {[{ color: '#10b981', label: 'Source (A)' }, { color: '#fb7185', label: 'Sink (T)' }, { color: ACCENT, label: 'Intermediate' }].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: l.color + '30', border: `1.5px solid ${l.color}` }} />
            <span style={{ fontSize: '11px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>{l.label}</span>
          </div>
        ))}
        <div style={{ fontSize: '11px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>Edge labels = capacity (vehicles/min)</div>
      </div>
    </div>
  );
}
