// app/services/rendezvous.service.ts
// ✅ Service rendez-vous et paiements — meilleur logging d'erreur

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

export interface RendezVous {
  jitsiRoom: null;
  jitsiUrl: null;
  id:                number;
  docteurId:         number;
  docteurNom:        string;
  docteurPrenom:     string;
  docteurSpecialite: string | null;
  docteurPhoto:      string | null;
  docteurTelephone:  string | null;
  patientId:         number;
  dateRendezVous:    string;
  typeConsultation:  string;
  statut:
    | 'pending'
    | 'pending_payment'
    | 'accepted'
    | 'refused'
    | 'cancelled'
    | 'completed';
  description:       string | null;
  createdAt:         string | null;
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

export interface RescheduleRequest {
  date: string;
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
   * ✅ Créer un rendez-vous
   */
  async createRendezVous(data: CreateRendezVousRequest): Promise<CreateRendezVousResponse> {
    try {
      console.log('📤 Création rendez-vous — payload envoyé:', JSON.stringify(data, null, 2));

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
      // ✅ Log complet pour diagnostiquer le vrai message 500
      console.log('❌ Erreur création RDV — statut HTTP:', error?.response?.status);
      console.log('❌ Erreur création RDV — body complet:', JSON.stringify(error?.response?.data, null, 2));

      // Extraire le message le plus précis possible
      const serverMessage =
        error?.response?.data?.detail ||      // Symfony exception detail
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.response?.data?.title ||       // API Platform error title
        error?.message ||
        'Erreur lors de la création du rendez-vous';

      console.log('❌ Message erreur final:', serverMessage);
      throw new Error(serverMessage);
    }
  }

  /**
   * ✅ Reprogrammer un rendez-vous
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
      console.error('❌ Erreur reprogrammation:', error?.response?.data);
      throw new Error(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Erreur lors de la reprogrammation du rendez-vous'
      );
    }
  }

  /**
   * ✅ Liste des rendez-vous du patient
   */
  async getMesRendezVous(): Promise<RendezVous[]> {
    try {
      const response = await apiClient.get('/api/patient/rendezvous/mes-rendezvous');
      return response.data.rendezVous || [];
    } catch (error: any) {
      console.error('❌ Erreur récupération rendez-vous:', error?.response?.data);
      throw new Error('Erreur lors de la récupération des rendez-vous');
    }
  }

  /**
   * ✅ Détails d'un rendez-vous
   */
  async getRendezVousById(id: number): Promise<RendezVous> {
    try {
      const response = await apiClient.get(`/api/rendezvous/${id}`);
      return response.data.rendezVous;
    } catch (error: any) {
      console.error('❌ Erreur récupération détails rendez-vous:', error?.response?.data);
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
      console.error('❌ Erreur annulation rendez-vous:', error?.response?.data);
      throw new Error("Erreur lors de l'annulation du rendez-vous");
    }
  }

  /**
   * ✅ Vérifier le statut d'un paiement
   */
  async checkPaiementStatus(transactionId: string): Promise<PaiementStatus> {
    try {
      const response = await apiClient.get(`/api/paiement/status/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur vérification paiement:', error?.response?.data);
      throw new Error('Erreur lors de la vérification du paiement');
    }
  }

  /**
   * ✅ Mapper type de consultation frontend → backend
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
   * ✅ Mapper mode de paiement frontend → backend
   */
  mapPaymentMethod(frontendMethod: string): 'tmoney' | 'flooz' {
    return frontendMethod === 'flooz' ? 'flooz' : 'tmoney';
  }
}

export default new RendezVousService();