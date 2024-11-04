'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function PaymentForm() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [operator, setOperator] = useState<string>('');
  const [nominee, setNominee] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const op = searchParams.get('operator');
    if (op) {
      setOperator(op);
    }
    const user = searchParams.get('nominee');
    if (user) {
      setNominee(user);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsProcessing(true);

    if (phoneNumber.length !== 9 || !/^\d+$/.test(phoneNumber)) {
      setError('Le numéro de téléphone doit contenir exactement 9 chiffres.');
      setIsProcessing(false);
      return;
    }

    const amount = 100; // Montant à prélever
    const service = operator === 'orange' ? 'ORANGE' : 'MTN'; // Service basé sur l'opérateur
    const depositNumber = '699434038'; // Remplacez par le numéro de dépôt

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, amount, service, nominee, depositNumber }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "La transaction a échoué. Veuillez réessayer.");
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de l'appel de l'API.");
      console.error('Erreur lors de l\'appel de l\'API:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Paiement {operator === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}</CardTitle>
          <CardDescription>Entrez votre numéro de téléphone pour continuer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                <Input 
                  id="phoneNumber"
                  placeholder="Entrez 9 chiffres"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Traitement en cours...' : 'Valider'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {error && <div className="text-red-500 flex items-center"><AlertCircle className="mr-2" />{error}</div>}
          {success && <div className="text-green-500 flex items-center"><CheckCircle2 className="mr-2" />Transaction réussie!</div>}
        </CardFooter>
      </Card>
    </div>
  );
}

// Composant principal
export default function PagePaiement() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentForm />
    </Suspense>
  );
}
