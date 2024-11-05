'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function PaymentForm() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [operator, setOperator] = useState<string>('');
  const [nominee, setNominee] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<'phone' | 'likes'>('phone');

  const searchParams = useSearchParams();
  const router = useRouter();

  const likeOptions = [
    { value: 1, label: '1 Like', amount: 155 },
    { value: 2, label: '2 Likes', amount: 310 },
    { value: 5, label: '5 Likes', amount: 775 },
    { value: 10, label: '10 Likes', amount: 1550 },
    { value: 20, label: '20 Likes', amount: 3100 },
    { value: 30, label: '30 Likes', amount: 4650 },
    { value: 50, label: '50 Likes', amount: 7750 },
    { value: 100, label: '100 Likes', amount: 15500 }
  ];

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

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 9 || !/^\d+$/.test(phoneNumber)) {
      setError('Le numéro de téléphone doit contenir exactement 9 chiffres.');
      return;
    }
    setError('');
    setStep('likes');
  };

  const handleLikeSelection = async (amount: number) => {
    setIsProcessing(true);
    setError('');
    setSuccess(false);

    const service = operator === 'orange' ? 'ORANGE' : 'MTN';
    const depositNumber = '699434038';

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
        // Redirect to the net page with the amount
        router.push(`/`);
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
          <CardDescription>
            {step === 'phone' ? "Entrez votre numéro de téléphone pour continuer" : "Choisissez le nombre de likes"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                  <Input 
                    id="phoneNumber"
                    placeholder="Entrez 9 chiffres"
                    value={phoneNumber}
                    maxLength={9}
                    required
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="mt-4">Continuer</Button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {likeOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleLikeSelection(option.amount)}
                  disabled={isProcessing}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span>{option.label}</span>
                  <span className="text-sm">{option.amount} FCFA</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {isProcessing && (
            <div className="text-blue-500 flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transaction en cours, veuillez patienter...
            </div>
          )}
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