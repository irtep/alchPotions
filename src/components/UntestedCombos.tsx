import React, { useEffect } from "react";
import type { Potion, CloseHint, NothingTried, InFlask } from "../App";
import { metals } from "../data/metals";
import { herbs } from "../data/herbs";

type UntestedCombosProps = {
  organ: string; 
  metal: string;
  herb: string;
  potions: Potion[];
  closeHints: CloseHint[];
  nothingTried: NothingTried[];
  inFlask: InFlask[];
};

const UntestedCombos: React.FC<UntestedCombosProps> = ({
  organ,
  metal,
  herb,
  potions,
  closeHints,
  nothingTried,
  inFlask,
}) => {
  const tried = new Set<string>();
  potions.forEach((p) => tried.add(`${p.combo.metal}|||${p.combo.herb}`));
  closeHints.forEach((c) => tried.add(`${c.combo.metal}|||${c.combo.herb}`));
  nothingTried.forEach((n) => tried.add(`${n.combo.metal}|||${n.combo.herb}`));
  inFlask.forEach((f) => tried.add(`${f.combo.metal}|||${f.combo.herb}`));

  const organMetals = new Set<string>();
  const organHerbs = new Set<string>();
  if (organ) {
    [...potions, ...closeHints, ...nothingTried, ...inFlask].forEach((entry) => {
      if (entry.combo.organ === organ) {
        organMetals.add(entry.combo.metal);
        organHerbs.add(entry.combo.herb);
      }
    });
  }

  const untested: string[] = [];
  metals.forEach((m) => {
    herbs.forEach((h) => {
      const key = `${m}|||${h}`;
      if (tried.has(key)) return;
      if (organ && (organMetals.has(m) || organHerbs.has(h))) return;
      untested.push(`${m} + ${h}`);
    });
  });
/*
  useEffect(() => {
    console.log(organMetals, organHerbs);
  });
*/
  return (
    <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid gray" }}>
      <h3>
        Untested Metal + Herb Combos
        {organ ? ` (excluding metals/herbs already used with "${organ}")` : ""}
      </h3>
      {untested.length === 0 ? (
        <p>All relevant combos have been tried!</p>
      ) : (
        <ul>
          {untested.map((combo) => {
            const [m, h] = combo.split(" + ");
            const highlight = (m === metal || h === herb) ? "yellow" : "transparent";

            return (
              <li key={combo} style={{ backgroundColor: highlight }}>
                {combo}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UntestedCombos;
