/**
 * Autoplay: Sixteen Queens — solver + 20 solution submissions
 *
 * 1. Opens the Queens page in a real browser.
 * 2. Clicks "Run Solvers" if the solver hasn't finished yet, then waits.
 * 3. Generates 25 distinct valid 16-queens solutions locally (instant).
 * 4. For each of 20 rounds: clears the board, places a solution, submits.
 *
 * Prerequisites:
 *   - Backend running on http://localhost:3001
 *   - Frontend running on http://localhost:5173
 *
 * Run:
 *   node scripts/autoplay-queens.js
 *
 * Note on timing chart:
 *   Solver timing (Sequential vs Threaded) is recorded once per "Run Solvers"
 *   click. Re-run this script (or click "Run Solvers" again) to add more
 *   timing rows to algorithm_timings. Each of the 20 submissions is visible
 *   in the queens_solutions and game_results tables.
 */

const { chromium } = require('playwright');

const FRONTEND   = 'http://localhost:5173';
const API        = 'http://localhost:3001';
const PLAYER     = 'AutoBot-Q';
const SUBMIT_N   = 20;   // number of solution submissions
const SOLVER_RUNS = 3;   // how many times to run the solver for timing data

// ── Generate valid 16-queens solutions locally ─────────────────────────────
function generateSolutions(limit = 25) {
  const N = 16;
  const solutions = [];
  const queens = new Array(N).fill(-1);
  const cols  = new Set();
  const d1    = new Set(); // row - col
  const d2    = new Set(); // row + col

  function bt(row) {
    if (solutions.length >= limit) return;
    if (row === N) { solutions.push([...queens]); return; }
    for (let col = 0; col < N; col++) {
      if (!cols.has(col) && !d1.has(row - col) && !d2.has(row + col)) {
        queens[row] = col;
        cols.add(col); d1.add(row - col); d2.add(row + col);
        bt(row + 1);
        queens[row] = -1;
        cols.delete(col); d1.delete(row - col); d2.delete(row + col);
      }
    }
  }
  bt(0);
  return solutions;
}

// ── Helpers ────────────────────────────────────────────────────────────────
async function solverStatus() {
  const res = await fetch(`${API}/api/games/queens/solve/status`);
  return res.json();
}

async function waitForSolver(page, timeoutMs = 120_000) {
  const start = Date.now();
  console.log('  Waiting for solver to finish…');
  while (Date.now() - start < timeoutMs) {
    const s = await solverStatus().catch(() => ({ status: 'unknown' }));
    if (s.status === 'done') {
      console.log(`  Solver done — seq: ${s.sequentialTimeMs?.toFixed(0)} ms, threaded: ${s.threadedTimeMs?.toFixed(0)} ms`);
      return s;
    }
    await page.waitForTimeout(2500);
    process.stdout.write('.');
  }
  throw new Error('Solver did not finish within timeout');
}

// ── Main ───────────────────────────────────────────────────────────────────
async function run() {
  const solutions = generateSolutions(SUBMIT_N + 5);
  console.log(`Generated ${solutions.length} valid 16-queens solutions locally.`);

  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  console.log('\nNavigating to Sixteen Queens…');
  await page.goto(`${FRONTEND}/queens`);

  // ── Enter player name ────────────────────────────────────────────────────
  await page.waitForSelector('input[placeholder="Player name..."]');
  await page.fill('input[placeholder="Player name..."]', PLAYER);
  await page.click('button:has-text("Start Playing")');
  await page.waitForTimeout(500);

  // ── Run the solver SOLVER_RUNS times for timing data ─────────────────────
  for (let run = 1; run <= SOLVER_RUNS; run++) {
    console.log(`\n── Solver run ${run}/${SOLVER_RUNS} ─────────────────────────`);

    // Click "Run Solvers" button
    await page.click('button:has-text("Run Solvers"), button:has-text("Run Again")');
    await page.waitForTimeout(1000);

    await waitForSolver(page);
    console.log();

    // Wait briefly for the UI to refresh
    await page.waitForTimeout(1500);
  }

  // ── Submit 20 solutions ───────────────────────────────────────────────────
  let submitted = 0;
  let solutionIdx = 0;

  while (submitted < SUBMIT_N && solutionIdx < solutions.length) {
    const sol = solutions[solutionIdx++];
    console.log(`\nRound ${submitted + 1}/${SUBMIT_N} — placing queens: [${sol.join(',')}]`);

    // Clear the board first
    await page.click('button:has-text("Clear Board"), button:has-text("✕ Clear Board")');
    await page.waitForTimeout(200);

    // Place one queen per row
    for (let row = 0; row < 16; row++) {
      const col = sol[row];
      await page.locator(`[data-cell="${row}-${col}"]`).click();
      await page.waitForTimeout(40);
    }

    // Submit — intercept the response in the same Promise.all
    const [submitResp] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/submit-solution') && r.request().method() === 'POST',
        { timeout: 10000 }
      ).catch(() => null),
      page.click('button:has-text("Submit Solution")'),
    ]);

    if (submitResp) {
      const data = await submitResp.json().catch(() => ({}));
      console.log(`  isValid=${data.isValid}  isNew=${data.isNew}  isRecognized=${data.isRecognized}`);
      console.log(`  ${data.message}`);

      if (!data.isValid) {
        // Should not happen with generated solutions; skip and try next
        console.warn('  ! Invalid solution — skipping');
        continue;
      }
    }

    // Close any result overlay
    const closeBtn = page.locator('button:has-text("Close"), button:has-text("✕"), button:has-text("OK")');
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click().catch(() => {});
      await page.waitForTimeout(300);
    }

    submitted++;
    await page.waitForTimeout(400);
  }

  console.log(`\n✓ Submitted ${submitted} solutions. Check the database for results.`);
  await page.waitForTimeout(3000);
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
