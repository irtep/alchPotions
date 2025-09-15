import { useState, useEffect } from "react";
import { metals } from "./data/metals";
import { organs } from "./data/organs";
import { herbs } from "./data/herbs";
import { v4 as uuidv4 } from "uuid";

export type Combo = {
  metal: string;
  organ: string;
  herb: string;
};

export type Potion = { id: string; combo: Combo; name: string };
export type CloseHint = { id: string; combo: Combo; name: string };
export type NothingTried = { id: string; combo: Combo };
export type InFlask = { id: string; combo: Combo };

function generateAllCombos(metals: string[], organs: string[], herbs: string[]): Combo[] {
  const combos: Combo[] = [];
  for (const m of metals) {
    for (const o of organs) {
      for (const h of herbs) {
        combos.push({ metal: m, organ: o, herb: h });
      }
    }
  }
  return combos;
}

function countMatches(a: Combo, b: Combo) {
  let matches = 0;
  if (a.metal === b.metal) matches++;
  if (a.organ === b.organ) matches++;
  if (a.herb === b.herb) matches++;
  return matches;
}

const LOCAL_STORAGE_KEY = "potionResearchData";

// --- Initialize from localStorage ---
const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
let initialPotions: Potion[] = [];
let initialCloseHints: CloseHint[] = [];
let initialNothing: NothingTried[] = [];
let initialInFlask: InFlask[] = [];

if (savedData) {
  try {
    const parsed = JSON.parse(savedData);
    initialPotions = parsed.potions || [];
    initialCloseHints = parsed.closeHints || [];
    initialNothing = parsed.nothingTried || [];
    initialInFlask = parsed.inFlask || [];
  } catch { }
}

// --- compute initial remaining ---
let initialRemaining = generateAllCombos(metals, organs, herbs);
initialPotions.forEach((p) => {
  initialRemaining = initialRemaining.filter(
    (c) =>
      !(c.metal === p.combo.metal && c.organ === p.combo.organ && c.herb === p.combo.herb)
  );
});
initialNothing.forEach((n) => {
  initialRemaining = initialRemaining.filter((c) => countMatches(c, n.combo) < 2);
});
initialCloseHints.forEach((c) => {
  initialRemaining = initialRemaining.filter(
    (combo) =>
      !(combo.metal === c.combo.metal && combo.organ === c.combo.organ && combo.herb === c.combo.herb)
  );
});

function App() {
  const [metal, setMetal] = useState<string | "">("");
  const [organ, setOrgan] = useState<string | "">("");
  const [herb, setHerb] = useState<string | "">("");

  const [remaining, setRemaining] = useState<Combo[]>(initialRemaining);
  const [potions, setPotions] = useState<Potion[]>(initialPotions);
  const [closeHints, setCloseHints] = useState<CloseHint[]>(initialCloseHints);
  const [nothingTried, setNothingTried] = useState<NothingTried[]>(initialNothing);
  const [inFlask, setInFlask] = useState<InFlask[]>(initialInFlask);
  const [message, setMessage] = useState("");

  // --- Save to localStorage on changes ---
  useEffect(() => {
    const data = { potions, closeHints, nothingTried, inFlask };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [potions, closeHints, nothingTried, inFlask]);

  // --- Helpers ---
  const isComboRemaining = (m?: string, o?: string, h?: string) =>
    remaining.some((c) => (!m || c.metal === m) && (!o || c.organ === o) && (!h || c.herb === h));
  const isPotionFound = (m: string, o: string, h: string) =>
    potions.some((p) => p.combo.metal === m && p.combo.organ === o && p.combo.herb === h);
  const isInFlask = (m: string, o: string, h: string) =>
    inFlask.some((f) => f.combo.metal === m && f.combo.organ === o && f.combo.herb === h);

  const saveResult = (
    result: "potion" | "close" | "nothing",
    potionName?: string,
    comboParam?: Combo
  ) => {
    const combo: Combo = comboParam || { metal, organ, herb };
    if (!combo.metal || !combo.organ || !combo.herb) return alert("Select all three ingredients first!");

    if (result === "potion") {
      if (!potionName) return alert("Enter potion name!");
      const p: Potion = { id: uuidv4(), combo, name: potionName };
      setPotions((prev) => [...prev, p]);
      setRemaining((prev) =>
        prev.filter(
          (c) =>
            !(c.metal === combo.metal && c.organ === combo.organ && c.herb === combo.herb)
        )
      );
      setMessage(`✅ Found potion: ${p.name}`);
    } else if (result === "close") {
      if (!potionName) return alert("Enter potion name for close hint!");
      const c: CloseHint = { id: uuidv4(), combo, name: potionName };
      setCloseHints((prev) => [...prev, c]);
      setRemaining((prev) =>
        prev.filter(
          (r) =>
            !(r.metal === combo.metal && r.organ === combo.organ && r.herb === combo.herb)
        )
      );
      setMessage(`⚠️ Close to potion: ${c.name}`);
    } else if (result === "nothing") {
      const n: NothingTried = { id: uuidv4(), combo };
      setNothingTried((prev) => [...prev, n]);
      setRemaining((prev) => prev.filter((c) => countMatches(c, combo) < 2));
      setMessage("❌ Nothing");
    }

    if (!comboParam) {
      setMetal("");
      setOrgan("");
      setHerb("");
    }
  };


  const saveInFlask = () => {
    if (!metal || !organ || !herb) return alert("Select all three ingredients first!");
    const combo: Combo = { metal, organ, herb };
    const f: InFlask = { id: uuidv4(), combo };
    setInFlask((prev) => [...prev, f]);
    setMessage(`🧪 Combination added to flask`);
    setMetal(""); setOrgan(""); setHerb("");
  };

  // --- Delete handlers ---
  const deletePotion = (id: string) => {
    const removed = potions.find((p) => p.id === id);
    if (!removed) return;
    setPotions((prev) => prev.filter((p) => p.id !== id));
    setRemaining((prev) => [...prev, removed.combo]);
  };
  const deleteCloseHint = (id: string) => {
    setCloseHints((prev) => prev.filter((c) => c.id !== id));
  };
  const deleteNothing = (id: string) => {
    const removed = nothingTried.find((n) => n.id === id);
    if (!removed) return;
    setNothingTried((prev) => prev.filter((n) => n.id !== id));

    // recompute remaining
    let newRemaining = generateAllCombos(metals, organs, herbs);
    potions.forEach((p) => {
      newRemaining = newRemaining.filter(
        (c) =>
          !(c.metal === p.combo.metal && c.organ === p.combo.organ && c.herb === p.combo.herb)
      );
    });
    nothingTried
      .filter((n) => n.id !== id)
      .forEach((n) => {
        newRemaining = newRemaining.filter((c) => countMatches(c, n.combo) < 2);
      });
    closeHints.forEach((c) => {
      newRemaining = newRemaining.filter(
        (combo) =>
          !(combo.metal === c.combo.metal && combo.organ === c.combo.organ && combo.herb === c.combo.herb)
      );
    });
    setRemaining(newRemaining);
  };
  const deleteInFlask = (id: string) => {
    setInFlask((prev) => prev.filter((f) => f.id !== id));
  };

  // --- Backup ---
  const exportToClipboard = () => {
    const data = { potions, closeHints, nothingTried, inFlask };
    navigator.clipboard.writeText(JSON.stringify(data));
    alert("Backup copied to clipboard!");
  };
  const importFromClipboard = async () => {
    const text = await navigator.clipboard.readText();
    try {
      const parsed = JSON.parse(text);
      setPotions(parsed.potions || []);
      setCloseHints(parsed.closeHints || []);
      setNothingTried(parsed.nothingTried || []);
      setInFlask(parsed.inFlask || []);
      alert("Backup imported!");

      // recompute remaining
      let newRemaining = generateAllCombos(metals, organs, herbs);
      parsed.potions?.forEach((p: Potion) => {
        newRemaining = newRemaining.filter(
          (c) =>
            !(c.metal === p.combo.metal && c.organ === p.combo.organ && c.herb === p.combo.herb)
        );
      });
      parsed.nothingTried?.forEach((n: NothingTried) => {
        newRemaining = newRemaining.filter((c) => countMatches(c, n.combo) < 2);
      });
      parsed.closeHints?.forEach((c: CloseHint) => {
        newRemaining = newRemaining.filter(
          (combo) =>
            !(combo.metal === c.combo.metal &&
              combo.organ === c.combo.organ &&
              combo.herb === c.combo.herb)
        );
      });
      setRemaining(newRemaining);
    } catch {
      alert("Invalid backup data!");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Potion Research Helper</h1>

      {/* Dropdowns */}
      <div>
        <label>Metal: </label>
        <select value={metal} onChange={(e) => setMetal(e.target.value)}>
          <option value="">-- select metal --</option>
          {metals.map((m) => (
            <option
              key={m}
              value={m}
              disabled={
                (organ && herb && !isComboRemaining(m, organ, herb)) ||
                isPotionFound(m, organ || "", herb || "") ||
                isInFlask(m, organ || "", herb || "")
              }
            >
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Organ: </label>
        <select value={organ} onChange={(e) => setOrgan(e.target.value)}>
          <option value="">-- select organ --</option>
          {organs.map((o: string) => (
            <option
              key={o}
              value={o}
              disabled={
                (metal && herb && !isComboRemaining(metal, o, herb)) ||
                isPotionFound(metal || "", o, herb || "") ||
                isInFlask(metal || "", o, herb || "")
              }
            >
              {o}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Herb: </label>
        <select value={herb} onChange={(e) => setHerb(e.target.value)}>
          <option value="">-- select herb --</option>
          {herbs.map((h: string) => (
            <option
              key={h}
              value={h}
              disabled={
                (metal && organ && !isComboRemaining(metal, organ, h)) ||
                isPotionFound(metal || "", organ || "", h) ||
                isInFlask(metal || "", organ || "", h)
              }
            >
              {h}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => saveResult("potion", prompt("Enter potion name:") || undefined)}>
          Found Potion
        </button>
        <button
          onClick={() =>
            saveResult("close", prompt("Enter potion name for close hint:") || undefined)
          }
          style={{ marginLeft: "1rem" }}
        >
          Close
        </button>
        <button onClick={() => saveResult("nothing")} style={{ marginLeft: "1rem" }}>
          Nothing
        </button>
        <button onClick={saveInFlask} style={{ marginLeft: "1rem" }}>
          In Flask
        </button>
      </div>

      {/* Backup */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={exportToClipboard}>Export to Clipboard</button>
        <button onClick={importFromClipboard} style={{ marginLeft: "1rem" }}>
          Import from Clipboard
        </button>
      </div>

      <h2>{message}</h2>

      {/* Lists */}
      <h3>Found Potions</h3>
      <ul>
        {potions.map((p) => (
          <li key={p.id}>
            {p.combo.metal} + {p.combo.organ} + {p.combo.herb} → <strong>{p.name}</strong>{" "}
            <button onClick={() => deletePotion(p.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Close Hints</h3>
      <ul>
        {closeHints.map((c) => (
          <li key={c.id}>
            {c.combo.metal} + {c.combo.organ} + {c.combo.herb} (near <strong>{c.name}</strong>){" "}
            <button onClick={() => deleteCloseHint(c.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Nothing Tried</h3>
      <ul>
        {nothingTried.map((n) => (
          <li key={n.id}>
            {n.combo.metal} + {n.combo.organ} + {n.combo.herb}{" "}
            <button onClick={() => deleteNothing(n.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>In Flask (not resolved)</h3>
      <ul>
        {inFlask.map((f) => (
          <li key={f.id}>
            {f.combo.metal} + {f.combo.organ} + {f.combo.herb}{" "}
            <button onClick={() => deleteInFlask(f.id)}>Delete</button>{" "}
            <button
              onClick={() => {
                deleteInFlask(f.id);
                saveResult("potion", prompt("Enter potion name:") || undefined, f.combo);
              }}
            >
              Mark as Potion
            </button>{" "}
            <button
              onClick={() => {
                deleteInFlask(f.id);
                saveResult("close", prompt("Enter potion name for close hint:") || undefined, f.combo);
              }}
            >
              Mark as Close
            </button>{" "}
            <button
              onClick={() => {
                deleteInFlask(f.id);
                saveResult("nothing", undefined, f.combo);
              }}
            >
              Mark as Nothing
            </button>
          </li>
        ))}
      </ul>


      <h3>Remaining Possible Recipes</h3>
      <p>{remaining.length} combinations left</p>
      <ul>
        {remaining.slice(0, 50).map((c, idx) => (
          <li key={idx}>
            {c.metal} + {c.organ} + {c.herb}
          </li>
        ))}
      </ul>
      {remaining.length > 50 && <p>…and more</p>}
      <div
        style={{
          color: 'white',
          background: 'darkBlue',
          padding: 2
        }}
      >
        version 0.1
      </div>
    </div>
  );
}

export default App;