// app/services/hospitalService.ts
import apiClient from './api.config';

export const HOSPITAL_ENDPOINTS = {
  LIST:    '/api/hospitals',
  FILTER:  (params: string) => `/api/hospitals?${params}`,
  REFRESH: '/api/hospitals/refresh',
};

export interface HospitalCoordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface Hospital {
  id: string;
  name: string;
  type: string;         // 'CHU' | 'Hôpital Public' | 'Clinique Privée' | 'Polyclinique'
  amenityType: string;  // 'hospital' | 'clinic'
  address: string;
  city: string;
  country: string;
  phone: string;
  website: string;
  email: string;
  openingHours: string;
  emergency: boolean;
  specialties: string[];
  description: string;
  initials: string;
  avatarColor: string;
  imageUrl: string | null;  // URL externe (depuis enrichissement)
  coordinates: HospitalCoordinates;
  source: string;
}

export interface HospitalApiResponse {
  success: boolean;
  count: number;
  data: Hospital[];
}

export async function getHospitals(filters?: {
  type?: 'all' | 'hospital' | 'clinic';
  city?: string;
  emergency?: boolean;
}): Promise<Hospital[]> {
  const params = new URLSearchParams();
  if (filters?.type && filters.type !== 'all') params.set('type', filters.type);
  if (filters?.city) params.set('city', filters.city);
  if (filters?.emergency) params.set('emergency', '1');

  const url = params.toString()
    ? HOSPITAL_ENDPOINTS.FILTER(params.toString())
    : HOSPITAL_ENDPOINTS.LIST;

  const response = await apiClient.get<HospitalApiResponse>(url);
  return response.data.data;
}

export async function refreshHospitalCache(): Promise<void> {
  await apiClient.get(HOSPITAL_ENDPOINTS.REFRESH);
}