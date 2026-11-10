
"use client";

import { useState } from "react";
import { browserDb } from "../lib/supabase";

type AnalysisResult = {
  title: string;
  summary: string;
  findings: string[];
  disclaimer: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);

  async function analyze() {
    setLoading(true);
    setError("");
    setResult(null);
    setLoginRequired(false);

    try {
      const db = browserDb();

      const {
        data: { session },
        error: sessionError,
      } = await db.auth.getSession();

      if (sessionError || !session?.access_token) {
        setLoginRequired(true);
        throw new Error(
          "Créez un compte gratuit ou connectez-vous pour analyser."
        );
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setLoginRequired(true);
        }


        throw new Error(data.error || "Erreur pendant l'analyse.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="pill">
          ◆ Protection et vigilance financière
        </div>

        <h1>
          Investissez avec prudence.
          <br />
          <em>Vérifiez avant de payer.</em>
        </h1>

        <p className="lead">
          AVERNYX vous aide à identifier les signaux
          d'alerte sur les liens suspects et tentatives de fraude bancaire.
          Une analyse préliminaire, sans promesse de
          sécurité absolue.
        </p>

        <a className="btn" href="#outil">
          Vérifier un site →
        </a>
      </section>

      <section id="outil">
        <div className="panel analyzer">
          <div className="eyebrow">
            Analyses gratuites avec compte
          </div>

          <h2 style={{ textAlign: "left", marginTop: 12 }}>
            Un lien vous semble suspect ?
          </h2>

          <div className="field">
            <input
              aria-label="Adresse du site"
              placeholder="https://exemple-plateforme.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              disabled={loading}
              onClick={analyze}
            >
              {loading ? "Analyse…" : "Analyser le lien"}
            </button>
          </div>

          <p className="muted">
            Connectez-vous pour utiliser les analyses
            gratuites. Ne communiquez jamais votre mot de
            passe, clé privée ou phrase de récupération.
            Nous n'ouvrons pas le site soumis et
            n'exécutons aucun code distant.
          </p>

          {error && (
            <div className="result">
              <p>{error}</p>

              {loginRequired && (
                <a className="btn" href="/login">
                  Se connecter gratuitement
                </a>
              )}
            </div>
          )}

          {result && (
            <div className="result">
              <h3>{result.title}</h3>
              <p>{result.summary}</p>

              <ul>
                {result.findings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>

              <p className="muted">
                {result.disclaimer}
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2>Comment ça fonctionne</h2>

        <div className="cards">
          <div className="panel">
            <h3>01. Soumettez</h3>
            <p>
              Collez l'URL d'une plateforme
              d'investissement.
            </p>
          </div>

          <div className="panel">
            <h3>02. Examinez</h3>
            <p>
              Consultez les signaux techniques élémentaires
              et les vérifications recommandées.
            </p>
          </div>

          <div className="panel">
            <h3>03. Décidez</h3>
            <p>
              Contrôlez les autorisations dans les registres
              officiels avant toute opération.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Détecter une tentative de fraude bancaire</h2>
        <div className="panel analyzer">
          <p>Un prétendu conseiller bancaire vous demande un virement, un code ou une validation urgente ?</p>
          <p>Analysez les signaux d'alerte dans le discours, sans communiquer de données confidentielles.</p>
          <a className="btn" href="/fraude-bancaire">Analyser un appel suspect →</a>
        </div>
      </section>
    </main>
  );
}
