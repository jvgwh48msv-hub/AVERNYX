
"use client";

import { useState } from "react";

export default function TradeRiskPage() {
  const [capital, setCapital] = useState("1000");
  const [entry, setEntry] = useState("100");
  const [stop, setStop] = useState("95");
  const [target, setTarget] = useState("115");
  const [quantity, setQuantity] = useState("4");

  const c = Number(capital);
  const e = Number(entry);
  const s = Number(stop);
  const t = Number(target);
  const q = Number(quantity);

  const valid =
    [capital, entry, stop, target, quantity].every(
      (v) => v.trim() !== "" && Number.isFinite(Number(v)) && Number(v) > 0
    ) && s < e && t > e;

  const loss = valid ? (e - s) * q : 0;
  const gain = valid ? (t - e) * q : 0;
  const risk = valid ? (loss / c) * 100 : 0;
  const ratio = valid ? gain / loss : 0;

  const field = (label: string, value: string, setter: (v: string) => void) => (
    <label style={{ display: "grid", gap: 8 }}>
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(ev) => setter(ev.target.value)}
        style={{
          padding: 14,
          borderRadius: 10,
          background: "#101b32",
          border: "1px solid #334769",
          color: "white",
          width: "100%"
        }}
      />
    </label>
  );

  return (
    <main style={{
      maxWidth: 850, margin: "60px auto", padding: 24,
      color: "#edf3ff", fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: 42, marginBottom: 10 }}>
        AVERNYX <span style={{ color: "#77aaff" }}>Trade Risk</span>
      </h1>
      <p>Analyse le risque théorique de ton ordre avant de trader.</p>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 20, marginTop: 35
      }}>
        {field("Capital (€)", capital, setCapital)}
        {field("Quantité d'unités", quantity, setQuantity)}
        {field("Prix d'entrée (€)", entry, setEntry)}
        {field("Stop-loss (€)", stop, setStop)}
        {field("Take-profit (€)", target, setTarget)}
      </section>

      {valid ? (
        <section style={{
          background: "#101b32", border: "1px solid #334769",
          borderRadius: 16, padding: 25, marginTop: 30
        }}>
          <h2>Résultat de l'analyse</h2>
          <p>Perte théorique au stop : {loss.toFixed(2)} €</p>
          <p>Gain théorique à l'objectif : {gain.toFixed(2)} €</p>
          <p>Capital risqué : {risk.toFixed(2)} %</p>
          <p>Ratio gain/risque : {ratio.toFixed(2)} : 1</p>
          <h3 style={{
            color: risk > 2 ? "#ff9999" : "#80cbaa"
          }}>
            {risk > 5
              ? "Risque très élevé"
              : risk > 2
              ? "Risque élevé"
              : "Risque inférieur au seuil indicatif de 2 %"}
          </h3>
          <p style={{ fontSize: 13, color: "#a9bad6" }}>
            Simulation pour un achat au comptant, sans frais ni levier.
            Le stop-loss ne garantit pas une perte maximale.
            Ceci n'est pas un conseil en investissement.
          </p>
        </section>
      ) : (
        <p style={{ color: "#ff9999", marginTop: 25 }}>
          Vérifie les valeurs : le stop doit être inférieur à l'entrée
          et l'objectif supérieur à l'entrée.
        </p>
      )}
    </main>
  );
}
