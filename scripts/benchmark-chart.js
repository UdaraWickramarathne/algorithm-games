/**
 * Algorithm Timing Benchmark — Chart Generator
 *
 * Runs 20 rounds for each game, collects execution timings for both
 * algorithm techniques, and produces a self-contained HTML report with
 * Chart.js charts.
 *
 * Prerequisites:
 *   Backend running on http://localhost:3001
 *
 * Run:
 *   node scripts/benchmark-chart.js
 *
 * Options (environment variables):
 *   API_URL=http://localhost:3001   override server URL
 *   ROUNDS=20                       rounds per game (default 20)
 *   QUEENS_RUNS=3                   how many times to run the Queens solver
 *   NO_QUEENS=1                     skip Queens (it takes several minutes per run)
 *
 * Output:
 *   scripts/benchmark-report.html  — open in any browser
 */

const { writeFileSync } = require('fs');
const path = require('path');

const API          = process.env.API_URL    || 'http://localhost:3001';
const ROUNDS       = parseInt(process.env.ROUNDS      || '20', 10);
const QUEENS_RUNS  = parseInt(process.env.QUEENS_RUNS || '3',  10);
const SKIP_QUEENS  = !!process.env.NO_QUEENS;

// ── HTTP helpers ───────────────────────────────────────────────────────────

async function post(endpoint, body = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${endpoint} → HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function get(endpoint) {
  const res = await fetch(`${API}${endpoint}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${endpoint} → HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function progress(current, total, label = '') {
  process.stdout.write(`  Round ${current}/${total}${label ? '  ' + label : ''}        \r`);
}

// ── Data collection ────────────────────────────────────────────────────────

async function collectMinimumCost() {
  console.log('\n[1/5] Minimum Cost Assignment — Hungarian vs Greedy');
  const rounds = [];
  for (let i = 0; i < ROUNDS; i++) {
    progress(i + 1, ROUNDS);
    const data = await post('/api/games/minimum-cost/rounds');
    rounds.push({ round: i + 1, timings: data.timings });
  }
  console.log('  Done.                                          ');
  return rounds;
}

async function collectSnakeLadder() {
  console.log('\n[2/5] Snake & Ladder — BFS vs Dijkstra');
  const rounds = [];
  // Vary board size across 20 rounds: 6→12→6 to show scaling
  const sizes = [6,7,8,9,10,11,12,10,9,8,7,6,8,10,12,11,9,7,8,10];
  for (let i = 0; i < ROUNDS; i++) {
    const sz = sizes[i] || 8;
    progress(i + 1, ROUNDS, `(${sz}×${sz})`);
    const data = await post('/api/games/snake-ladder/rounds', { boardSize: sz });
    rounds.push({ round: i + 1, boardSize: sz, timings: data.timings });
  }
  console.log('  Done.                                          ');
  return rounds;
}

async function collectTraffic() {
  console.log('\n[3/5] Traffic Flow — Edmonds-Karp vs Dinic\'s');
  const rounds = [];
  for (let i = 0; i < ROUNDS; i++) {
    progress(i + 1, ROUNDS);
    const data = await post('/api/games/traffic/rounds');
    rounds.push({ round: i + 1, timings: data.timings });
  }
  console.log('  Done.                                          ');
  return rounds;
}

async function collectKnightsTour() {
  console.log('\n[4/5] Knight\'s Tour — Warnsdorff\'s vs Backtracking');
  console.log('  (Rounds 1-10: 8×8 board  |  Rounds 11-20: 16×16 board)');
  const rounds = [];
  for (let i = 0; i < ROUNDS; i++) {
    const boardSize = i < 10 ? 8 : 16;
    progress(i + 1, ROUNDS, `(${boardSize}×${boardSize})`);
    const data = await post('/api/games/knights-tour/rounds', { boardSize });
    rounds.push({ round: i + 1, boardSize, timings: data.timings });
  }
  console.log('  Done.                                          ');
  return rounds;
}

async function collectQueens() {
  if (SKIP_QUEENS) {
    console.log('\n[5/5] Sixteen Queens — SKIPPED (NO_QUEENS=1)');
    return [];
  }

  console.log(`\n[5/5] Sixteen Queens — Sequential vs Threaded  (${QUEENS_RUNS} solver runs)`);
  console.log('  Each run finds all 14,772,512 solutions for N=16.');
  console.log('  Expected time: 1–5 minutes per run depending on hardware.\n');

  const runs = [];
  for (let i = 0; i < QUEENS_RUNS; i++) {
    console.log(`  ── Solver run ${i + 1}/${QUEENS_RUNS} ──────────────────────`);

    // Check if solver is still running from a previous attempt
    const pre = await get('/api/games/queens/solve/status').catch(() => ({ status: 'done' }));
    if (pre.status === 'running') {
      console.log('  Solver already running — waiting for it to finish…');
    } else {
      await post('/api/games/queens/solve');
      console.log('  Solver started.');
    }

    // Poll until done
    const startWait = Date.now();
    let status;
    while (true) {
      await sleep(4000);
      status = await get('/api/games/queens/solve/status');
      if (status.status === 'done') break;
      const elapsed = ((Date.now() - startWait) / 1000).toFixed(0);
      process.stdout.write(`  Running… ${elapsed}s elapsed\r`);
    }

    const seqMs  = status.sequentialTimeMs ?? 0;
    const thrMs  = status.threadedTimeMs   ?? 0;
    console.log(`  Done — Sequential: ${seqMs.toFixed(1)} ms  |  Threaded: ${thrMs.toFixed(1)} ms  |  Solutions: ${status.sequentialCount?.toLocaleString() ?? '?'}`);

    runs.push({
      round: i + 1,
      timings: [
        { algorithmName: 'Sequential', executionTimeMs: seqMs },
        { algorithmName: 'Threaded',   executionTimeMs: thrMs },
      ],
    });
  }
  return runs;
}

// ── HTML generation ────────────────────────────────────────────────────────

function extractSeries(rounds, algorithmName) {
  return rounds.map(r => {
    const t = r.timings.find(t => t.algorithmName === algorithmName);
    return t != null ? parseFloat(t.executionTimeMs.toFixed(4)) : null;
  });
}

function buildLineChart(title, labels, series) {
  const COLOURS = ['#4A90D9', '#E8762B', '#2ECC71', '#9B59B6'];
  const datasets = series.map(({ name, data }, idx) => ({
    label: name,
    data,
    borderColor: COLOURS[idx % COLOURS.length],
    backgroundColor: COLOURS[idx % COLOURS.length] + '22',
    tension: 0.35,
    pointRadius: 4,
    borderWidth: 2,
  }));

  return {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title:  { display: true,  text: title, font: { size: 15, weight: 'bold' } },
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} ms`,
          },
        },
      },
      scales: {
        x: { title: { display: true, text: 'Round' } },
        y: { title: { display: true, text: 'Execution Time (ms)' }, beginAtZero: true },
      },
    },
  };
}

function buildTableHTML(rounds, algorithmNames) {
  const headers = ['Round', ...algorithmNames.map(n => `${n} (ms)`)].map(h => `<th>${h}</th>`).join('');
  const rows = rounds.map(r => {
    const cells = algorithmNames.map(name => {
      const t = r.timings.find(t => t.algorithmName === name);
      return `<td>${t ? t.executionTimeMs.toFixed(4) : '—'}</td>`;
    }).join('');
    return `<tr><td>${r.round}</td>${cells}</tr>`;
  });
  return `<table><thead><tr>${headers}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

function generateHTML(allData) {
  const { minimumCost, snakeLadder, traffic, knightsTour, queens } = allData;

  const sections = [];

  // ── Minimum Cost ──────────────────────────────────────────────────────────
  {
    const labels  = minimumCost.map(r => `R${r.round}`);
    const config  = buildLineChart(
      'Minimum Cost Assignment — Hungarian vs Greedy (20 Rounds)',
      labels,
      [
        { name: 'Hungarian', data: extractSeries(minimumCost, 'Hungarian') },
        { name: 'Greedy',    data: extractSeries(minimumCost, 'Greedy') },
      ]
    );
    sections.push({
      id:     'chart-mc',
      title:  'Game 1 — Minimum Cost Assignment',
      desc:   'The Hungarian algorithm solves optimal assignment in O(n³). Greedy provides a heuristic comparison. Input: random n×n cost matrix, n ∈ [50, 100].',
      config,
      table:  buildTableHTML(minimumCost, ['Hungarian', 'Greedy']),
    });
  }

  // ── Snake & Ladder ────────────────────────────────────────────────────────
  {
    const labels  = snakeLadder.map(r => `R${r.round} (${r.boardSize}²)`);
    const config  = buildLineChart(
      'Snake & Ladder — BFS vs Dijkstra (20 Rounds, varying board size)',
      labels,
      [
        { name: 'BFS',      data: extractSeries(snakeLadder, 'BFS') },
        { name: 'Dijkstra', data: extractSeries(snakeLadder, 'Dijkstra') },
      ]
    );
    sections.push({
      id:     'chart-sl',
      title:  'Game 2 — Snake & Ladder Shortest Path',
      desc:   'BFS and Dijkstra both find the minimum number of dice throws. Board size varies from 6×6 to 12×12 across rounds to illustrate scaling behaviour.',
      config,
      table:  buildTableHTML(snakeLadder, ['BFS', 'Dijkstra']),
    });
  }

  // ── Traffic Flow ──────────────────────────────────────────────────────────
  {
    const labels  = traffic.map(r => `R${r.round}`);
    const config  = buildLineChart(
      "Traffic Flow — Edmonds-Karp vs Dinic's (20 Rounds)",
      labels,
      [
        { name: 'Edmonds-Karp', data: extractSeries(traffic, 'Edmonds-Karp') },
        { name: "Dinic's",      data: extractSeries(traffic, "Dinic's") },
      ]
    );
    sections.push({
      id:     'chart-tf',
      title:  "Game 3 — Traffic Flow (Max-Flow)",
      desc:   "Edmonds-Karp (O(VE²)) uses BFS augmenting paths. Dinic's (O(V²E)) builds level graphs for blocking-flow. Fixed 9-node topology; edge capacities randomised each round.",
      config,
      table:  buildTableHTML(traffic, ['Edmonds-Karp', "Dinic's"]),
    });
  }

  // ── Knight's Tour ─────────────────────────────────────────────────────────
  {
    const labels  = knightsTour.map(r => `R${r.round}\n(${r.boardSize}×${r.boardSize})`);
    const config  = buildLineChart(
      "Knight's Tour — Warnsdorff's vs Backtracking (20 Rounds)",
      labels,
      [
        { name: "Warnsdorff's", data: extractSeries(knightsTour, "Warnsdorff's") },
        { name: 'Backtracking', data: extractSeries(knightsTour, 'Backtracking') },
      ]
    );
    sections.push({
      id:     'chart-kt',
      title:  "Game 4 — Knight's Tour",
      desc:   "Rounds 1–10 use an 8×8 board; rounds 11–20 use 16×16. Warnsdorff's heuristic runs in near-linear time. Backtracking with Warnsdorff pruning explores candidates depth-first.",
      config,
      table:  buildTableHTML(knightsTour, ["Warnsdorff's", 'Backtracking']),
    });
  }

  // ── Queens ────────────────────────────────────────────────────────────────
  if (queens.length > 0) {
    const labels  = queens.map(r => `Run ${r.round}`);
    const config  = buildLineChart(
      `Sixteen Queens — Sequential vs Threaded (${queens.length} Solver Run${queens.length !== 1 ? 's' : ''}, N=16)`,
      labels,
      [
        { name: 'Sequential', data: extractSeries(queens, 'Sequential') },
        { name: 'Threaded',   data: extractSeries(queens, 'Threaded') },
      ]
    );
    sections.push({
      id:     'chart-q',
      title:  'Game 5 — Sixteen Queens',
      desc:   `Sequential bitmask backtracking runs on a single thread. The threaded solver distributes first-row columns across CPU cores. Both find all 14,772,512 solutions for N=16.`,
      config,
      table:  buildTableHTML(queens, ['Sequential', 'Threaded']),
    });
  } else {
    sections.push({
      id:     'chart-q',
      title:  'Game 5 — Sixteen Queens',
      desc:   'Skipped. Re-run without NO_QUEENS=1 to include Queens timing (expects several minutes per solver run).',
      config: null,
      table:  '',
    });
  }

  // ── Assemble HTML ──────────────────────────────────────────────────────────
  const sectionHTML = sections.map(s => `
  <section>
    <h2>${s.title}</h2>
    <p class="desc">${s.desc}</p>
    ${s.config
      ? `<div class="chart-wrap"><canvas id="${s.id}"></canvas></div>`
      : `<div class="chart-wrap skipped">No data — solver run skipped.</div>`}
    ${s.table ? `<details><summary>Raw timing data</summary>${s.table}</details>` : ''}
  </section>`).join('\n');

  const chartInits = sections
    .filter(s => s.config)
    .map(s => `new Chart(document.getElementById('${s.id}'), ${JSON.stringify(s.config)});`)
    .join('\n  ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Algorithm Timing Benchmark Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f0f2f5;
      color: #222;
      padding: 32px 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    header { text-align: center; margin-bottom: 40px; }
    header h1 { font-size: 1.8rem; margin-bottom: 6px; }
    header p  { color: #666; font-size: 0.9rem; }
    section {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,.08);
      padding: 28px 32px;
      margin-bottom: 36px;
    }
    section h2 { font-size: 1.15rem; margin-bottom: 8px; color: #1a1a2e; }
    .desc { font-size: 0.85rem; color: #555; margin-bottom: 20px; line-height: 1.5; }
    .chart-wrap { position: relative; height: 320px; margin-bottom: 16px; }
    .chart-wrap.skipped {
      display: flex; align-items: center; justify-content: center;
      background: #f8f8f8; border-radius: 8px; color: #999; font-size: 0.9rem;
      border: 1px dashed #ccc;
    }
    details { margin-top: 12px; }
    summary { cursor: pointer; font-size: 0.82rem; color: #4A90D9; user-select: none; }
    summary:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.8rem; }
    th, td { padding: 5px 10px; border: 1px solid #e0e0e0; text-align: right; }
    th { background: #f5f7fa; font-weight: 600; text-align: center; }
    td:first-child { text-align: center; }
    tr:nth-child(even) td { background: #fafafa; }
    @media print {
      body { background: #fff; padding: 0; }
      section { box-shadow: none; border: 1px solid #ddd; break-inside: avoid; }
      .chart-wrap { height: 260px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Algorithm Timing Benchmark Report</h1>
    <p>Execution time (ms) for each algorithm technique — ${ROUNDS} game rounds per game<br>
    Generated: ${new Date().toLocaleString()}</p>
  </header>

  ${sectionHTML}

  <script>
  ${chartInits}
  </script>
</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('Algorithm Timing Benchmark');
  console.log('===========================');
  console.log(`Server : ${API}`);
  console.log(`Rounds : ${ROUNDS} per game`);
  if (!SKIP_QUEENS) console.log(`Queens : ${QUEENS_RUNS} solver runs`);
  else             console.log(`Queens : SKIPPED`);
  console.log('');

  // Verify server is reachable — any HTTP response means the server is up;
  // only a network-level error (ECONNREFUSED etc.) means it's not running.
  try {
    await fetch(`${API}/api/players`);
  } catch {
    console.error('Error: Cannot reach backend server at ' + API);
    console.error('Start the server first:  cd server && npm run dev');
    process.exit(1);
  }
  console.log('Server reachable. Starting benchmark…');

  const minimumCost = await collectMinimumCost();
  const snakeLadder = await collectSnakeLadder();
  const traffic     = await collectTraffic();
  const knightsTour = await collectKnightsTour();
  const queens      = await collectQueens();

  const html    = generateHTML({ minimumCost, snakeLadder, traffic, knightsTour, queens });
  const outPath = path.join(__dirname, 'benchmark-report.html');
  writeFileSync(outPath, html, 'utf8');

  console.log('');
  console.log('✓ Report saved: ' + outPath);
  console.log('  Open it in any browser to view the charts.');
  console.log('');
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
