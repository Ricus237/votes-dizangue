import { PaymentOperation } from '@hachther/mesomb';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(req) {
  const { phoneNumber, amount, service, nominee } = await req.json();

  // Remplacez par vos clés API MeSomb
  const applicationKey = '9e8107f693039e6f5cc2d87afdd777a0295a7bc3';
  const accessKey = '446976b3-ab50-4636-a9d0-613d6b36724e';
  const secretKey = 'e3fdca54-f53f-4718-b3f6-5445bc836fe8';

  const payment = new PaymentOperation({
    applicationKey,
    accessKey,
    secretKey,
  });

  try {

    // Transaction de collecte
    const response = await payment.makeCollect({
      amount,
      service,
      payer: phoneNumber,
      nonce: Math.random().toString(36).substr(2, 9), // Génère un nonce
    });
 // Enregistrer la transaction dans la table 'transactions'
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          nominee_id: nominee,
          phone_number: phoneNumber,
          amount,
        });

      if (transactionError) {
        console.error('Erreur lors de l\'enregistrement de la transaction:', transactionError);
        return new Response(JSON.stringify({ success: false, message: "Erreur lors de l'enregistrement de la transaction." }), { status: 500 });
      }
    if (response.isTransactionSuccess() && response.isOperationSuccess()) {
      // Récupérer le nombre actuel de likes pour le nominé
      const { data, error: fetchError } = await supabase
        .from('votes')
        .select('likes')
        .eq('id', nominee)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération des likes:', fetchError);
        return new Response(JSON.stringify({ success: false, message: "Erreur lors de la récupération des données." }), { status: 500 });
      }

      const newLikes = (data.likes || 0) + 1;

      // Mettre à jour la colonne 'likes' dans la table 'votes'
      const { error: updateError } = await supabase
        .from('votes')
        .update({ likes: newLikes })
        .eq('id', nominee);

      if (updateError) {
        console.error('Erreur Supabase:', updateError);
        return new Response(JSON.stringify({ success: false, message: "Erreur lors de la mise à jour de Supabase." }), { status: 500 });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, message: 'La transaction a échoué.' }), { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors du paiement:', error);
    return new Response(JSON.stringify({ success: false, message: "Une erreur s'est produite lors du traitement de la transaction." }), { status: 500 });
  }
}