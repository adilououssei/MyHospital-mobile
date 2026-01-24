import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://127.0.0.1:8000/:8000'; // Changez selon votre IP locale

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
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

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Erreur sauvegarde token:', error);
    }
  }

  async setUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Erreur sauvegarde user:', error);
    }
  }

  async getUser(): Promise<any | null> {
    try {
      const userJson = await AsyncStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erreur récupération user:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('patient');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  }

  async request(endpoint: string, options: any = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const config: any = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      console.log(`🔵 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`🟢 API Response: ${response.status}`, data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erreur API');
      }

      return data;
    } catch (error: any) {
      console.error(`🔴 API Error ${endpoint}:`, error);
      throw error;
    }
  }

  // ============ AUTHENTIFICATION ============

  async login(email: string, password: string): Promise<any> {
    return await this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: RegisterData): Promise<any> {
    return await this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // ============ PROFIL ============

  async getProfile(patientId: number): Promise<any> {
    return await this.request(`/api/profile/patient/${patientId}`);
  }

  async getProfileByUserId(userId: number): Promise<any> {
    return await this.request(`/api/profile/user/${userId}`);
  }

  async updateProfile(patientId: number, profileData: any): Promise<any> {
    return await this.request(`/api/profile/update/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadPhoto(patientId: number, photoUri: string): Promise<any> {
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });

    return await this.request(`/api/profile/upload-photo/${patientId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async getHealthStats(patientId: number): Promise<any> {
    return await this.request(`/api/profile/health-stats/${patientId}`);
  }

  async deleteAccount(patientId: number): Promise<any> {
    return await this.request(`/api/profile/delete/${patientId}`, {
      method: 'DELETE',
    });
  }

  // ============ RENDEZ-VOUS ============

  async getDoctors(filters: any = {}): Promise<any> {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/api/rendez-vous/docteurs${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }

  async getDoctorDetail(doctorId: number): Promise<any> {
    return await this.request(`/api/rendez-vous/docteurs/${doctorId}`);
  }

  async createAppointment(appointmentData: any): Promise<any> {
    return await this.request('/api/rendez-vous/create', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getPatientAppointments(patientId: number): Promise<any> {
    return await this.request(`/api/rendez-vous/patient/${patientId}`);
  }

  async cancelAppointment(appointmentId: number): Promise<any> {
    return await this.request(`/api/rendez-vous/${appointmentId}/cancel`, {
      method: 'POST',
    });
  }

  async simulatePaymentSuccess(appointmentId: number): Promise<any> {
    return await this.request(`/api/rendez-vous/${appointmentId}/simulate-payment-success`, {
      method: 'POST',
    });
  }
}

export default new ApiService();