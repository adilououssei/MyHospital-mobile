// app/services/docteur.service.ts

import apiClient, { API_ENDPOINTS } from './api.config';

export interface Docteur {
  id: number;
  nom: string;
  prenom: string;
  nomComplet: string;
  specialite: string | null;
  specialites: string[];
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
  consultationLocation?: {
    latitude: number | null;
    longitude: number | null;
    adresse: string | null;
    indication: string | null;
  };
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
  consultationLocation?: {
    latitude: number | null;
    longitude: number | null;
    adresse: string | null;
    indication: string | null;
  };
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

class DocteurService {
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

  async getDocteurById(id: number): Promise<DocteurDetail> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DOCTEUR_DETAIL(id));
      return response.data.docteur;
    } catch (error: any) {
      console.error('❌ getDocteurById:', error.message);
      throw error;
    }
  }

  async getDisponibilites(
    docteurId: number,
    params?: {
      date_debut?: string;
      date_fin?: string;
      type?: 'hopital' | 'domicile' | 'en_ligne';
    }
  ): Promise<Disponibilite[]> {
    try {
      console.log('🔍 [SERVICE] Appel API disponibilités - docteurId:', docteurId, 'params:', params);
      
      const response = await apiClient.get(
        API_ENDPOINTS.DOCTEUR_DISPONIBILITES(docteurId),
        { params }
      );
      
      console.log('🔍 [SERVICE] Réponse API disponibilités:', JSON.stringify(response.data, null, 2));
      
      return response.data.disponibilites || [];
    } catch (error: any) {
      console.error('❌ getDisponibilites:', error.message);
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la récupération des disponibilités'
      );
    }
  }

  async getCreneauxParDate(
    id: number, 
    date: string,
    type?: 'hopital' | 'domicile' | 'en_ligne'
  ): Promise<Creneau[]> {
    try {
      const params = type ? { type } : undefined;
      
      console.log('🔍 [SERVICE] Appel API créneaux - id:', id, 'date:', date, 'type:', type);
      console.log('🔍 [SERVICE] URL:', API_ENDPOINTS.DOCTEUR_CRENEAUX(id, date));
      console.log('🔍 [SERVICE] Params:', params);
      
      const response = await apiClient.get(
        API_ENDPOINTS.DOCTEUR_CRENEAUX(id, date),
        { params }
      );
      
      console.log('🔍 [SERVICE] Réponse API créneaux:', JSON.stringify(response.data, null, 2));
      
      return response.data.creneaux ?? [];
    } catch (error: any) {
      console.error('❌ getCreneauxParDate:', error.message);
      return [];
    }
  }

  /**
   * Retourne la spécialité du docteur (version corrigée)
   */
  // getSpecialite(docteur: Docteur): string {
  //   // Priorité 1: Utiliser le champ specialite (string)
  //   if (docteur.specialite && docteur.specialite !== '' && docteur.specialite !== 'null') {
  //     return docteur.specialite;
  //   }
  //   // Priorité 2: Utiliser le tableau specialites
  //   if (docteur.specialites && docteur.specialites.length > 0) {
  //     return docteur.specialites[0];
  //   }
  //   return 'Médecin généraliste';
  // }

  getPrixMin(docteur: Docteur): number {
    const { hopital, domicile, enLigne } = docteur.tarifs;
    const tarifs = [hopital, domicile, enLigne].filter((t): t is number => t !== null && t > 0);
    return tarifs.length > 0 ? Math.min(...tarifs) : 0;
  }

  async updateConsultationLocation(data: {
    latitude?: number;
    longitude?: number;
    adresse?: string;
    indication?: string | null;
  }): Promise<any> {
    const response = await apiClient.put(API_ENDPOINTS.DOCTEUR_UPDATE_LOCATION, data);
    return response.data;
  }

  getSpecialite(docteur: Docteur): string {
    if (docteur.specialite && docteur.specialite !== '' && docteur.specialite !== 'null') {
      return docteur.specialite;
    }
    if (docteur.specialites && docteur.specialites.length > 0) {
      return docteur.specialites[0];
    }
    return 'Médecin généraliste';
  }
}

export default new DocteurService();