// app/services/docteur.service.ts
// ✅ Service docteurs - utilise Axios via apiClient

import apiClient, { API_ENDPOINTS } from './api.config';

// ─────────────────────────────────────────────────────────────
// 📋 INTERFACES
// ─────────────────────────────────────────────────────────────

export interface Docteur {
  id: number;
  nom: string;
  prenom: string;
  nomComplet: string;
  specialite: string | null;
  specialiteId: number[] | null;
  photo: string | null;
  telephone: string;
  email: string;
  ville: string;
  adresse: string;
  tarifs: {
    hopital: number | null;
    domicile: number | null;
    enLigne: number | null;
  };
  typesConsultation: string[];
  note: number;
  nombreAvis: number;
}

export interface DocteurDetail extends Omit<Docteur, 'typesConsultation'> {
  numeroOrdre: string | null;
  diplomes: string | null;
  anneesExperience: number;
  languesParlees: string | null;
  biographie: string | null;
  nombrePatients: number;
  typesConsultation: Array<{
    type: string;
    label: string;
    prix: number;
  }>;
  prochainesDisponibilites: Array<{
    date: string;
    dateFormatted: string;
    creneauxDisponibles: number;
  }>;
}

export interface Creneau {
  id: number;
  heure: string;
  type: string;
  typeLibelle?: string;
  tarif?: number | null;
  disponible: boolean;
}

export interface Disponibilite {
  id: number;
  date: string;
  dateFormatted: string;
  jourSemaine: string;
  creneaux: Creneau[];
}

// ─────────────────────────────────────────────────────────────
// 🏥 DOCTEUR SERVICE
// ─────────────────────────────────────────────────────────────

class DocteurService {
  /**
   * Liste des docteurs (avec filtres optionnels)
   */
  async getDocteurs(
    specialite?: number,
    search?: string,
    type?: string
  ): Promise<Docteur[]> {
    try {
      const params: Record<string, string> = {};
      if (specialite) params.specialite = specialite.toString();
      if (search)     params.search     = search;
      if (type)       params.type       = type;

      const response = await apiClient.get(API_ENDPOINTS.DOCTEURS, { params });
      return response.data.docteurs ?? [];
    } catch (error: any) {
      console.error('❌ getDocteurs:', error.message);
      throw error;
    }
  }

  /**
   * Détails complets d'un docteur
   */
  async getDocteurById(id: number): Promise<DocteurDetail> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DOCTEUR_DETAIL(id));
      return response.data.docteur;
    } catch (error: any) {
      console.error('❌ getDocteurById:', error.message);
      throw error;
    }
  }

  /**
   * Récupère toutes les disponibilités d'un docteur
   * @param docteurId - ID du docteur
   * @param params - Filtres optionnels (date_debut, date_fin, type)
   */
  async getDisponibilites(
    docteurId: number,
    params?: {
      date_debut?: string; // Format YYYY-MM-DD
      date_fin?: string;   // Format YYYY-MM-DD
      type?: 'hopital' | 'domicile' | 'en_ligne';
    }
  ): Promise<Disponibilite[]> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.DOCTEUR_DISPONIBILITES(docteurId),
        { params }
      );
      return response.data.disponibilites || [];
    } catch (error: any) {
      console.error('❌ getDisponibilites:', error.message);
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la récupération des disponibilités'
      );
    }
  }

  /**
   * Créneaux d'un docteur pour une date précise (format YYYY-MM-DD)
   * @param id - ID du docteur
   * @param date - Date au format YYYY-MM-DD
   * @param type - Type de consultation (optionnel)
   */
  async getCreneauxParDate(
    id: number, 
    date: string,
    type?: 'hopital' | 'domicile' | 'en_ligne'
  ): Promise<Creneau[]> {
    try {
      const params = type ? { type } : undefined;
      const response = await apiClient.get(
        API_ENDPOINTS.DOCTEUR_CRENEAUX(id, date),
        { params }
      );
      return response.data.creneaux ?? [];
    } catch (error: any) {
      console.error('❌ getCreneauxParDate:', error.message);
      return [];
    }
  }

  /**
   * Retourne le tarif minimum d'un docteur (pour affichage dans la liste)
   */
  getPrixMin(docteur: Docteur): number {
    const { hopital, domicile, enLigne } = docteur.tarifs;
    const tarifs = [hopital, domicile, enLigne].filter((t): t is number => t !== null);
    return tarifs.length > 0 ? Math.min(...tarifs) : 0;
  }
}

export default new DocteurService();