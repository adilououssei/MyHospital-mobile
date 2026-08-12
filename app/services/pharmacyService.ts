// app/services/pharmacyService.ts

import apiClient from './api.config';

export const PHARMACY_ENDPOINTS = {
  ON_CALL:         '/api/pharmacies/on-call',
  ON_CALL_BY_DATE: (date: string) => `/api/pharmacies/on-call?date=${date}`,
  ALL:             '/api/pharmacies/all',
  ALL_BY_REGION:   (region: string) => `/api/pharmacies/all?region=${encodeURIComponent(region)}`,
  REFRESH:         '/api/pharmacies/on-call/refresh',
};

/** Position du patient, utilisée par le backend pour calculer la distance routière réelle */
export interface Coords { latitude: number; longitude: number; }

function withCoords(url: string, coords?: Coords): string {
  if (!coords) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}lat=${coords.latitude}&lon=${coords.longitude}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PharmacyHoraire {
  jour: string;
  ouverture: string;
  fermeture: string;
}

export interface Pharmacy {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  zone: string;
  region: string;        // ← nouveau : ex. "Maritime", "Savanes"
  phone: string;
  email: string;
  initials: string;
  avatarColor: string;
  imageUrl: string | null; // ← nouveau : URL image depuis Strapi
  isOnDuty: boolean;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  insurances: string[];
  horaires: PharmacyHoraire[];
  gardeFrom: string | null;
  gardeTo: string | null;
  // ← nouveau : distance routière réelle (OSRM), fournie par le backend quand lat/lon sont passés
  distanceKm?: number | null;
  durationMin?: number | null;
  distanceReal?: boolean;
}

export interface PharmacyApiResponse {
  success: boolean;
  date?: string;
  count: number;
  regions?: string[];   // disponible sur /all
  data: Pharmacy[];
}

// ─── Appels API ────────────────────────────────────────────────────────────────

/** Pharmacies de garde (aujourd'hui). Si `coords` est fourni, le backend renvoie
 *  la liste triée par distance routière réelle (distanceKm/durationMin remplis). */
export async function getOnCallPharmacies(coords?: Coords): Promise<Pharmacy[]> {
  const res = await apiClient.get<PharmacyApiResponse>(withCoords(PHARMACY_ENDPOINTS.ON_CALL, coords));
  return res.data.data;
}

/** Pharmacies de garde pour une date précise */
export async function getOnCallPharmaciesByDate(date: string, coords?: Coords): Promise<Pharmacy[]> {
  const res = await apiClient.get<PharmacyApiResponse>(withCoords(PHARMACY_ENDPOINTS.ON_CALL_BY_DATE(date), coords));
  return res.data.data;
}

/** Toutes les pharmacies (+ liste des régions disponibles) */
export async function getAllPharmacies(region?: string, coords?: Coords): Promise<{
  pharmacies: Pharmacy[];
  regions: string[];
}> {
  const url = region ? PHARMACY_ENDPOINTS.ALL_BY_REGION(region) : PHARMACY_ENDPOINTS.ALL;
  const res  = await apiClient.get<PharmacyApiResponse>(withCoords(url, coords));
  return {
    pharmacies: res.data.data,
    regions:    res.data.regions ?? [],
  };
}

/** Vide les caches serveur */
export async function refreshPharmacyCache(): Promise<void> {
  await apiClient.get(PHARMACY_ENDPOINTS.REFRESH);
}