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

  // filter metals/herbs that are NOT in "nothing" with this organ
  const forbiddenMetals = new Set(
    nothingTried.filter((n) => n.combo.organ === organ).map((n) => n.combo.metal)
  );
  const forbiddenHerbs = new Set(
    nothingTried.filter((n) => n.combo.organ === organ).map((n) => n.combo.herb)
  );

  const validMetals = metals.filter((m) => !forbiddenMetals.has(m));
  const validHerbs = herbs.filter((h) => !forbiddenHerbs.has(h));

  const getCellContent = (metal: string, herb: string) => {

    const potion = potions.find(
      (p) => p.combo.metal === metal && p.combo.organ === organ && p.combo.herb === herb
    );
    if (potion) return `✅ ${potion.name}`;

    const close = closeHints.find(
      (c) => c.combo.metal === metal && c.combo.organ === organ && c.combo.herb === herb
    );
    if (close) return `⚠️ ${close.name}`;

    const nothing = nothingTried.find(
      (n) => n.combo.metal === metal && n.combo.organ === organ && n.combo.herb === herb
    );
    if (nothing) return "❌ Nothing";

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
            {validHerbs.map((h) => (
              <th key={h} style={{ background: getColor("herb", herbs.indexOf(h)) }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {validMetals.map((m) => (
            <tr key={m}>
              <td style={{ background: getColor("metal", metals.indexOf(m)) }}>{m}</td>
              {validHerbs.map((h) => (
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
