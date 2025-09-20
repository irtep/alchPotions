import React from "react";
import type { Potion, CloseHint, NothingTried, InFlask } from "../App";
import { metals } from "../data/metals";
import { herbs } from "../data/herbs";
import { getColor } from "../functions/helpFunctions";

type OrganMatrixProps = {
  organ: string;
  potions: Potion[];
  closeHints: CloseHint[];
  nothingTried: NothingTried[];
  inFlask: InFlask[];
};

const OrganMatrix: React.FC<OrganMatrixProps> = ({ organ, potions, closeHints, nothingTried, inFlask }) => {
  if (!organ) return null;

  // Build sets of all metal-herb combos that are failures (nothingTried) or successes (potions)
  const nothingCombos = new Set(
    nothingTried.map((n) => `${n.combo.metal}|||${n.combo.herb}`)
  );
  /*
  const potionCombos = new Map<string, string>(
    potions.map((p) => [`${p.combo.metal}|||${p.combo.herb}`, p.name])
  );
*/
  const getCellContent = (metal: string, herb: string) => {
    const key = `${metal}|||${herb}`;

    // ✅ Check if potion exists for this organ
    const potion = potions.find(
      (p) => p.combo.metal === metal && p.combo.organ === organ && p.combo.herb === herb
    );
    if (potion) return `✅ ${potion.name}`;

    // ⚠️ Check if close hint exists for this organ
    const close = closeHints.find(
      (c) => c.combo.metal === metal && c.combo.organ === organ && c.combo.herb === herb
    );
    if (close) return `⚠️ ${close.name}`;

    // ❌ Generalized "Nothing": if this metal-herb combo failed for any organ
    if (!potion && nothingCombos.has(key)) return "❌ Nothing";

    // 🧪 In Flask
    const flask = inFlask.find(
      (f) => f.combo.metal === metal && f.combo.organ === organ && f.combo.herb === herb
    );
    if (flask) return "🧪 In Flask";

    return "";
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Matrix for organ: {organ}</h3>
      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ background: "#333", color: "white" }}>Metal \\ Herb</th>
            {herbs.map((h) => (
              <th key={h} style={{ background: getColor("herb", herbs.indexOf(h)) }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metals.map((m) => (
            <tr key={m}>
              <td style={{ background: getColor("metal", metals.indexOf(m)) }}>{m}</td>
              {herbs.map((h) => (
                <td key={h + m} style={{ textAlign: "center" }}>
                  {getCellContent(m, h)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrganMatrix;
