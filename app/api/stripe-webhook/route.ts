
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: "Configuration Stripe manquante" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secret);
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Signature manquante" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      webhookSecret
    );
  } catch {
    return NextResponse.json(
      { error: "Signature invalide" },
      { status: 400 }
    );
  }

  // Les événements sont vérifiés, mais aucun abonnement
  // n'est encore activé dans Supabase.
  console.log("Événement Stripe reçu :", event.type);

  return NextResponse.json({ received: true });
}
