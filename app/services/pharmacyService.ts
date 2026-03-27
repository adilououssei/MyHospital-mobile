// app/services/pharmacyService.ts

import apiClient from './api.config';

export const PHARMACY_ENDPOINTS = {
  ON_CALL:         '/api/pharmacies/on-call',
  ON_CALL_BY_DATE: (date: string) => `/api/pharmacies/on-call?date=${date}`,
  ALL:             '/api/pharmacies/all',
  ALL_BY_REGION:   (region: string) => `/api/pharmacies/all?region=${encodeURIComponent(region)}`,
  REFRESH:         '/api/pharmacies/on-call/refresh',
};

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
}

export interface PharmacyApiResponse {
  success: boolean;
  date?: string;
  count: number;
  regions?: string[];   // disponible sur /all
  data: Pharmacy[];
}

// ─── Appels API ────────────────────────────────────────────────────────────────

/** Pharmacies de garde (aujourd'hui) */
export async function getOnCallPharmacies(): Promise<Pharmacy[]> {
  const res = await apiClient.get<PharmacyApiResponse>(PHARMACY_ENDPOINTS.ON_CALL);
  return res.data.data;
}

/** Pharmacies de garde pour une date précise */
export async function getOnCallPharmaciesByDate(date: string): Promise<Pharmacy[]> {
  const res = await apiClient.get<PharmacyApiResponse>(PHARMACY_ENDPOINTS.ON_CALL_BY_DATE(date));
  return res.data.data;
}

/** Toutes les pharmacies (+ liste des régions disponibles) */
export async function getAllPharmacies(region?: string): Promise<{
  pharmacies: Pharmacy[];
  regions: string[];
}> {
  const url = region ? PHARMACY_ENDPOINTS.ALL_BY_REGION(region) : PHARMACY_ENDPOINTS.ALL;
  const res  = await apiClient.get<PharmacyApiResponse>(url);
  return {
    pharmacies: res.data.data,
    regions:    res.data.regions ?? [],
  };
}

/** Vide les caches serveur */
export async function refreshPharmacyCache(): Promise<void> {
  await apiClient.get(PHARMACY_ENDPOINTS.REFRESH);
}