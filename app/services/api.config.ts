// app/services/api.config.ts

export const API_BASE_URL = 'http://192.168.1.68:8000';

export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  // Nouveaux endpoints pour les docteurs
  DOCTEURS: '/api/docteurs',
  DOCTEUR_DETAIL: (id: number) => `/api/docteurs/${id}`,
  SPECIALITES: '/api/specialites',
};