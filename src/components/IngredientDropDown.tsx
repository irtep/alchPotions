import React from "react";
import type {  CloseHint, NothingTried, Potion, InFlask } from "../App"; // adjust import if needed
import { getColor } from "../functions/helpFunctions";

type IngredientDropdownProps = {
  type: "metal" | "organ" | "herb";
  options: string[];
  value: string;
  setValue: (val: string) => void;
  selectedMetal?: string;
  selectedOrgan?: string;
  selectedHerb?: string;
  closeHints: CloseHint[];
  nothingTried: NothingTried[];
  potions: Potion[];
  inFlask: InFlask[];
  isComboRemaining: (metal?: string, organ?: string, herb?: string) => boolean;
};

const IngredientDropdown: React.FC<IngredientDropdownProps> = ({
  type,
  options,
  value,
  setValue,
  selectedMetal,
  selectedOrgan,
  selectedHerb,
  closeHints,
  nothingTried,
  potions,
  inFlask,
  isComboRemaining
}) => {
  const normalize = (s?: string) => (s || "").toLowerCase().trim();

  const isPotionFound = (metal: string, organ: string, herb: string) =>
    potions.some((p) => p.combo.metal === metal && p.combo.organ === organ && p.combo.herb === herb);
  const isInFlask = (metal: string, organ: string, herb: string) =>
    inFlask.some((f) => f.combo.metal === metal && f.combo.organ === organ && f.combo.herb === herb);

  return (
    <div>
      <label>{type.charAt(0).toUpperCase() + type.slice(1)}: </label>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="">-- select {type} --</option>
        {options.map((opt, i) => {
          // --- Check isClose ---
          let isClose = false;
          if (type === "metal") {
            isClose =
              !!(
                (selectedOrgan &&
                  closeHints.some(
                    (c) => normalize(c.combo.organ) === normalize(selectedOrgan) && normalize(c.combo.metal) === normalize(opt)
                  )) ||
                (selectedHerb &&
                  closeHints.some(
                    (c) => normalize(c.combo.herb) === normalize(selectedHerb) && normalize(c.combo.metal) === normalize(opt)
                  ))
              );
          } else if (type === "herb") {
            isClose =
              !!(
                selectedOrgan &&
                closeHints.some(
                  (c) => normalize(c.combo.organ) === normalize(selectedOrgan) && normalize(c.combo.herb) === normalize(opt)
                )
              );
          } else if (type === "organ") {
            isClose =
              !!(
                selectedMetal &&
                closeHints.some(
                  (c) => normalize(c.combo.metal) === normalize(selectedMetal) && normalize(c.combo.organ) === normalize(opt)
                )
              );
          }

          // --- Check isDisabled ---
          let isDisabled = false;
          if (type === "metal") {
            isDisabled =
              (selectedOrgan && selectedHerb && !isComboRemaining(opt, selectedOrgan, selectedHerb)) ||
              (selectedOrgan &&
                nothingTried.some((n) => normalize(n.combo.metal) === normalize(opt) && normalize(n.combo.organ) === normalize(selectedOrgan))) ||
              (selectedHerb &&
                nothingTried.some((n) => normalize(n.combo.metal) === normalize(opt) && normalize(n.combo.herb) === normalize(selectedHerb))) ||
              isPotionFound(opt, selectedOrgan || "", selectedHerb || "") ||
              isInFlask(opt, selectedOrgan || "", selectedHerb || "");
          } else if (type === "organ") {
            isDisabled =
              (selectedMetal && selectedHerb && !isComboRemaining(selectedMetal, opt, selectedHerb)) ||
              isPotionFound(selectedMetal || "", opt, selectedHerb || "") ||
              isInFlask(selectedMetal || "", opt, selectedHerb || "");
          } else if (type === "herb") {
            isDisabled =
              (selectedMetal && selectedOrgan && !isComboRemaining(selectedMetal, selectedOrgan, opt)) ||
              (selectedMetal &&
                nothingTried.some((n) => normalize(n.combo.metal) === normalize(selectedMetal) && normalize(n.combo.herb) === normalize(opt))) ||
              (selectedOrgan &&
                nothingTried.some((n) => normalize(n.combo.organ) === normalize(selectedOrgan) && normalize(n.combo.herb) === normalize(opt))) ||
              isPotionFound(selectedMetal || "", selectedOrgan || "", opt) ||
              isInFlask(selectedMetal || "", selectedOrgan || "", opt);
          }

          return (
            <option
              key={opt}
              value={opt}
              disabled={isDisabled}
              style={{
                background: getColor(type, i),
                color: isClose ? "darkRed" : "black",
              }}
            >
              {opt}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default IngredientDropdown;
