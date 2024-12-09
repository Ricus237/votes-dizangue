import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';


// Configuration Stripe
const stripe = new Stripe('sk_test_51Pn0ilLOisbgAxPdV0nmhbaSO6HEzZolhXxcM5oNE7hIr6i9jw1H4BYSsoWhAzOLlrXC3hWEP4WEU6O6yJpMIBCl00QeTxSf4i', {
  apiVersion: '2024-11-20.acacia',
});

// Fonction principale pour gérer les requêtes
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const endpointSecret = "whsec_69802bb5ed681dda6a3fcc29830ebc37755ef76b2cc78255ad211de996d41ecd";
  let event;

  try {
    // Lire et vérifier le corps de la requête
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Erreur de Webhook : ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  // Gérer les différents types d'événements Stripe
  switch (event.type) {
    case 'invoice.payment_failed': {
      const failedInvoice = event.data.object as Stripe.Invoice;
      const customerId = failedInvoice.customer as string;
      await updatePlanToFree(customerId);
      break;
    }

    case 'customer.subscription.deleted': {
      const deletedSubscription = event.data.object as Stripe.Subscription;
      const customerId = deletedSubscription.customer as string;
      await updatePlanToFree(customerId);
      break;
    }

    case 'invoice.payment_succeeded': {
      const succeededInvoice = event.data.object as Stripe.Invoice;
      const customerId = succeededInvoice.customer as string;
      const subscriptionId = succeededInvoice.subscription as string;
      await updatePlanToPremium(customerId, subscriptionId);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Mise à jour du plan au "Free" en cas de paiement échoué ou d'annulation
async function updatePlanToFree(customerId: string) {
  const { data, error } = await supabase
    .from('CONTENT_CREATOR')
    .select('id')
    .eq('stripe_session->>customer', customerId)
    .single();

  if (error) {
    console.error('Erreur Supabase:', error);
    return;
  }

  if (data) {
    const { id } = data;
    const { error: updateError } = await supabase
      .from('CONTENT_CREATOR')
      .update({ plan_mensuel: 'Free' })
      .eq('id', id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du plan:', updateError);
    }
  }
}

// Mise à jour du plan au "Premium" après paiement réussi
async function updatePlanToPremium(customerId: string, subscriptionId: string) {
  const { data, error } = await supabase
    .from('CONTENT_CREATOR')
    .select('id')
    .eq('stripe_session->>customer', customerId)
    .single();

  if (error) {
    console.error('Erreur Supabase:', error);
    return;
  }

  if (data) {
    const { id } = data;
    const { error: updateError } = await supabase
      .from('CONTENT_CREATOR')
      .update({ plan_mensuel: 'Premium', stripe_session: { subscription: subscriptionId } })
      .eq('id', id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du plan:', updateError);
    }
  }
}
