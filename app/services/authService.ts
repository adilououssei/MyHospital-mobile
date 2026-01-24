// app/services/authService.ts

import { API_BASE_URL, API_ENDPOINTS } from './api.config';

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  ville: string;
  dateNaissance: string;
  genre: string;
  groupeSanguin?: string;
  taille?: number;
  poids?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
}

export interface LoginResponse {
  status: 'success' | 'error';
  message: string;
  user?: User;
}

export interface RegisterResponse {
  status: 'success' | 'error';
  message: string;
}

class AuthService {
  /**
   * Connexion d'un utilisateur
   */
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;
      console.log('🌐 URL appelée:', url);
      console.log('📤 Données envoyées:', data);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Status HTTP:', response.status);
      console.log('📥 Status Text:', response.statusText);
      console.log('📥 Headers:', JSON.stringify([...response.headers.entries()]));

      // Lire le texte brut de la réponse
      const textResponse = await response.text();
      console.log('📥 Réponse brute (texte):', textResponse);

      // Essayer de parser en JSON
      let result;
      try {
        result = JSON.parse(textResponse);
        console.log('✅ Réponse parsée (JSON):', result);
      } catch (parseError) {
        console.error('❌ Erreur de parsing JSON:', parseError);
        console.error('❌ Le serveur a renvoyé:', textResponse);
        return {
          status: 'error',
          message: 'Le serveur a renvoyé une réponse invalide',
        };
      }

      // Vérifier si la réponse est un succès HTTP
      if (!response.ok) {
        console.error('❌ Réponse HTTP non-OK:', response.status);
        throw new Error(result.message || 'Erreur de connexion');
      }

      console.log('✅ Login réussi!');
      return result;
    } catch (error: any) {
      console.error('❌ ERREUR COMPLÈTE:', error);
      console.error('❌ Message:', error.message);
      console.error('❌ Stack:', error.stack);
      return {
        status: 'error',
        message: error.message || 'Erreur de connexion au serveur',
      };
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.REGISTER}`;
      console.log('🌐 URL appelée:', url);
      console.log('📤 Données envoyées:', data);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Status HTTP:', response.status);

      // Lire le texte brut de la réponse
      const textResponse = await response.text();
      console.log('📥 Réponse brute:', textResponse);

      // Essayer de parser en JSON
      let result;
      try {
        result = JSON.parse(textResponse);
        console.log('✅ Réponse parsée:', result);
      } catch (parseError) {
        console.error('❌ Erreur de parsing JSON:', parseError);
        return {
          status: 'error',
          message: 'Le serveur a renvoyé une réponse invalide',
        };
      }

      if (!response.ok) {
        throw new Error(result.message || 'Erreur d\'inscription');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      return {
        status: 'error',
        message: error.message || 'Erreur de connexion au serveur',
      };
    }
  }
}

export default new AuthService();