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

    if (response.isTransactionSuccess() && response.isOperationSuccess()) {
      // Récupérer le nombre actuel de likes pour le nominee
      const { data, error: fetchError } = await supabase
        .from('votes')
        .select('likes')
        .eq('id', nominee)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération des likes:', fetchError);
        return new Response(JSON.stringify({ success: false, message: "Erreur lors de la récupération des données." }), { status: 500 });
      }

      let likesToAdd = 0;

      // Déterminer le nombre de likes à ajouter en fonction du montant
      switch (amount) {
        case 155:
          likesToAdd = 1;
          break;
        case 310:
          likesToAdd = 2;
          break;
        case 775:
          likesToAdd = 5;
          break;
        case 1550:
          likesToAdd = 10;
          break;
        case 3100:
          likesToAdd = 20;
          break;
        case 4650:
          likesToAdd = 30;
          break;
        case 7750:
          likesToAdd = 50;
          break;
        case 15500:
          likesToAdd = 100;
          break;
        default:
          console.error('Montant non reconnu:', amount);
          return new Response(JSON.stringify({ success: false, message: "Montant non valide." }), { status: 400 });
      }

      const newLikes = (data.likes || 0) + likesToAdd;

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