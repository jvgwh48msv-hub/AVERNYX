# AVERNYX — starter commercial (non prêt à encaisser)

## Windows (PowerShell)
1. Installer Node.js LTS depuis https://nodejs.org
2. Extraire ce dossier, ouvrir PowerShell dedans.
3. `npm install`
4. `Copy-Item .env.example .env.local`
5. Renseigner les clés Supabase publiques dans `.env.local`.
6. `npm run dev` puis ouvrir http://localhost:3000

## Supabase
- Créer un projet sur https://supabase.com/dashboard.
- Project Settings > API : copier l'URL du projet et la clé publique anon/publishable.
- Authentication > Providers : activer Email.
- Authentication > URL Configuration : ajouter `http://localhost:3000` comme URL locale et URL de redirection.
- SQL Editor : exécuter `supabase/schema.sql`.
- Ne JAMAIS exposer la service role key dans un composant client, dans Git ou dans une capture.
- Avant production : configurer le domaine public, les redirects, l'e-mail SMTP et les protections contre les abus.

## Stripe
- Créer un compte Stripe : https://dashboard.stripe.com.
- Configurer les produits/prix et le mode test.
- Les boutons payants sont volontairement désactivés : aucune commande n'est facturée.
- Pour les activer plus tard, développer une route checkout authentifiée avec prix imposés côté serveur, webhook signé, enregistrement idempotent des paiements et attribution des droits après confirmation.
- Tester les annulations, remboursements, échecs et renouvellements d'abonnement.
- Ne jamais activer ENABLE_PAID_CHECKOUT : le backend actuel n'implémente pas de paiement.

## Limitations et conformité
- L'analyse gratuite ne consulte aucun registre, n'exécute aucune IA et n'effectue aucune requête vers l'URL soumise. Elle examine seulement sa forme.
- Le système ne détecte pas réellement les escroqueries et ne certifie aucun acteur.
- Pour commercialiser : CGV, mentions légales, politique de confidentialité, politique de conservation, droits RGPD, gestion des réclamations, médiation consommation si applicable, tests de sécurité, preuve de livraison et contrôle qualité des rapports.
- Faire valider les promesses commerciales et l'éventuelle qualification réglementaire par un professionnel du droit.
- Avant toute collecte réelle, appliquer une limitation de débit, protection anti-abus et gestion des secrets.
