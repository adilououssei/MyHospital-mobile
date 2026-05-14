// app/services/api.config.ts
// ✅ FICHIER CENTRAL - Modifier seulement ici pour changer l'URL du serveur

export const API_BASE_URL = 'http://192.168.1.68:8000';

// ─────────────────────────────────────────────────────────────
// 📋 TOUS LES ENDPOINTS DE L'APPLICATION
// ─────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  // Authentification
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  REFRESH_TOKEN: '/api/token/refresh',

  PHARMACIES_ON_CALL:         '/api/pharmacies/on-call',
  PHARMACIES_ON_CALL_REFRESH: '/api/pharmacies/on-call/refresh',

  // Docteurs
  DOCTEURS: '/api/docteurs',
  DOCTEUR_DETAIL: (id: number) => `/api/docteurs/${id}`,
  DOCTEUR_DISPONIBILITES: (id: number) => `/api/docteurs/${id}/disponibilites`,
  DOCTEUR_CRENEAUX: (id: number, date: string) => `/api/docteurs/${id}/disponibilites/${date}`,
  NOTIFICATIONS: (userId: number) => `/api/notifications/${userId}`,
  NOTIFICATIONS_UNREAD: (userId: number) => `/api/notifications/unread-count/${userId}`,
  NOTIFICATION_READ: (id: number) => `/api/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: (userId: number) => `/api/notifications/user/${userId}/read-all`,
  NOTIFICATION_DELETE: (id: number) => `/api/notifications/${id}`,

  // Spécialités
  SPECIALITES: '/api/specialites',

  // Rendez-vous
  CREATE_RENDEZVOUS: '/api/rendezvous/create',
  MES_RENDEZVOUS: '/api/patient/rendezvous/mes-rendezvous',
  RENDEZVOUS_DETAIL: (id: number) => `/api/rendezvous/${id}`,
  CANCEL_RENDEZVOUS: (id: number) => `/api/rendezvous/${id}/cancel`,

  // Paiements
  PAIEMENT_STATUS: (transactionId: string) => `/api/paiement/status/${transactionId}`,
  PAYPLUS_WEBHOOK: '/api/payplus/webhook',
};

// ─────────────────────────────────────────────────────────────
// CLIENT API CUSTOM (compatible React Native)
// ─────────────────────────────────────────────────────────────

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestConfig;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseURL: string, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach(cb => cb(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private buildUrl(url: string, params?: Record<string, any>): string {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    if (!params) return fullUrl;
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
  }

  private async makeRequest<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      data,
      params,
      timeout = this.defaultTimeout,
    } = config;

    const fullUrl = this.buildUrl(url, params);
    const mergedHeaders = { ...this.defaultHeaders, ...headers };

    if (this.authToken) {
      mergedHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }


    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: mergedHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        // Refresh automatique sur 401 (token expiré)
        if (response.status === 401 && !url.includes('/api/token/refresh') && !url.includes('/api/login')) {
          return new Promise<ApiResponse<T>>((resolve, reject) => {
            this.addRefreshSubscriber((newToken: string) => {
              resolve(this.makeRequest<T>(url, { ...config, headers: { ...headers, Authorization: `Bearer ${newToken}` } }));
            });

            if (!this.isRefreshing) {
              this.isRefreshing = true;
              import('./secureStorage').then(({ secureStorage }) => {
                secureStorage.getRefreshToken().then(refreshToken => {
                  if (!refreshToken) {
                    this.isRefreshing = false;
                    reject({ response: { data: responseData, status: 401 }, message: 'Session expirée' });
                    return;
                  }
                  this.makeRequest<{ token: string; refresh_token: string }>(
                    API_ENDPOINTS.REFRESH_TOKEN,
                    { method: 'POST', data: { refresh_token: refreshToken } }
                  ).then(async refreshResponse => {
                    const { token: newToken, refresh_token: newRefreshToken } = refreshResponse.data;
                    this.setAuthToken(newToken);
                    await secureStorage.setToken(newToken);
                    await secureStorage.setRefreshToken(newRefreshToken);
                    this.isRefreshing = false;
                    this.onRefreshed(newToken);
                  }).catch(() => {
                    this.isRefreshing = false;
                    secureStorage.clearTokens();
                    this.setAuthToken(null);
                    reject({ response: { data: responseData, status: 401 }, message: 'Session expirée' });
                  });
                });
              });
            }
          });
        }

        const errorMessage = responseData?.message || responseData?.error || response.statusText;
        throw {
          response: { data: responseData, status: response.status, statusText: response.statusText },
          message: errorMessage,
          config,
        };
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
          throw { message: 'Request timeout', config };
      }

      if (error.response) throw error;

      throw { message: error.message || 'Network error', config };
    }
  }

  async get<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'data'>) {
    return this.makeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method' | 'data'>) {
    return this.makeRequest<T>(url, { ...config, data, method: 'POST' });
  }

  async put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method' | 'data'>) {
    return this.makeRequest<T>(url, { ...config, data, method: 'PUT' });
  }

  async delete<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'data'>) {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  async patch<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method' | 'data'>) {
    return this.makeRequest<T>(url, { ...config, data, method: 'PATCH' });
  }

  interceptors = {
    request: { use: (onFulfilled?: any, onRejected?: any) => {} },
    response: { use: (onFulfilled?: any, onRejected?: any) => {} },
  };
}

// ✅ Timeout par défaut : 30 secondes (était 10s — causait des timeouts sur /pharmacies/on-call)
const apiClient = new ApiClient(API_BASE_URL, 30000);

export default apiClient;