export const TIERS = [
  // Bronze
  { name: "Bronze 5", value: 1100 },
  { name: "Bronze 4", value: 1200 },
  { name: "Bronze 3", value: 1300 },
  { name: "Bronze 2", value: 1400 },
  { name: "Bronze 1", value: 1499 },
  // Silver
  { name: "Silver 5", value: 1500 },
  { name: "Silver 4", value: 1600 },
  { name: "Silver 3", value: 1700 },
  { name: "Silver 2", value: 1800 },
  { name: "Silver 1", value: 1999 },
  // Gold
  { name: "Gold 5", value: 2000 },
  { name: "Gold 4", value: 2100 },
  { name: "Gold 3", value: 2200 },
  { name: "Gold 2", value: 2300 },
  { name: "Gold 1", value: 2499 },
  // Platinum
  { name: "Platinum 5", value: 2500 },
  { name: "Platinum 4", value: 2600 },
  { name: "Platinum 3", value: 2700 },
  { name: "Platinum 2", value: 2800 },
  { name: "Platinum 1", value: 2999 },
  // Diamond
  { name: "Diamond 5", value: 3000 },
  { name: "Diamond 4", value: 3100 },
  { name: "Diamond 3", value: 3200 },
  { name: "Diamond 2", value: 3300 },
  { name: "Diamond 1", value: 3499 },
  // Master
  { name: "Master 5", value: 3500 },
  { name: "Master 4", value: 3600 },
  { name: "Master 3", value: 3700 },
  { name: "Master 2", value: 3800 },
  { name: "Master 1", value: 3999 },
  // Grandmaster
  { name: "Grandmaster 5", value: 4000 },
  { name: "Grandmaster 4", value: 4100 },
  { name: "Grandmaster 3", value: 4200 },
  { name: "Grandmaster 2", value: 4300 },
  { name: "Grandmaster 1", value: 4500 },
  // Champion
  { name: "Champion 5", value: 4600 },
  { name: "Champion 4", value: 4700 },
  { name: "Champion 3", value: 4800 },
  { name: "Champion 2", value: 4900 },
  { name: "Champion 1", value: 5000 },
] as const;

export function getTierBySR(sr: number): string {
  // Find the closest tier
  // If exact match not found, find the range
  // Simple implementation: iterate
  let closest: typeof TIERS[number] = TIERS[0];
  let minDiff = Math.abs(sr - TIERS[0].value);

  for (const tier of TIERS) {
    const diff = Math.abs(sr - tier.value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = tier;
    }
  }
  return closest.name;
}
