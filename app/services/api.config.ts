// app/services/api.config.ts

// Configuration de l'URL de base de ton API
// Remplace cette URL par l'URL de ton serveur Symfony
export const API_BASE_URL = 'http://192.168.1.68:8000'; // Change selon ton IP locale ou serveur
export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  REGISTER: '/api/register',
};