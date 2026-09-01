// Turns a farmer's real activity into a 0-900 score.
// This mirrors the weighted-signal model from the spec doc, computed from
// whatever real records and checklist data exist for that farmer so far.

function monthsWithActivity(records, monthWindow = 6) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthWindow);
  const months = new Set(
    records
      .filter(r => new Date(r.record_date) >= cutoff)
      .map(r => r.record_date.slice(0, 7)) // "YYYY-MM"
  );
  return months.size;
}

function totalIn(records) {
  return records.filter(r => r.direction === "in").reduce((sum, r) => sum + Number(r.amount), 0);
}

function trustedShare(records, direction) {
  const relevant = records.filter(r => r.direction === direction);
  if (relevant.length === 0) return 0;
  const trusted = relevant.filter(r => r.trusted).length;
  return trusted / relevant.length;
}

export function calculateGrainScore(records) {
  const consistency = Math.min(monthsWithActivity(records, 6) / 6, 1) * 100;
  const salesVolume = Math.min(totalIn(records) / 50000000, 1) * 100; // cap: ₦50m
  const supplierReliability = trustedShare(records, "out") * 100;
  const seasonalSpread = Math.min(monthsWithActivity(records, 12) / 4, 1) * 100; // 4 seasonal windows/year

  const components = [
    { label: "Purchase consistency", weight: 25, score: Math.round(consistency), note: `${monthsWithActivity(records, 6)} active months in the last 6` },
    { label: "Verified sales volume", weight: 30, score: Math.round(salesVolume), note: `₦${totalIn(records).toLocaleString()} recorded in sales` },
    { label: "Supplier payment reliability", weight: 30, score: Math.round(supplierReliability), note: "Share of purchases from trusted suppliers" },
    { label: "Seasonal trade pattern", weight: 15, score: Math.round(seasonalSpread), note: "Spread of activity across the year" },
  ];

  const total = components.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0);
  return { total: Math.round((total / 100) * 900), components };
}

export function calculateLivestockScore(records, checklistItems) {
  const feedConsistency = Math.min(monthsWithActivity(records.filter(r => r.label.includes("feed")), 6) / 6, 1) * 100;
  const salesVolume = Math.min(totalIn(records) / 5000000, 1) * 100; // cap: ₦5m
  const doneCount = checklistItems.filter(c => c.done).length;
  const biosecurity = checklistItems.length ? (doneCount / checklistItems.length) * 100 : 0;
  const offtakeReliability = trustedShare(records, "in") * 100;

  const components = [
    { label: "Feed purchase consistency", weight: 25, score: Math.round(feedConsistency), note: "Regularity of logged feed purchases" },
    { label: "Verified sales volume", weight: 25, score: Math.round(salesVolume), note: `₦${totalIn(records).toLocaleString()} recorded in sales` },
    { label: "Biosecurity & flock health", weight: 30, score: Math.round(biosecurity), note: `${doneCount} of ${checklistItems.length} health checks done` },
    { label: "Off-take reliability", weight: 20, score: Math.round(offtakeReliability), note: "Share of sales to trusted buyers" },
  ];

  const total = components.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0);
  return { total: Math.round((total / 100) * 900), components };
}
