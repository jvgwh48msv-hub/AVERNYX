import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const rules = [
  { pattern: /compte (?:securise|de securite|de secours)|compte refuge|mettre (?:votre|l.argent) a l.abri/i, label: "Transfert vers un prétendu compte sécurisé", weight: 3 },
  { pattern: /(?:faire|effectuer|valider|realiser|envoyer|autoriser).{0,35}(?:virement|transfert|paiement)|(?:virement|transfert).{0,30}(?:urgent|immediat)/i, label: "Demande de virement ou de paiement", weight: 2 },
  { pattern: /(?:code|otp|sms|mot de passe|identifiant|pin|cryptogramme|cvv)/i, label: "Demande potentielle de données d'authentification", weight: 3 },
  { pattern: /(?:valider|confirmer|accepter).{0,45}(?:notification|operation|application|transaction)/i, label: "Demande de validation d'une opération", weight: 3 },
  { pattern: /(?:installer|telecharger).{0,35}(?:application|logiciel|outil|anydesk|teamviewer)/i, label: "Demande d'installation d'un outil", weight: 2 },
  { pattern: /(?:urgence|urgent|immediatement|tout de suite|dans les cinq minutes|sans attendre)/i, label: "Pression temporelle", weight: 1 },
  { pattern: /(?:ne dites rien|gardez.*secret|ne contactez pas|ne raccrochez pas)/i, label: "Tentative d'isolement", weight: 2 },
];
function normalize(s: string) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return NextResponse.json({ error: "Configuration manquante." }, { status: 503 });
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const token = auth.slice(7);
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    const body = await req.json();
    if (typeof body?.description !== "string" || body.description.trim().length < 15 || body.description.length > 4000)
      return NextResponse.json({ error: "Décrivez la situation en 15 à 4 000 caractères, sans données personnelles." }, { status: 400 });
    const description = normalize(body.description);
    const hits = rules.filter(r => r.pattern.test(description));
    const score = hits.reduce((n, r) => n + r.weight, 0);
    const level = score >= 4 ? "Signaux préoccupants" : score > 0 ? "Vigilance recommandée" : "Analyse non concluante";
    return NextResponse.json({
      title: level,
      findings: hits.map(r => r.label),
      summary: hits.length ? "Certains éléments du récit correspondent à des techniques connues d'escroquerie." : "Aucun des signaux textuels recherchés n'a été repéré. Cela ne prouve pas que l'appel est authentique.",
      advice: "Ne transmettez aucun code et ne validez aucune opération demandée au téléphone. Raccrochez et contactez votre banque via son application officielle ou un numéro trouvé indépendamment. Si vous avez déjà agi, contactez immédiatement votre banque.",
      disclaimer: "Analyse indicative fondée sur des règles textuelles. Elle ne vérifie ni l'identité de l'appelant ni la réalité d'une fraude. Ne saisissez pas de noms, numéros de compte, mots de passe ou codes.",
    });
  } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
}
