const ACCENT = '#f59e0b';

interface Props {
  n: number;
}

export default function CostMatrix({ n }: Props) {
  const SHOW = Math.min(n, 8);
  // Generate a stable preview matrix based on N
  const preview = Array.from({ length: SHOW }, (_, r) =>
    Array.from({ length: SHOW }, (_, c) => ((r * 37 + c * 13 + r + c) % 181) + 20)
  );

  return (
    <div>
      <div style={{ fontSize: '12px', color: '#5a6480', marginBottom: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
        COST MATRIX PREVIEW — {n}×{n} (showing {SHOW}×{SHOW})
      </div>
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #1e2236' }}>
        <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', background: '#141720', color: '#5a6480', borderBottom: '1px solid #1e2236', borderRight: '1px solid #1e2236', fontWeight: 400 }}>E\T</th>
              {Array.from({ length: SHOW }, (_, i) => (
                <th key={i} style={{ padding: '6px 10px', background: '#141720', color: ACCENT, borderBottom: '1px solid #1e2236', borderRight: '1px solid #1e2236', fontWeight: 600, minWidth: '46px' }}>
                  T{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, r) => (
              <tr key={r}>
                <td style={{ padding: '6px 10px', background: '#141720', color: ACCENT, borderBottom: '1px solid #1e2236', borderRight: '1px solid #1e2236', fontWeight: 600 }}>
                  E{r + 1}
                </td>
                {row.map((val, c) => (
                  <td key={c} style={{ padding: '6px 10px', color: val < 60 ? '#10b981' : val > 150 ? '#f87171' : '#c8d0e8', borderBottom: '1px solid #1e2236', borderRight: '1px solid #1e2236', textAlign: 'right' }}>
                    ${val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {n > SHOW && (
        <div style={{ fontSize: '10px', color: '#5a6480', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
          ... and {n - SHOW} more rows / {n - SHOW} more columns. Full {n}×{n} matrix computed on server.
        </div>
      )}
    </div>
  );
}
