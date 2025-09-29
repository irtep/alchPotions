import React from "react";
import type { Potion, CloseHint, NothingTried, InFlask } from "../App";
import { metals } from "../data/metals";
import { herbs } from "../data/herbs";

type UntestedCombosProps = {
  potions: Potion[];
  closeHints: CloseHint[];
  nothingTried: NothingTried[];
  inFlask: InFlask[];
};

const UntestedCombos: React.FC<UntestedCombosProps> = ({
  potions,
  closeHints,
  nothingTried,
  inFlask,
}) => {
  // Build a set of tried metal+herb combos (ignore organ dimension)
  const tried = new Set<string>();

  potions.forEach((p) => tried.add(`${p.combo.metal}|||${p.combo.herb}`));
  closeHints.forEach((c) => tried.add(`${c.combo.metal}|||${c.combo.herb}`));
  nothingTried.forEach((n) => tried.add(`${n.combo.metal}|||${n.combo.herb}`));
  inFlask.forEach((f) => tried.add(`${f.combo.metal}|||${f.combo.herb}`));

  // Find untested combos
  const untested: string[] = [];
  metals.forEach((m) => {
    herbs.forEach((h) => {
      const key = `${m}|||${h}`;
      if (!tried.has(key)) {
        untested.push(`${m} + ${h}`);
      }
    });
  });

  return (
    <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid gray" }}>
      <h3>{`Untested Metal + Herb Combos ( ${untested.length})`}</h3>
      {untested.length === 0 ? (
        <p>All metal + herb combinations have been tried!</p>
      ) : (
        <ul>
          {untested.map((combo) => (
            <li key={combo}>{combo}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UntestedCombos;
