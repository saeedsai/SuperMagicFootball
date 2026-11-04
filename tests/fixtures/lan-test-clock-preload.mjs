// Test-only preload for advancing a broker's monotonic clock independently of
// the system wall clock. Never used by the game or production server command.
let wall = 1700000000000;
let elapsed = 1000;
Date.now = () => wall;
Object.defineProperty(globalThis.performance, 'now', {
  configurable: true,
  value: () => elapsed
});

let pending = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  pending += chunk;
  for (;;) {
    const newline = pending.indexOf('\n');
    if (newline < 0) break;
    const line = pending.slice(0, newline);
    pending = pending.slice(newline + 1);
    try {
      const update = JSON.parse(line);
      if (Number.isFinite(update.wall)) wall = update.wall;
      if (Number.isFinite(update.elapsed)) elapsed = update.elapsed;
      process.stdout.write('CLOCK_SET\n');
    } catch {
      // Ignore malformed test-control lines rather than destabilizing the broker.
    }
  }
});
