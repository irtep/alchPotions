import type { Combo } from "../App";

export function generateAllCombos(metals: string[], organs: string[], herbs: string[]): Combo[] {
  const combos: Combo[] = [];
  for (const m of metals) for (const o of organs) for (const h of herbs) {
    combos.push({ metal: m, organ: o, herb: h });
  }
  return combos;
}

export function countMatches(a: Combo, b: Combo) {
  let matches = 0;
  if (a.metal === b.metal) matches++;
  if (a.organ === b.organ) matches++;
  if (a.herb === b.herb) matches++;
  return matches;
}

// generate consistent colors for categories
export function getColor(category: "metal" | "organ" | "herb", index: number): string {
  if (category === "metal") {
    return `hsl(${(index * 35) % 360}, 50%, 75%)`;
  } else if (category === "organ") {
    return `hsl(${(index * 55) % 360}, 60%, 70%)`;
  } else {
    return `hsl(${(index * 75) % 360}, 65%, 65%)`;
  }
}