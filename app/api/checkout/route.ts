import {NextResponse} from 'next/server';
import Stripe from 'stripe';
export async function POST(req:Request){if(process.env.ENABLE_PAID_CHECKOUT!=='true')return NextResponse.json({error:'Paiements désactivés : terminer la conformité, la livraison et les tests avant activation.'},{status:503});return NextResponse.json({error:'Checkout non activé : implémenter une authentification serveur, un catalogue Stripe et les droits d’accès avant de vendre.'},{status:501})}
