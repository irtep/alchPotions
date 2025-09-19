import { useState, useEffect } from "react";
import { metals } from "./data/metals";
import { organs } from "./data/organs";
import { herbs } from "./data/herbs";
import { v4 as uuidv4 } from "uuid";
import { countMatches, generateAllCombos, getColor } from "./functions/helpFunctions";
import OrganMatrix from "./components/OrganMatrix";
import IngredientDropdown from "./components/IngredientDropDown";

export type Combo = { metal: string; organ: string; herb: string };
export type Potion = { id: string; combo: Combo; name: string };
export type CloseHint = { id: string; combo: Combo; name: string };
export type NothingTried = { id: string; combo: Combo };
export type InFlask = { id: string; combo: Combo };

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
    (c) => !(c.metal === p.combo.metal && c.organ === p.combo.organ && c.herb === p.combo.herb)
  );
});
initialNothing.forEach((n) => {
  initialRemaining = initialRemaining.filter((c) => countMatches(c, n.combo) < 2);
});
initialCloseHints.forEach((c) => {
  initialRemaining = initialRemaining.filter(
    (combo) => !(combo.metal === c.combo.metal && combo.organ === c.combo.organ && combo.herb === c.combo.herb)
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
        prev.filter((c) => !(c.metal === combo.metal && c.organ === combo.organ && c.herb === combo.herb))
      );
      setMessage(`✅ Found potion: ${p.name}`);
    } else if (result === "close") {
      if (!potionName) return alert("Enter potion name for close hint!");
      const c: CloseHint = { id: uuidv4(), combo, name: potionName };
      setCloseHints((prev) => [...prev, c]);
      setRemaining((prev) =>
        prev.filter((r) => !(r.metal === combo.metal && r.organ === combo.organ && r.herb === combo.herb))
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
  const deleteCloseHint = (id: string) => setCloseHints((prev) => prev.filter((c) => c.id !== id));
  const deleteNothing = (id: string) => {
    setNothingTried((prev) => prev.filter((n) => n.id !== id));
    // recompute full remaining
    let newRemaining = generateAllCombos(metals, organs, herbs);
    potions.forEach((p) => {
      newRemaining = newRemaining.filter((c) => !(c.metal === p.combo.metal && c.organ === p.combo.organ && c.herb === p.combo.herb));
    });
    nothingTried.filter((n) => n.id !== id).forEach((n) => {
      newRemaining = newRemaining.filter((c) => countMatches(c, n.combo) < 2);
    });
    closeHints.forEach((c) => {
      newRemaining = newRemaining.filter((combo) => !(combo.metal === c.combo.metal && combo.organ === c.combo.organ && combo.herb === c.combo.herb));
    });
    setRemaining(newRemaining);
  };
  const deleteInFlask = (id: string) => setInFlask((prev) => prev.filter((f) => f.id !== id));

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
        newRemaining = newRemaining.filter((c) => !(c.metal === p.combo.metal && c.organ === p.combo.organ && c.herb === p.combo.herb));
      });
      parsed.nothingTried?.forEach((n: NothingTried) => {
        newRemaining = newRemaining.filter((c) => countMatches(c, n.combo) < 2);
      });
      parsed.closeHints?.forEach((c: CloseHint) => {
        newRemaining = newRemaining.filter((combo) => !(combo.metal === c.combo.metal && combo.organ === c.combo.organ && combo.herb === c.combo.herb));
      });
      setRemaining(newRemaining);
    } catch {
      alert("Invalid backup data!");
    }
  };

  // --- Helpers ---
  const isComboRemaining = (m?: string, o?: string, h?: string) =>
    remaining.some((c) => (!m || c.metal === m) && (!o || c.organ === o) && (!h || c.herb === h));
  /*
  const isPotionFound = (m: string, o: string, h: string) =>
    potions.some((p) => p.combo.metal === m && p.combo.organ === o && p.combo.herb === h);
  const isInFlask = (m: string, o: string, h: string) =>
    inFlask.some((f) => f.combo.metal === m && f.combo.organ === o && f.combo.herb === h);
*/
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Potion Research Helper</h1>

      {/* Dropdowns */}
      <IngredientDropdown
        type="metal"
        options={metals}
        value={metal}
        setValue={setMetal}
        selectedOrgan={organ}
        selectedHerb={herb}
        closeHints={closeHints}
        nothingTried={nothingTried}
        potions={potions}
        inFlask={inFlask}
        isComboRemaining={isComboRemaining}
      />

      <IngredientDropdown
        type="organ"
        options={organs}
        value={organ}
        setValue={setOrgan}
        selectedMetal={metal}
        selectedHerb={herb}
        closeHints={closeHints}
        nothingTried={nothingTried}
        potions={potions}
        inFlask={inFlask}
        isComboRemaining={isComboRemaining}
      />

      <IngredientDropdown
        type="herb"
        options={herbs}
        value={herb}
        setValue={setHerb}
        selectedMetal={metal}
        selectedOrgan={organ}
        closeHints={closeHints}
        nothingTried={nothingTried}
        potions={potions}
        inFlask={inFlask}
        isComboRemaining={isComboRemaining}
      />

      {/* Buttons */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => saveResult("potion", prompt("Enter potion name:") || undefined)}>Found Potion</button>
        <button onClick={() => saveResult("close", prompt("Enter potion name for close hint:") || undefined)} style={{ marginLeft: "1rem" }}>
          Close
        </button>
        <button onClick={() => saveResult("nothing")} style={{ marginLeft: "1rem" }}>Nothing</button>
        <button onClick={saveInFlask} style={{ marginLeft: "1rem" }}>In Flask</button>
      </div>

      {/* Backup */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={exportToClipboard} style={{ background: 'green' }}>Export to Clipboard</button>
        <button onClick={importFromClipboard} style={{ marginLeft: "1rem", background: 'darkRed', color: 'white' }}>Import from Clipboard (careful!))</button>
      </div>

      <h2>{message}</h2>

      {/* Lists */}
      <h3>Found Potions</h3>
      <ul>
        {potions.map((p) => (
          <li key={p.id}>
            <span style={{ background: getColor("metal", metals.indexOf(p.combo.metal)), padding: "2px 6px", borderRadius: 4 }}>{p.combo.metal}</span> +{" "}
            <span style={{ background: getColor("organ", organs.indexOf(p.combo.organ)), padding: "2px 6px", borderRadius: 4 }}>{p.combo.organ}</span> +{" "}
            <span style={{ background: getColor("herb", herbs.indexOf(p.combo.herb)), padding: "2px 6px", borderRadius: 4 }}>{p.combo.herb}</span> →{" "}
            <strong>{p.name}</strong>{" "}
            <button style={{ background: 'red' }} onClick={() => deletePotion(p.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Close Hints</h3>
      <ul>
        {closeHints.map((c) => (
          <li key={c.id}>
            <span style={{ background: getColor("metal", metals.indexOf(c.combo.metal)), padding: "2px 6px", borderRadius: 4 }}>{c.combo.metal}</span> +{" "}
            <span style={{ background: getColor("organ", organs.indexOf(c.combo.organ)), padding: "2px 6px", borderRadius: 4 }}>{c.combo.organ}</span> +{" "}
            <span style={{ background: getColor("herb", herbs.indexOf(c.combo.herb)), padding: "2px 6px", borderRadius: 4 }}>{c.combo.herb}</span> (near <strong>{c.name}</strong>){" "}
            <button style={{ background: 'red' }} onClick={() => deleteCloseHint(c.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Nothing</h3>
      <ul>
        {nothingTried.map((n) => (
          <li key={n.id}>
            <span style={{ background: getColor("metal", metals.indexOf(n.combo.metal)), padding: "2px 6px", borderRadius: 4 }}>{n.combo.metal}</span> +{" "}
            <span style={{ background: getColor("organ", organs.indexOf(n.combo.organ)), padding: "2px 6px", borderRadius: 4 }}>{n.combo.organ}</span> +{" "}
            <span style={{ background: getColor("herb", herbs.indexOf(n.combo.herb)), padding: "2px 6px", borderRadius: 4 }}>{n.combo.herb}</span>{" "}
            <button style={{ background: 'red' }} onClick={() => deleteNothing(n.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>{`In Flask (not resolved) ${inFlask.length}`}</h3>
      <ul>
        {inFlask.map((f) => (
          <li key={f.id}>
            <span style={{ background: getColor("metal", metals.indexOf(f.combo.metal)), padding: "2px 6px", borderRadius: 4 }}>{f.combo.metal}</span> +{" "}
            <span style={{ background: getColor("organ", organs.indexOf(f.combo.organ)), padding: "2px 6px", borderRadius: 4 }}>{f.combo.organ}</span> +{" "}
            <span style={{ background: getColor("herb", herbs.indexOf(f.combo.herb)), padding: "2px 6px", borderRadius: 4 }}>{f.combo.herb}</span>{" "}
            <button style={{ background: 'red' }} onClick={() => deleteInFlask(f.id)}>Delete</button>{" "}
            <button onClick={() => { deleteInFlask(f.id); saveResult("potion", prompt("Enter potion name:") || undefined, f.combo); }}>Mark Potion</button>{" "}
            <button onClick={() => { deleteInFlask(f.id); saveResult("close", prompt("Enter potion name for close hint:") || undefined, f.combo); }}>Mark Close</button>{" "}
            <button onClick={() => { deleteInFlask(f.id); saveResult("nothing", undefined, f.combo); }}>Mark Nothing</button>
          </li>
        ))}
      </ul>

      <h3>Remaining possible combos: {remaining.length}</h3>

      <OrganMatrix
        organ={organ}
        potions={potions}
        closeHints={closeHints}
        nothingTried={nothingTried}
        inFlask={inFlask}
      />

      <div
        style={{
          color: 'white',
          background: 'darkBlue'
        }}
      >
        0.3.1
      </div>
    </div>
  );
}

export default App;
