/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialisation de Stripe
const stripe = new Stripe("sk_test_51Pn0ilLOisbgAxPdV0nmhbaSO6HEzZolhXxcM5oNE7hIr6i9jw1H4BYSsoWhAzOLlrXC3hWEP4WEU6O6yJpMIBCl00QeTxSf4i", {
  apiVersion: '2024-11-20.acacia',
});

// Secret du webhook
const endpointSecret = "whsec_Fv4smSUC4RwyLt8LdWCUCAhZpHnRHLPi";

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    // Vérification de la signature Stripe
    event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return NextResponse.json({ message: 'Webhook Error: Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id; // ID local de l'utilisateur
        const stripeCustomerId = session.customer as string;

        // Vérifiez si l'utilisateur existe dans la base de données
        const { data: user, error: userError } = await supabase
          .from('CONTENT_CREATOR')
          .select('stripe_customer_id')
          .eq('id', "41080a91-8e8b-4cc2-9004-64d88505ef02")
          .single();

        if (userError || !user) {
          console.error('Utilisateur introuvable:', userError);
          throw new Error('Utilisateur introuvable ou problème lors de la vérification');
        }

        // Si l'ID Stripe est différent ou absent, mettez-le à jour
        if (!user.stripe_customer_id || user.stripe_customer_id !== stripeCustomerId) {
          const { error } = await supabase
            .from('CONTENT_CREATOR')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('id', userId);

          if (error) {
            console.error('Erreur lors de la mise à jour de l\'ID client Stripe:', error);
            throw new Error('Erreur lors de la mise à jour de l\'ID client Stripe');
          }
        }

        // Déterminez le plan d'abonnement à partir des line items
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const amount_total = lineItems.data[0].amount_total;

        let plan = 'Free'; // Plan par défaut

        if (amount_total === 9900) {
          plan = 'TaTaKae';
        } else if (amount_total ===  24900) {
          plan = 'Gold';
        } else if (amount_total === 1900) {
          plan = 'Konoha';
        }

        // Mettez à jour le plan d'abonnement dans la base de données
        const { error: planError } = await supabase
          .from('CONTENT_CREATOR')
          .update({ plan_mensuel: plan })
          .eq('id', userId);

        if (planError) {
          console.error('Erreur lors de la mise à jour du plan utilisateur:', planError);
          throw new Error('Erreur lors de la mise à jour du plan utilisateur');
        }

        console.log(`✅ Utilisateur mis à jour avec le plan ${plan}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = invoice.customer as string;

        // Vérifiez si l'utilisateur existe dans la base de données
        const { data: user, error: userError } = await supabase
          .from('CONTENT_CREATOR')
          .select('*')
          .eq('stripe_customer_id', stripeCustomerId)
          .single();

        if (userError || !user) {
          console.error('Utilisateur introuvable pour invoice.payment_succeeded:', userError);
          throw new Error('Utilisateur introuvable pour invoice.payment_succeeded');
        }

        // Récupérer le plan actuel associé à la facture
        let plan = user.plan_mensuel; // Conserver le plan actuel par défaut

        const amount_total = invoice.lines.data[0].amount;


        if (amount_total === 9900) {
          plan = 'TaTaKae';
        } else if (amount_total ===  24900) {
          plan = 'Gold';
        } else if (amount_total === 1900) {
          plan = 'Konoha';
        }
        // Mettez à jour le plan utilisateur uniquement si nécessaire
        if (user.plan_mensuel !== plan) {
          const { error } = await supabase
            .from('CONTENT_CREATOR')
            .update({ plan_mensuel: plan })
            .eq('stripe_customer_id', stripeCustomerId);

          if (error) {
            console.error('Erreur lors de la mise à jour du plan utilisateur:', error);
            throw new Error('Erreur lors de la mise à jour du plan utilisateur');
          }

          console.log(`✅ Plan utilisateur mis à jour à ${plan}`);
        }

        console.log(`✅ Paiement réussi pour l'utilisateur ${user.id} avec le plan ${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        // Réinitialisez le plan d'abonnement à "Free" en cas de résiliation
        const { error } = await supabase
          .from('CONTENT_CREATOR')
          .update({ plan_mensuel: 'Free' })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error('Erreur lors de la réinitialisation du plan utilisateur:', error);
          throw new Error('Erreur lors de la réinitialisation du plan utilisateur');
        }

        console.log(`✅ Plan utilisateur réinitialisé à "Free"`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Erreur lors du traitement de l\'événement:', err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
