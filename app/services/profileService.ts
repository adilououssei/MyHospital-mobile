// app/services/profileService.ts

import apiClient from './api.config';

// ─────────────────────────────────────────────────────────────
// 📋 ENDPOINTS
// ─────────────────────────────────────────────────────────────
export const PROFILE_ENDPOINTS = {
  GET_BY_USER:   (userId: number)    => `/api/profile/user/${userId}`,
  GET_BY_ID:     (patientId: number) => `/api/profile/patient/${patientId}`,
  UPDATE:        (patientId: number) => `/api/profile/update/${patientId}`,
  UPLOAD_PHOTO:  (patientId: number) => `/api/profile/upload-photo/${patientId}`,
  HEALTH_STATS:  (patientId: number) => `/api/profile/health-stats/${patientId}`,
  DELETE:        (patientId: number) => `/api/profile/delete/${patientId}`,
};

// ─────────────────────────────────────────────────────────────
// 🏷️ TYPES
// ─────────────────────────────────────────────────────────────
export interface PatientProfile {
  id: number;
  user_id: number;
  personal_info: {
    nom: string;
    prenom: string;
    full_name: string;
    email: string;
    telephone: string | null;
    adresse: string | null;
    ville: string | null;
    photo: string | null;
  };
  health_info: {
    date_naissance: string | null;   // "1995-04-12"
    age: number | null;
    genre: string | null;
    groupe_sanguin: string | null;
    taille: number | null;           // en mètres ex: 1.75
    poids: number | null;            // en kg
    imc: number | null;
  };
  stats: {
    appointments_count: number;
    consultations_count: number;
  };
  account_info: {
    created_at: string | null;
    last_login: string | null;
    is_verified: boolean;
  };
}

export interface HealthStats {
  heart_rate: number | null;
  blood_pressure: string | null;
  calories: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  blood_type: string | null;
}

export interface UpdateProfileData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  password?: string;
  dateNaissance?: string;
  genre?: string;
  groupeSanguin?: string;
  taille?: number;
  poids?: number;
}

// ─────────────────────────────────────────────────────────────
// 📡 APPELS API
// ─────────────────────────────────────────────────────────────

export async function getProfileByUserId(userId: number): Promise<PatientProfile> {
  const response = await apiClient.get<{ success: boolean; patient: PatientProfile }>(
    PROFILE_ENDPOINTS.GET_BY_USER(userId)
  );
  return response.data.patient;
}

export async function getProfileById(patientId: number): Promise<PatientProfile> {
  const response = await apiClient.get<{ success: boolean; patient: PatientProfile }>(
    PROFILE_ENDPOINTS.GET_BY_ID(patientId)
  );
  return response.data.patient;
}

export async function updateProfile(
  patientId: number,
  data: UpdateProfileData
): Promise<PatientProfile> {
  const response = await apiClient.patch<{ success: boolean; patient: PatientProfile }>(
    PROFILE_ENDPOINTS.UPDATE(patientId),
    data
  );
  return response.data.patient;
}

export async function uploadProfilePhoto(
  patientId: number,
  photoUri: string,
  fileName: string = 'photo.jpg'
): Promise<{ photo_url: string; patient: PatientProfile }> {
  // FormData pour l'upload d'image
  const formData = new FormData();
  formData.append('photo', {
    uri: photoUri,
    type: 'image/jpeg',
    name: fileName,
  } as any);

  const token = apiClient.getAuthToken();
  const response = await fetch(
    `${require('./api.config').API_BASE_URL}${PROFILE_ENDPOINTS.UPLOAD_PHOTO(patientId)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }
  );

  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Erreur upload photo');
  return data;
}

export async function getHealthStats(patientId: number): Promise<HealthStats> {
  const response = await apiClient.get<{ success: boolean; stats: HealthStats }>(
    PROFILE_ENDPOINTS.HEALTH_STATS(patientId)
  );
  return response.data.stats;
}

// ─────────────────────────────────────────────────────────────
// 🔧 HELPERS
// ─────────────────────────────────────────────────────────────

/** Retourne le label du genre */
export function getGenreLabel(genre: string | null): string {
  switch (genre) {
    case 'homme':  return 'Homme';
    case 'femme':  return 'Femme';
    default:       return genre ?? 'Non renseigné';
  }
}

/** Retourne le label de l'IMC */
export function getImcLabel(imc: number | null): string {
  if (!imc) return 'Non calculé';
  if (imc < 18.5)  return 'Insuffisance pondérale';
  if (imc < 25)    return 'Poids normal';
  if (imc < 30)    return 'Surpoids';
  return 'Obésité';
}

/** Formate la taille en mètres pour l'affichage */
export function formatTaille(taille: number | null): string {
  if (!taille) return 'Non renseigné';
  return taille >= 3 ? `${taille} cm` : `${(taille * 100).toFixed(0)} cm`;
}