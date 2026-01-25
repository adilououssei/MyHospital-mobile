// app/services/docteur.service.ts

import { API_BASE_URL, API_ENDPOINTS } from './api.config';

export interface Docteur {
  id: number;
  nom: string;
  prenom: string;
  nomComplet: string;
  specialite: string | null;
  specialiteId: number | number[] | null;
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
  typesConsultation?: string[];
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

export interface Specialite {
  id: number;
  nom: string;
  description: string | null;
}

export interface Creneau {
  id: number;
  heure: string;
  type: string;
  typeLibelle?: string;
  tarif?: number;
  disponible: boolean;
}

export interface Disponibilite {
  id: number;
  date: string;
  dateFormatted: string;
  jourSemaine: string;
  creneaux: Creneau[];
  nombreCreneauxDisponibles?: number;
  nombreCreneauxTotal?: number;
}

export interface DocteurListResponse {
  status: string;
  count: number;
  docteurs: Docteur[];
}

export interface DocteurDetailResponse {
  status: string;
  docteur: DocteurDetail;
}

export interface SpecialiteListResponse {
  status: string;
  count: number;
  specialites: Specialite[];
}

export interface DisponibiliteListResponse {
  status: string;
  count: number;
  disponibilites: Disponibilite[];
}

export interface DisponibiliteDateResponse {
  status: string;
  date: string;
  dateFormatted: string;
  jourSemaine: string;
  nombreCreneauxDisponibles: number;
  nombreCreneauxTotal: number;
  creneaux: Creneau[];
  message?: string;
}

class DocteurService {
  /**
   * Récupère la liste des docteurs avec filtres optionnels
   */
  async getDocteurs(
    specialite?: number,
    search?: string,
    type?: string
  ): Promise<DocteurListResponse> {
    try {
      const params = new URLSearchParams();
      if (specialite) params.append('specialite', specialite.toString());
      if (search) params.append('search', search);
      if (type) params.append('type', type);

      const url = `${API_BASE_URL}${API_ENDPOINTS.DOCTEURS}${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      console.log('🌐 Fetching doctors from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('📨 Server response status:', response.status);
      console.log('📨 Server response body:', responseText);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`);
      }

      const data: DocteurListResponse = JSON.parse(responseText);
      console.log('✅ Doctors loaded:', data.count);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des docteurs:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un docteur spécifique
   */
  async getDocteurById(id: number): Promise<DocteurDetailResponse> {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.DOCTEUR_DETAIL(id)}`;
      console.log('🌐 Fetching doctor details from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('📨 Server response status:', response.status);
      console.log('📨 Server response body:', responseText);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`);
      }

      const data: DocteurDetailResponse = JSON.parse(responseText);
      console.log('✅ Doctor details loaded:', data.docteur.nomComplet);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du docteur:', error);
      throw error;
    }
  }

  /**
   * Récupère les disponibilités d'un docteur
   */
  async getDocteurDisponibilites(
    id: number,
    dateDebut?: string,
    dateFin?: string,
    type?: string
  ): Promise<DisponibiliteListResponse> {
    try {
      const params = new URLSearchParams();
      if (dateDebut) params.append('date_debut', dateDebut);
      if (dateFin) params.append('date_fin', dateFin);
      if (type) params.append('type', type);

      const url = `${API_BASE_URL}/api/docteurs/${id}/disponibilites${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      console.log('🌐 Fetching disponibilites from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('📨 Server response status:', response.status);
      console.log('📨 Server response body:', responseText);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`);
      }

      const data: DisponibiliteListResponse = JSON.parse(responseText);
      console.log('✅ Disponibilites loaded:', data.count);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des disponibilités:', error);
      throw error;
    }
  }

  /**
   * Récupère les créneaux disponibles pour une date spécifique
   */
  async getDisponibilitesParDate(
    id: number,
    date: string,
    type?: string
  ): Promise<DisponibiliteDateResponse> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);

      const url = `${API_BASE_URL}/api/docteurs/${id}/disponibilites/${date}${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      console.log('🌐 Fetching creneaux from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('📨 Server response status:', response.status);
      console.log('📨 Server response body:', responseText);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`);
      }

      const data: DisponibiliteDateResponse = JSON.parse(responseText);
      console.log('✅ Creneaux loaded:', data.creneaux.length);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des créneaux:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des spécialités
   */
  async getSpecialites(): Promise<SpecialiteListResponse> {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.SPECIALITES}`;
      console.log('🌐 Fetching specialites from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('📨 Server response status:', response.status);
      console.log('📨 Server response body:', responseText);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`);
      }

      const data: SpecialiteListResponse = JSON.parse(responseText);
      console.log('✅ Specialites loaded:', data.count);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des spécialités:', error);
      throw error;
    }
  }
}

export default new DocteurService();