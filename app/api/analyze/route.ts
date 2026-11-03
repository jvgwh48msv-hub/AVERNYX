
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Configuration Supabase manquante." },
        { status: 503 }
      );
    }

    // Vérifier que l'utilisateur est connecté
    const header = req.headers.get("authorization") || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : "";

    if (!token) {
      return NextResponse.json(
        { error: "Connectez-vous pour analyser un site." },
        { status: 401 }
      );
    }

    const db = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: authData, error: authError } =
      await db.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Session invalide. Reconnectez-vous." },
        { status: 401 }
      );
    }

    // Vérifier l'adresse du site
    const body = await req.json();
    const url = body?.url;

    if (
      typeof url !== "string" ||
      url.length === 0 ||
      url.length > 2048
    ) {
      return NextResponse.json(
        { error: "URL invalide." },
        { status: 400 }
      );
    }

    let u: URL;

    try {
      u = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Entrez une URL complète." },
        { status: 400 }
      );
    }

    if (
      !["http:", "https:"].includes(u.protocol) ||
      !u.hostname.includes(".")
    ) {
      return NextResponse.json(
        { error: "URL web invalide." },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur est Premium
    const { data: subscription, error: subscriptionError } =
      await db
        .from("subscriptions")
        .select("status")
        .eq("user_id", authData.user.id)
        .maybeSingle();

    if (subscriptionError) {
      return NextResponse.json(
        { error: "Impossible de vérifier l'abonnement." },
        { status: 503 }
      );
    }

    const isPremium = ["active", "trialing"].includes(
      subscription?.status || ""
    );

    // Limiter les comptes gratuits à 2 analyses
    if (!isPremium) {
      const { data: allowed, error: usageError } =
        await db.rpc("consume_free_analysis", {
          p_user_id: authData.user.id,
        });

      if (usageError) {
        return NextResponse.json(
          { error: "Impossible de vérifier le quota gratuit." },
          { status: 503 }
        );
      }

      if (!allowed) {
        return NextResponse.json(
          {
            error:
              "Vos 2 analyses gratuites sont utilisées. Passez à Premium pour continuer.",
            premiumRequired: true,
          },
          { status: 403 }
        );
      }
    }

    // Analyse préliminaire du lien
    const host = u.hostname.toLowerCase();
    const findings: string[] = [];

    if (u.protocol !== "https:") {
      findings.push(
        "Le lien ne commence pas par HTTPS."
      );
    }

    if (host.includes("xn--")) {
      findings.push(
        "Le domaine utilise un encodage internationalisé : vérifiez les caractères similaires."
      );
    }

    if (/^[0-9]{1,3}([.][0-9]{1,3}){3}$/.test(host)) {
      findings.push(
        "L'adresse utilise une adresse IP plutôt qu'un nom de domaine."
      );
    }

    if (host.split(".").length > 4) {
      findings.push(
        "Le nom de domaine comporte de nombreux sous-domaines."
      );
    }

    if (u.username || u.password) {
      findings.push(
        "Le lien contient des informations avant le nom de domaine pouvant masquer sa destination."
      );
    }

    findings.push(
      "Vérifiez l'entité et son autorisation auprès de l'AMF, REGAFI ou ORIAS selon l'activité."
    );

    findings.push(
      "Méfiez-vous des promesses de rendement garanti et des demandes de transfert vers un portefeuille personnel."
    );

    return NextResponse.json({
      title: "Contrôle préliminaire terminé",
      summary:
        `Domaine examiné : ${host}. ` +
        "Ce contrôle examine uniquement la forme du lien. " +
        "Il ne vérifie ni l'identité de l'opérateur, " +
        "ni sa solvabilité, ni les registres officiels.",
      findings,
      disclaimer:
        "Absence de signal détecté ≠ plateforme sûre. " +
        "Ce résultat ne constitue ni une certification, " +
        "ni un conseil en investissement.",
    });
  } catch {
    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 }
    );
  }
}
