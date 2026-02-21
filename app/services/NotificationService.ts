// app/services/notificationService.ts
// Service complet pour les notifications patients (React Native)

import apiClient, { API_BASE_URL } from './api.config';

// ─────────────────────────────────────────────────────────────
// 📋 ENDPOINTS NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
export const NOTIFICATION_ENDPOINTS = {
  GET_BY_USER:       (userId: number)  => `/api/notifications/${userId}`,
  UNREAD_COUNT:      (userId: number)  => `/api/notifications/unread-count/${userId}`,
  MARK_READ:         (id: number)      => `/api/notifications/${id}/read`,
  MARK_ALL_READ:     (userId: number)  => `/api/notifications/user/${userId}/read-all`,
  DELETE:            (id: number)      => `/api/notifications/${id}`,
};

// ─────────────────────────────────────────────────────────────
// 🏷️ TYPES
// ─────────────────────────────────────────────────────────────
export type NotificationType = 'appointment' | 'status' | 'payment' | 'general';

export interface ApiNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  recipientRole: string;
  isRead: boolean;
  createdAt: string;       // "2025-06-01 14:30:00"
  readAt: string | null;
  metadata: Record<string, any> | null;
  userId: number | null;
}

export interface NotificationListResponse {
  notifications: ApiNotification[];
  total: number;
  unread: number;
}

export interface UnreadCountResponse {
  count: number;
}

// ─────────────────────────────────────────────────────────────
// 🔧 HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Formate une date ISO en texte relatif lisible
 * "Il y a 5 min", "Il y a 2 h", "Il y a 3 j", etc.
 */
export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';

  const date  = new Date(dateStr.replace(' ', 'T'));
  const now   = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH   = Math.floor(diffMs / 3_600_000);
  const diffJ   = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1)  return 'À l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH   < 24) return `Il y a ${diffH} h`;
  if (diffJ   < 7)  return `Il y a ${diffJ} j`;

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/**
 * Retourne le label lisible du type de notification
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'appointment': return 'Rendez-vous';
    case 'status':      return 'Mise à jour';
    case 'payment':     return 'Paiement';
    case 'general':     return 'Information';
    default:            return 'Notification';
  }
}

/**
 * Retourne la couleur principale du type
 */
export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'appointment': return '#0077b6';
    case 'status':      return '#f59e0b';
    case 'payment':     return '#059669';
    case 'general':     return '#7c3aed';
    default:            return '#0077b6';
  }
}

/**
 * Retourne le nom de l'icône Ionicons selon le type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'appointment': return 'calendar-outline';
    case 'status':      return 'swap-horizontal-outline';
    case 'payment':     return 'card-outline';
    case 'general':     return 'notifications-outline';
    default:            return 'notifications-outline';
  }
}

// ─────────────────────────────────────────────────────────────
// 📡 APPELS API
// ─────────────────────────────────────────────────────────────

/**
 * Récupère les notifications d'un utilisateur
 */
export async function getNotifications(
  userId: number,
  limit: number  = 20,
  offset: number = 0
): Promise<NotificationListResponse> {
  try {
    const response = await apiClient.get<NotificationListResponse>(
      NOTIFICATION_ENDPOINTS.GET_BY_USER(userId),
      { params: { limit, offset } }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ [Notifications] getNotifications:', error.message);
    throw error;
  }
}

/**
 * Récupère le nombre de notifications non lues
 */
export async function getUnreadCount(userId: number): Promise<number> {
  try {
    const response = await apiClient.get<UnreadCountResponse>(
      NOTIFICATION_ENDPOINTS.UNREAD_COUNT(userId)
    );
    return response.data.count ?? 0;
  } catch (error: any) {
    console.error('❌ [Notifications] getUnreadCount:', error.message);
    return 0; // Valeur par défaut silencieuse pour la navbar
  }
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationRead(notificationId: number): Promise<boolean> {
  try {
    await apiClient.post(NOTIFICATION_ENDPOINTS.MARK_READ(notificationId));
    return true;
  } catch (error: any) {
    console.error('❌ [Notifications] markNotificationRead:', error.message);
    return false;
  }
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 */
export async function markAllNotificationsRead(userId: number): Promise<boolean> {
  try {
    await apiClient.post(NOTIFICATION_ENDPOINTS.MARK_ALL_READ(userId));
    return true;
  } catch (error: any) {
    console.error('❌ [Notifications] markAllNotificationsRead:', error.message);
    return false;
  }
}

/**
 * Supprime une notification
 */
export async function deleteNotification(notificationId: number): Promise<boolean> {
  try {
    await apiClient.delete(NOTIFICATION_ENDPOINTS.DELETE(notificationId));
    return true;
  } catch (error: any) {
    console.error('❌ [Notifications] deleteNotification:', error.message);
    return false;
  }
}