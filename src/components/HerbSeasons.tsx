import React, { useState } from "react";
import { allHerbs } from "../data/herbs";

export type Seasons = {
  name: string;
  season1: string;
  season2: string;
};

const allSeasons = ["spring", "summer", "autumn", "winter", "all"];

const HerbSeasons: React.FC = () => {
  const [selectedHerb, setSelectedHerb] = useState<string | "">("");
  const [selectedSeason, setSelectedSeason] = useState<string | "">("");

  // Herbs grouped by season using Set to avoid duplicates
  const herbsBySeason: Record<string, Set<string>> = {};
  allSeasons.forEach((s) => (herbsBySeason[s] = new Set()));
  allHerbs.forEach((h) => {
    if (h.season1) herbsBySeason[h.season1.toLowerCase()]?.add(h.name);
    if (h.season2) herbsBySeason[h.season2.toLowerCase()]?.add(h.name);
  });

  // Convert Sets to arrays for rendering
  const herbsBySeasonArray: Record<string, string[]> = {};
  Object.entries(herbsBySeason).forEach(([season, set]) => {
    herbsBySeasonArray[season] = Array.from(set);
  });

  return (
    <div style={{ padding: "1rem", border: "1px solid gray", marginTop: "1rem" }}>
      <h3>Herb Seasons</h3>

      {/* Selection */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Select Herb:{" "}
          <select value={selectedHerb} onChange={(e) => { setSelectedHerb(e.target.value); setSelectedSeason(""); }}>
            <option value="">-- none --</option>
            {allHerbs.map((h) => (
              <option key={h.name} value={h.name}>{h.name}</option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Select Season:{" "}
          <select value={selectedSeason} onChange={(e) => { setSelectedSeason(e.target.value); setSelectedHerb(""); }}>
            <option value="">-- none --</option>
            {allSeasons.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Display */}
      <div>
        {selectedHerb && (
          <p>
            <strong>{selectedHerb}</strong> can be picked in:{" "}
            {allHerbs
              .filter((h) => h.name === selectedHerb)
              .map((h) => `${h.season1 || "unknown"}, ${h.season2 || "unknown"}`)
              .join(" | ")}
          </p>
        )}

        {selectedSeason && (
          <div>
            <strong>{selectedSeason} herbs:</strong>
            <ul>
              {herbsBySeasonArray[selectedSeason.toLowerCase()]?.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        {!selectedHerb && !selectedSeason && (
          <div>
            {allSeasons.map((s) => (
              <div key={s} style={{ marginBottom: "1rem" }}>
                <strong>{s}:</strong>
                <ul>
                  {herbsBySeasonArray[s]?.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HerbSeasons;
