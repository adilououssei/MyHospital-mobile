// app/services/pharmacyService.ts

import apiClient from './api.config';

export const PHARMACY_ENDPOINTS = {
  ON_CALL:         '/api/pharmacies/on-call',
  ON_CALL_BY_DATE: (date: string) => `/api/pharmacies/on-call?date=${date}`,
  REFRESH:         '/api/pharmacies/on-call/refresh',
};

// ─── Types (reflète exactement la structure retournée par le controller) ───────
export interface PharmacyHoraire {
  jour: string;
  ouverture: string;
  fermeture: string;
}

export interface Pharmacy {
  id: string;
  slug: string;       // ← pharmacie.slug (pour les images)
  name: string;       // ← pharmacie.titre
  address: string;    // ← adresse.adresse
  city: string;
  zone: string;       // ← zone.titre
  phone: string;      // ← adresse.telephone
  email: string;
  initials: string;      // ex: "DC" pour "Pharmacie DU CENTRE"
  avatarColor: string;   // couleur hex pour l'avatar
  isOnDuty: boolean;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  insurances: string[];       // ← assurances[].titre
  horaires: PharmacyHoraire[];
  gardeFrom: string | null;
  gardeTo: string | null;
}

export interface PharmacyApiResponse {
  success: boolean;
  date: string;
  count: number;
  data: Pharmacy[];
}

// ─── Appels API ────────────────────────────────────────────────────────────────

export async function getOnCallPharmacies(): Promise<Pharmacy[]> {
  const response = await apiClient.get<PharmacyApiResponse>(PHARMACY_ENDPOINTS.ON_CALL);
  return response.data.data;
}

export async function getOnCallPharmaciesByDate(date: string): Promise<Pharmacy[]> {
  const response = await apiClient.get<PharmacyApiResponse>(PHARMACY_ENDPOINTS.ON_CALL_BY_DATE(date));
  return response.data.data;
}

export async function refreshPharmacyCache(): Promise<void> {
  await apiClient.get(PHARMACY_ENDPOINTS.REFRESH);
}