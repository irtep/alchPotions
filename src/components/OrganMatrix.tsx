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

  // Global "nothing"
  const globalNothingCombos = new Set(
    nothingTried.map((n) => `${n.combo.metal}|||${n.combo.herb}`)
  );

  // Local "nothing"
  const localNothingCombos = new Set(
    nothingTried
      .filter((n) => n.combo.organ === organ)
      .map((n) => `${n.combo.metal}|||${n.combo.herb}`)
  );

  // Collect metals/herbs that are part of local nothings
  const highlightMetals = new Set<string>();
  const highlightHerbs = new Set<string>();
  localNothingCombos.forEach((key) => {
    const [metal, herb] = key.split("|||");
    highlightMetals.add(metal);
    highlightHerbs.add(herb);
  });

  const getCellContent = (metal: string, herb: string) => {
    const key = `${metal}|||${herb}`;

    // ✅ Potion for this organ
    const potion = potions.find(
      (p) => p.combo.metal === metal && p.combo.organ === organ && p.combo.herb === herb
    );
    if (potion) return `✅ ${potion.name}`;

    // ⚠️ Close hint for this organ
    const close = closeHints.find(
      (c) => c.combo.metal === metal && c.combo.organ === organ && c.combo.herb === herb
    );
    if (close) return `⚠️ ${close.name}`;

    // ❌ Local nothing
    if (localNothingCombos.has(key)) return "❌ Local Nothing";

    // ❌ Global nothing
    if (globalNothingCombos.has(key)) return "❌ Nothing";

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
              <th
                key={h}
                style={{
                  background: highlightHerbs.has(h)
                    ? "salmon"
                    : getColor("herb", herbs.indexOf(h)),
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metals.map((m) => (
            <tr
              key={m}
              style={{
                background: highlightMetals.has(m) ? "salmon" : "transparent",
              }}
            >
              <td
                style={{
                  background: getColor("metal", metals.indexOf(m)),
                  fontWeight: highlightMetals.has(m) ? "bold" : "normal",
                }}
              >
                {m}
              </td>
              {herbs.map((h) => {
                const isLocalNothing = localNothingCombos.has(`${m}|||${h}`);
                const colHighlighted = highlightHerbs.has(h);
                const rowHighlighted = highlightMetals.has(m);

                return (
                  <td
                    key={h + m}
                    style={{
                      textAlign: "center",
                      background: isLocalNothing
                        ? "lightcoral"
                        : colHighlighted || rowHighlighted
                        ? "mistyrose"
                        : "transparent",
                    }}
                  >
                    {getCellContent(m, h)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrganMatrix;
