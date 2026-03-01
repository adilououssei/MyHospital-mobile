import apiClient, { API_ENDPOINTS } from './api.config';

// ─────────────────────────────────────────────────────────────
// 📋 INTERFACES
// ─────────────────────────────────────────────────────────────

export interface LoginData {
  email: string;
  password: string;
}

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

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  ville?: string;      // ← AJOUTÉ : requis par AppContext
  adresse?: string;
  telephone?: string;
  photo?: string;
}

export interface LoginResponse {
  status: 'success' | 'error';
  message: string;
  token?: string;
  user?: User;
}

export interface RegisterResponse {
  status: 'success' | 'error';
  message: string;
}

// ─────────────────────────────────────────────────────────────
// 🔐 AUTH SERVICE
// ─────────────────────────────────────────────────────────────

class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, data);
      return response.data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.message ?? 'Erreur de connexion au serveur',
      };
    }
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.REGISTER, data);
      return response.data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.message ?? "Erreur lors de l'inscription",
      };
    }
  }
}

export default new AuthService();