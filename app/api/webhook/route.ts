import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe("sk_test_51Pn0ilLOisbgAxPdV0nmhbaSO6HEzZolhXxcM5oNE7hIr6i9jw1H4BYSsoWhAzOLlrXC3hWEP4WEU6O6yJpMIBCl00QeTxSf4i", {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');
  const endpointSecret = "whsec_Fv4smSUC4RwyLt8LdWCUCAhZpHnRHLPi";

  let event: Stripe.Event;

  try {
    // Vérification de la signature Stripe
    event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret);
  } catch (err: any) {
    console.error('⚠️ Erreur de vérification de la signature du webhook:', err.message);
    return NextResponse.json({ message: 'Webhook Error: Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const stripeCustomerId = session.customer as string;

        // Récupérer les informations de l'abonnement depuis la session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;

        let plan = 'Free';
        if (priceId === 'price_1Q6B8WLOisbgAxPdmARF5rcA') {
          plan = 'TaTaKae';
        } else if (priceId ===  'price_1Q6B9PLOisbgAxPduQ90xac0') {
          plan = 'Gold';
        } else if (priceId === 'price_1Q6B7oLOisbgAxPdlUDgYM5R') {
          plan = 'Konoha';
        }

        // Mise à jour de l'utilisateur dans la base de données
        const { error } = await supabase
          .from('CONTENT_CREATOR')
          .update({ plan_mensuel: plan, stripe_customer_id: stripeCustomerId })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error('Erreur lors de la mise à jour du plan utilisateur:', error);
          throw new Error('Erreur lors de la mise à jour');
        }

        console.log(`✅ Utilisateur mis à jour avec le plan ${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        const priceId = subscription.items.data[0]?.price?.id;

        let plan = 'Free';
        if (priceId === 'price_1Q6B8WLOisbgAxPdmARF5rcA') {
          plan = 'TaTaKae';
        } else if (priceId ===  'price_1Q6B9PLOisbgAxPduQ90xac0') {
          plan = 'Gold';
        } else if (priceId === 'price_1Q6B7oLOisbgAxPdlUDgYM5R') {
          plan = 'Konoha';
        }

        // Mise à jour du plan utilisateur
        const { error } = await supabase
          .from('CONTENT_CREATOR')
          .update({ plan_mensuel: plan })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
          throw new Error('Erreur lors de la mise à jour');
        }

        console.log(`✅ Abonnement mis à jour avec le plan ${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        // Réinitialisation au plan "Free"
        const { error } = await supabase
          .from('CONTENT_CREATOR')
          .update({ plan_mensuel: 'Free' })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error('Erreur lors de la résiliation:', error);
          throw new Error('Erreur lors de la résiliation');
        }

        console.log('✅ Abonnement annulé, utilisateur passé au plan Free');
        break;
      }

      default:
        console.log(`⚠️ Type d'événement non pris en charge: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Erreur lors du traitement de l\'événement:', err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
