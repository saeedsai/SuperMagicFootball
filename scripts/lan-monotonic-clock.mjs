// Elapsed-time clock for broker TTLs. Wall-clock adjustments must not extend
// join approvals or replay protection windows.
export function createLanMonotonicClock(source = () => performance.now()) {
  if (typeof source !== 'function') throw new TypeError('Monotonic clock source required');
  let last = Number(source());
  if (!Number.isFinite(last)) throw new TypeError('Invalid monotonic clock source');
  return () => {
    const sample = Number(source());
    if (Number.isFinite(sample) && sample > last) last = sample;
    return Math.floor(last);
  };
}
