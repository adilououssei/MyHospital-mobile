import apiClient, { API_ENDPOINTS } from './api.config';

export interface EvaluationDocteur {
  id: number;
  note: number;
  commentaire: string | null;
  createdAt: string;
}

export interface EvaluationStats {
  moyenne: number;
  nombreAvis: number;
}

export interface RendezVousEnAttente {
  id: number;
  dateRendezVous: string;
  docteurNom: string;
  docteurPrenom: string;
  docteurId: number;
  typeConsultation: string;
}

export interface CreateEvaluationRequest {
  rendezVousId: number;
  note: number;
  commentaire?: string;
}

export interface CreateAppFeedbackRequest {
  note?: number;
  commentaire?: string;
  suggestionAmelioration?: string;
}

const API = {
  EVALUATION_DOCTEUR: '/api/evaluations/docteur',
  EVALUATION_DOCTEUR_STATS: (id: number) => `/api/evaluations/docteur/${id}/stats`,
  EVALUATION_DOCTEUR_LIST: (id: number) => `/api/evaluations/docteur/${id}`,
  RDV_EN_ATTENTE: '/api/evaluations/patient/rdv-en-attente',
  EVALUATION_APP_VERIFIER: '/api/evaluations/application/verifier',
  EVALUATION_APP: '/api/evaluations/application',
};

class EvaluationService {
  async getStatsDocteur(docteurId: number): Promise<EvaluationStats> {
    try {
      const response = await apiClient.get<{ status: string; moyenne: number; nombreAvis: number }>(
        API.EVALUATION_DOCTEUR_STATS(docteurId)
      );
      return {
        moyenne: response.data.moyenne || 0,
        nombreAvis: response.data.nombreAvis || 0,
      };
    } catch {
      return { moyenne: 0, nombreAvis: 0 };
    }
  }

  async getEvaluationsDocteur(docteurId: number): Promise<EvaluationDocteur[]> {
    try {
      const response = await apiClient.get<{ status: string; evaluations: EvaluationDocteur[] }>(
        API.EVALUATION_DOCTEUR_LIST(docteurId)
      );
      return response.data.evaluations || [];
    } catch {
      return [];
    }
  }

  async soumettreEvaluation(data: CreateEvaluationRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(API.EVALUATION_DOCTEUR, data);
      return { success: true, message: response.data.message || 'Évaluation enregistrée' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de l\'envoi',
      };
    }
  }

  async getRendezVousEnAttente(): Promise<RendezVousEnAttente[]> {
    try {
      const response = await apiClient.get<{ status: string; rendezVous: RendezVousEnAttente[] }>(
        API.RDV_EN_ATTENTE
      );
      return response.data.rendezVous || [];
    } catch {
      return [];
    }
  }

  async verifierEvaluationApp(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string; peutEvaluer: boolean }>(
        API.EVALUATION_APP_VERIFIER
      );
      return response.data.peutEvaluer ?? false;
    } catch {
      return false;
    }
  }

  async soumettreFeedbackApp(data: CreateAppFeedbackRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(API.EVALUATION_APP, data);
      return { success: true, message: response.data.message || 'Merci pour votre feedback !' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de l\'envoi',
      };
    }
  }
}

export default new EvaluationService();
