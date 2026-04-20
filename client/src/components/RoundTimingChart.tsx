import { useMemo } from 'react';

export interface ChartBar   { name: string; value: number }
export interface ChartRound { label: string; bars: ChartBar[] }

interface Props {
  title:  string;
  rounds: ChartRound[];
  colors: string[];   // one color per algorithm, index-matched to bars
  accent: string;     // game accent color (title + axis lines)
}

// SVG canvas constants
const W = 800, H = 240;
const ML = 58, MR = 20, MT = 16, MB = 56;
const PW = W - ML - MR;
const PH = H - MT - MB;

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const f = 10 ** exp;
  const m = v / f;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * f;
}

function fmtTick(v: number): string {
  if (v === 0) return '0';
  if (v >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 's';
  if (v < 0.01)  return v.toFixed(4);
  if (v < 1)     return v.toFixed(3);
  if (v < 10)    return v.toFixed(2);
  if (v < 100)   return v.toFixed(1);
  return Math.round(v).toString();
}

export default function RoundTimingChart({ title, rounds, colors, accent }: Props) {
  const ticks = useMemo(() => {
    const rawMax = Math.max(0.001, ...rounds.flatMap(r => r.bars.map(b => b.value)));
    const max = niceMax(rawMax * 1.2);
    return Array.from({ length: 5 }, (_, i) => (i * max) / 4);
  }, [rounds]);

  const maxVal = ticks[ticks.length - 1];

  const unit = maxVal >= 1000 ? 's' : 'ms';

  // ── Empty state ────────────────────────────────────────────────────────────
  if (rounds.length === 0) {
    return (
      <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
        <div className="font-display" style={{ fontSize: '11px', letterSpacing: '0.2em', color: accent, marginBottom: '14px', textTransform: 'uppercase' }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: '#3a4060', fontSize: '12px', fontFamily: 'var(--font-mono)', borderRadius: '8px', border: '1px dashed #1e2236' }}>
          Play a round to start tracking…
        </div>
      </div>
    );
  }

  const n       = rounds.length;
  const nAlgos  = rounds[0].bars.length;
  const slotW   = PW / n;
  const barW    = Math.min(22, Math.max(3, (slotW - 8) / nAlgos - 2));
  const groupW  = nAlgos * barW + (nAlgos - 1) * 3;

  const bx = (ri: number, bi: number) => {
    const slotStart  = ML + ri * slotW;
    const groupStart = slotStart + (slotW - groupW) / 2;
    return groupStart + bi * (barW + 3);
  };

  const yToSvg   = (v: number) => MT + PH - (v / maxVal) * PH;
  const barHeight = (v: number) => Math.max(2, (v / maxVal) * PH);
  const barTop    = (v: number) => yToSvg(v);

  // ── Legend items ───────────────────────────────────────────────────────────
  const legendItems = rounds[0].bars.map((b, i) => ({ name: b.name, color: colors[i % colors.length] }));
  const legendTotalW = legendItems.reduce((acc, item) => acc + item.name.length * 6.5 + 24, 0);
  let legendX = W / 2 - legendTotalW / 2;

  return (
    <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
      <div className="font-display" style={{ fontSize: '11px', letterSpacing: '0.2em', color: accent, marginBottom: '14px', textTransform: 'uppercase' }}>
        {title}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        aria-label={title}
      >
        {/* Horizontal grid lines + y-axis tick labels */}
        {ticks.map((tick) => {
          const y = yToSvg(tick);
          return (
            <g key={tick}>
              <line x1={ML} y1={y} x2={ML + PW} y2={y} stroke="#1a1f30" strokeWidth="1" />
              <text x={ML - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#4a5070" fontFamily="monospace">
                {fmtTick(tick)}
              </text>
            </g>
          );
        })}

        {/* Y axis */}
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#2a2f45" strokeWidth="1" />

        {/* Y axis unit label */}
        <text
          x={10}
          y={MT + PH / 2}
          transform={`rotate(-90, 10, ${MT + PH / 2})`}
          textAnchor="middle"
          fontSize="9"
          fill="#4a5070"
          fontFamily="monospace"
        >
          Time ({unit})
        </text>

        {/* Bars + x-axis labels */}
        {rounds.map((round, ri) => (
          <g key={ri}>
            {round.bars.map((bar, bi) => {
              const displayVal = unit === 's' ? bar.value / 1000 : bar.value;
              return (
                <rect
                  key={bi}
                  x={bx(ri, bi)}
                  y={barTop(bar.value)}
                  width={barW}
                  height={barHeight(bar.value)}
                  fill={colors[bi % colors.length]}
                  rx="2"
                  ry="2"
                  opacity="0.9"
                >
                  <title>{`${bar.name}: ${displayVal.toFixed(3)} ${unit}`}</title>
                </rect>
              );
            })}
            <text
              x={ML + ri * slotW + slotW / 2}
              y={MT + PH + 14}
              textAnchor="middle"
              fontSize="9"
              fill="#4a5070"
              fontFamily="monospace"
            >
              {round.label}
            </text>
          </g>
        ))}

        {/* X axis */}
        <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH} stroke="#2a2f45" strokeWidth="1" />

        {/* X axis label */}
        <text
          x={ML + PW / 2}
          y={MT + PH + 30}
          textAnchor="middle"
          fontSize="10"
          fill="#4a5070"
          fontFamily="monospace"
        >
          Round
        </text>

        {/* Legend */}
        {legendItems.map((item, i) => {
          const lx = legendX;
          legendX += item.name.length * 6.5 + 24;
          return (
            <g key={i}>
              <rect x={lx} y={H - 14} width={10} height={10} fill={item.color} rx="2" />
              <text x={lx + 14} y={H - 5} fontSize="10" fill="#a0a8c0" fontFamily="monospace">
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
