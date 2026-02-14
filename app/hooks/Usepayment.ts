// app/hooks/usePayment.ts
// ✅ Hook avec gestion conditionnelle - Tous les RDV en attente de validation

import { useState } from 'react';
import { Linking, Alert } from 'react-native';
import rendezVousService, { CreateRendezVousRequest } from '../services/rendezvous.service';

interface UsePaymentReturn {
  isLoading: boolean;
  error: string | null;
  createRendezVousAndPay: (data: CreateRendezVousRequest) => Promise<void>;
  checkPaymentStatus: (transactionId: string) => Promise<boolean>;
}

export const usePayment = (onSuccess?: () => void, onError?: (error: string) => void): UsePaymentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Créer un rendez-vous
   * - Si en_ligne : ouvre le lien PayPlus (en attente de paiement puis validation)
   * - Si domicile/hopital : crée directement en attente de validation
   */
  const createRendezVousAndPay = async (data: CreateRendezVousRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await rendezVousService.createRendezVous(data);

      console.log('✅ Réponse création RDV:', response);

      // ✅ Vérifier si un paiement est requis
      if (response.requiresPayment && response.paymentUrl) {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 💳 CONSULTATION EN LIGNE → Ouvrir PayPlus
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        console.log('💳 Lien de paiement reçu:', response.paymentUrl);

        const canOpen = await Linking.canOpenURL(response.paymentUrl);
        if (!canOpen) {
          throw new Error('Impossible d\'ouvrir le lien de paiement');
        }

        await Linking.openURL(response.paymentUrl);

        Alert.alert(
          'Paiement en cours',
          'Vous allez être redirigé vers PayPlus. Après paiement, votre rendez-vous sera soumis pour validation.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) onSuccess();
              },
            },
          ]
        );
      } else {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🏠🏥 DOMICILE ou HÔPITAL → En attente de validation
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        console.log('✅ Rendez-vous créé en attente de validation');

        Alert.alert(
          'Demande envoyée !',
          'Votre demande de rendez-vous a été envoyée au médecin. Vous serez notifié dès qu\'il l\'acceptera.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) onSuccess();
              },
            },
          ]
        );
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la création du rendez-vous';
      setError(errorMessage);
      console.error('❌ Erreur:', errorMessage);

      Alert.alert('Erreur', errorMessage, [{ text: 'OK' }]);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vérifier le statut d'un paiement
   */
  const checkPaymentStatus = async (transactionId: string): Promise<boolean> => {
    try {
      const status = await rendezVousService.checkPaiementStatus(transactionId);
      return status.status === 'success';
    } catch (err) {
      console.error('❌ Erreur vérification paiement:', err);
      return false;
    }
  };

  return {
    isLoading,
    error,
    createRendezVousAndPay,
    checkPaymentStatus,
  };
};

export interface CreateRendezVousResponse {
  message: string;
  paymentUrl?: string;
  requiresPayment?: boolean;
  rendezVousId: number;
}