// app/services/rendezvous.service.ts
// ✅ Service rendez-vous et paiements

import apiClient, { API_ENDPOINTS } from './api.config';

// ─────────────────────────────────────────────────────────────
// 📋 INTERFACES
// ─────────────────────────────────────────────────────────────

export interface CreateRendezVousRequest {
  docteurId: number;
  date: string; // Format ISO: "2024-06-26T10:30:00"
  typeConsultation: 'hopital' | 'domicile' | 'en_ligne';
  modePaiement: 'tmoney' | 'flooz';
  description?: string;
}

export interface CreateRendezVousResponse {
  message: string;
  paymentUrl?: string;
  rendezVousId: number;
  requiresPayment: boolean;
}

// ✅ MIS À JOUR : statuts complets (backend renvoie 'pending' et 'accepted', pas 'confirmed')
export interface RendezVous {
  id:                number;
  docteurId:         number;        // ✅ NOUVEAU : nécessaire pour le reschedule
  docteurNom:        string;
  docteurPrenom:     string;
  docteurSpecialite: string | null;
  docteurPhoto:      string | null; // ✅ NOUVEAU : chemin vers la photo du docteur
  docteurTelephone:  string | null; // ✅ NOUVEAU : téléphone du docteur
  patientId:         number;
  dateRendezVous:    string;
  typeConsultation:  string;
  // ✅ CORRECTIF : liste complète des statuts réellement renvoyés par le backend
  statut:
    | 'pending'          // en attente de validation du docteur
    | 'pending_payment'  // en attente de paiement (consultation en ligne)
    | 'accepted'         // accepté par le docteur (= confirmé côté mobile)
    | 'refused'          // refusé par le docteur
    | 'cancelled'        // annulé par le patient
    | 'completed';       // consultation terminée
  description:       string | null;
  createdAt:         string | null; // ✅ NOUVEAU
  paiement: {
    id:             number;
    montant:        number;
    statut:         'unpaid' | 'paid' | 'failed';
    modePaiement:   string;
    transactionId?: string;
  } | null;
}

export interface PaiementStatus {
  transactionId: string;
  status:        'success' | 'failed' | 'pending';
  message:       string;
}

// ✅ NOUVEAU : payload pour reprogrammer un RDV
export interface RescheduleRequest {
  date: string; // Format ISO: "2024-06-26T10:30:00"
}

export interface RescheduleResponse {
  message:      string;
  rendezVousId: number;
  newDate:      string;
  statut:       string;
}

// ─────────────────────────────────────────────────────────────
// 🏥 RENDEZ-VOUS SERVICE
// ─────────────────────────────────────────────────────────────

class RendezVousService {

  /**
   * ✅ Créer un rendez-vous (et générer le lien de paiement PayPlus si en_ligne)
   */
  async createRendezVous(data: CreateRendezVousRequest): Promise<CreateRendezVousResponse> {
    try {
      console.log('📤 Création rendez-vous:', data);

      const response = await apiClient.post('/api/rendezvous/create', {
        docteurId:        data.docteurId,
        date:             data.date,
        typeConsultation: data.typeConsultation,
        modePaiement:     data.modePaiement,
        description:      data.description,
      });

      console.log('✅ Rendez-vous créé:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur création rendez-vous:', error);
      throw new Error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Erreur lors de la création du rendez-vous'
      );
    }
  }

  /**
   * ✅ NOUVEAU : Reprogrammer un rendez-vous (PATCH)
   *    Uniquement pour les RDV encore en statut "pending"
   */
  async reschedule(rdvId: number, data: RescheduleRequest): Promise<RescheduleResponse> {
    try {
      console.log(`📤 Reprogrammation RDV #${rdvId}:`, data);

      const response = await apiClient.patch(
        `/api/rendezvous/${rdvId}/reschedule`,
        { date: data.date }
      );

      console.log('✅ RDV reprogrammé:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur reprogrammation:', error);
      throw new Error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Erreur lors de la reprogrammation du rendez-vous'
      );
    }
  }

  /**
   * ✅ Récupérer la liste des rendez-vous du patient connecté
   */
  async getMesRendezVous(): Promise<RendezVous[]> {
    try {
      const response = await apiClient.get('/api/patient/rendezvous/mes-rendezvous');
      return response.data.rendezVous || [];
    } catch (error: any) {
      console.error('❌ Erreur récupération rendez-vous:', error);
      throw new Error('Erreur lors de la récupération des rendez-vous');
    }
  }

  /**
   * ✅ Récupérer les détails d'un rendez-vous spécifique
   */
  async getRendezVousById(id: number): Promise<RendezVous> {
    try {
      const response = await apiClient.get(`/api/rendezvous/${id}`);
      return response.data.rendezVous;
    } catch (error: any) {
      console.error('❌ Erreur récupération détails rendez-vous:', error);
      throw new Error('Erreur lors de la récupération du rendez-vous');
    }
  }

  /**
   * ✅ Annuler un rendez-vous
   */
  async cancelRendezVous(id: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/api/rendezvous/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur annulation rendez-vous:', error);
      throw new Error('Erreur lors de l\'annulation du rendez-vous');
    }
  }

  /**
   * ✅ Vérifier le statut d'un paiement via transaction ID
   */
  async checkPaiementStatus(transactionId: string): Promise<PaiementStatus> {
    try {
      const response = await apiClient.get(`/api/paiement/status/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur vérification paiement:', error);
      throw new Error('Erreur lors de la vérification du paiement');
    }
  }

  /**
   * ✅ Mapper le type de consultation frontend → backend
   *    Accepte aussi bien les valeurs frontend ('online', 'home', 'hospital')
   *    que backend directes ('en_ligne', 'domicile', 'hopital')
   */
  mapConsultationType(frontendType: string): 'hopital' | 'domicile' | 'en_ligne' {
    const typeMap: Record<string, 'hopital' | 'domicile' | 'en_ligne'> = {
      'online':   'en_ligne',
      'home':     'domicile',
      'hospital': 'hopital',
      'en_ligne': 'en_ligne',
      'domicile': 'domicile',
      'hopital':  'hopital',
    };
    return typeMap[frontendType] || 'hopital';
  }

  /**
   * ✅ Mapper le mode de paiement frontend → backend
   */
  mapPaymentMethod(frontendMethod: string): 'tmoney' | 'flooz' {
    return frontendMethod === 'flooz' ? 'flooz' : 'tmoney';
  }
}

export default new RendezVousService();