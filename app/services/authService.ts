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


interface ForgotPasswordRequest {
  email: string;
}

interface VerifyTokenRequest {
  token: string;
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
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


  // Demande de réinitialisation
  async requestPasswordReset(email: string): Promise<any> {
    try {
      const response = await apiClient.post('/api/forgot-password/request', { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Erreur réseau' };
    }
  }

  // Vérification du token
  async verifyResetToken(token: string, email: string): Promise<any> {
    try {
      const response = await apiClient.post('/api/forgot-password/verify', { token, email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Token invalide' };
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(token: string, email: string, password: string, confirmPassword: string): Promise<any> {
    try {
      const response = await apiClient.post('/api/forgot-password/reset', {
        token,
        email,
        password,
        confirmPassword
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Erreur lors de la réinitialisation' };
    }
  }

}

export default new AuthService();