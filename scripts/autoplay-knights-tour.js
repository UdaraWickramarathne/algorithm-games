/**
 * Autoplay: Knight's Tour — 20 rounds
 *
 * Runs a visible browser, enters the player name, then plays 20 rounds
 * automatically: gets the server's solution via API, clicks every cell on
 * the board in the correct knight-move order, then submits.
 *
 * Prerequisites:
 *   - Backend running on http://localhost:3001
 *   - Frontend running on http://localhost:5173
 *
 * Run:
 *   node scripts/autoplay-knights-tour.js
 */

const { chromium } = require('playwright');

const FRONTEND = 'http://localhost:5173';
const API      = 'http://localhost:3001';
const PLAYER   = 'AutoBot-KT';
const ROUNDS   = 20;

// First 10 rounds on 8×8, last 10 on 16×16 — gives a mix of sizes for the chart
const boardSizeForRound = (i) => (i < 10 ? 8 : 16);

async function getSolution(roundId) {
  const res = await fetch(`${API}/api/games/knights-tour/rounds/${roundId}/solution`);
  if (!res.ok) throw new Error(`Solution fetch failed: ${res.status}`);
  const { solution } = await res.json();
  return solution;
}

// Convert the N×N solution matrix (solution[r][c] = moveNumber) into an
// ordered array of [row, col] starting at move 1.
function solutionToMoveSequence(solution) {
  const n = solution.length;
  const seq = new Array(n * n);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const mv = solution[r][c];
      if (mv > 0) seq[mv - 1] = [r, c];
    }
  }
  return seq;
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 40 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  console.log('Navigating to Knight\'s Tour…');
  await page.goto(`${FRONTEND}/knights-tour`);

  // ── Enter player name ──────────────────────────────────────────────────────
  await page.waitForSelector('input[placeholder="Player name..."]');
  await page.fill('input[placeholder="Player name..."]', PLAYER);
  await page.click('button:has-text("Start Playing")');
  await page.waitForTimeout(400);

  // ── 20 Rounds ─────────────────────────────────────────────────────────────
  for (let i = 0; i < ROUNDS; i++) {
    const size = boardSizeForRound(i);
    console.log(`\nRound ${i + 1}/${ROUNDS}  (${size}×${size})`);

    // Select board size
    await page.click(`button:has-text("${size}×${size}")`);
    await page.waitForTimeout(150);

    // Start / new round — intercept the response so we get roundId
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/games/knights-tour/rounds') && r.request().method() === 'POST'
      ),
      page.click('button:has-text("Start Game"), button:has-text("New Round")'),
    ]);

    const roundData = await response.json();
    const { roundId } = roundData;
    console.log(`  roundId=${roundId}  start=(${roundData.startRow},${roundData.startCol})`);

    // Fetch solution and convert to ordered move list
    const solution = await getSolution(roundId);
    const moves = solutionToMoveSequence(solution);

    // Wait for the board to render
    await page.waitForSelector('[data-cell="0-0"]');

    // Click every cell in move order (move 0 is the start cell, already placed)
    const delay = size === 8 ? 80 : 30;
    for (let m = 1; m < moves.length; m++) {
      const [r, c] = moves[m];
      await page.locator(`[data-cell="${r}-${c}"]`).click();
      if (m % 20 === 0) {
        console.log(`  …move ${m}/${moves.length - 1}`);
      }
      await page.waitForTimeout(delay);
    }

    // Submit — intercept the response in the same Promise.all so we don't miss it
    const [submitResp] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/answer') && r.request().method() === 'POST',
        { timeout: 15000 }
      ).catch(() => null),
      page.click('button:has-text("Submit")'),
    ]);

    if (submitResp) {
      const submitData = await submitResp.json().catch(() => ({}));
      const timings = (submitData.timings || [])
        .map((t) => `${t.algorithmName}: ${t.executionTimeMs.toFixed(3)} ms`)
        .join(', ');
      console.log(`  Timings — ${timings}`);
      console.log(`  Correct: ${submitData.isCorrect}`);
    }

    await page.waitForTimeout(600);
  }

  console.log('\n✓ All 20 rounds complete. Check the database for timing data.');
  await page.waitForTimeout(3000);
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
