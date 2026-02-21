// app/screens/NotificationsScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../tabs/ScreenHeader';

import {
  ApiNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  formatRelativeDate,
  getNotificationColor,
  getNotificationIcon,
  getNotificationTypeLabel,
} from '../services/NotificationService';

interface NotificationsScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  onUpdateUnreadCount?: (count: number) => void;
}

const NotificationsScreen = ({
  onNavigate,
  onUpdateUnreadCount,
}: NotificationsScreenProps) => {
  const { colors, user } = useApp();

  const [notifications, setNotifications]   = useState<ApiNotification[]>([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [offset, setOffset]                 = useState(0);
  const [hasMore, setHasMore]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  const LIMIT = 20;

  // ── Compteur non-lues ────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    onUpdateUnreadCount?.(unreadCount);
  }, [unreadCount]);

  // ── Chargement initial ───────────────────────────────────────
  const loadNotifications = useCallback(async (reset = false) => {
    if (!user?.id) return;

    try {
      setError(null);
      const currentOffset = reset ? 0 : offset;
      const response      = await getNotifications(user.id, LIMIT, currentOffset);

      if (reset) {
        setNotifications(response.notifications);
        setOffset(LIMIT);
      } else {
        setNotifications((prev) => [...prev, ...response.notifications]);
        setOffset((prev) => prev + LIMIT);
      }

      setHasMore(response.notifications.length === LIMIT);
    } catch (err: any) {
      setError('Impossible de charger les notifications.');
      console.error('❌ loadNotifications:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [user?.id, offset]);

  useEffect(() => {
    loadNotifications(true);
  }, []);

  // ── Pull-to-refresh ──────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(true);
  };

  // ── Pagination ───────────────────────────────────────────────
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadNotifications(false);
    }
  };

  // ── Marquer comme lu et ouvrir le détail ─────────────────────
  const handlePress = async (notification: ApiNotification) => {
    if (!notification.isRead) {
      const ok = await markNotificationRead(notification.id);
      if (ok) {
        setNotifications((prev) =>
          prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      }
    }
    onNavigate('notificationDetail', { notification });
  };

  // ── Tout marquer comme lu ────────────────────────────────────
  const handleMarkAllRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    const ok = await markAllNotificationsRead(user.id);
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  // ── Supprimer (long press) ───────────────────────────────────
  const handleLongPress = (notification: ApiNotification) => {
    Alert.alert(
      'Supprimer la notification',
      'Voulez-vous supprimer cette notification ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteNotification(notification.id);
            if (ok) {
              setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
            }
          },
        },
      ]
    );
  };

  // ── Rendu d'une carte ────────────────────────────────────────
  const renderItem = ({ item }: { item: ApiNotification }) => {
    const color     = getNotificationColor(item.type);
    const iconName  = getNotificationIcon(item.type);
    const typeLabel = getNotificationTypeLabel(item.type);
    const dateText  = formatRelativeDate(item.createdAt);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.card },
          !item.isRead && styles.cardUnread,
        ]}
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.75}
      >
        {/* Icône */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: item.isRead ? color + '18' : color },
        ]}>
          <Ionicons
            name={iconName as any}
            size={22}
            color={item.isRead ? color : '#fff'}
          />
        </View>

        {/* Contenu */}
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text
              style={[
                styles.cardTitle,
                { color: colors.text },
                !item.isRead && styles.cardTitleUnread,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          <Text
            style={[styles.cardMessage, { color: colors.subText }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>

          <View style={styles.cardFooter}>
            <View style={[styles.typeBadge, { backgroundColor: color + '18' }]}>
              <Text style={[styles.typeBadgeText, { color }]}>{typeLabel}</Text>
            </View>
            <Text style={[styles.dateText, { color: colors.subText }]}>
              {dateText}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.subText} />
      </TouchableOpacity>
    );
  };

  // ── Footer de liste (chargement) ─────────────────────────────
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#0077b6" />
      </View>
    );
  };

  // ── Séparateur ───────────────────────────────────────────────
  const renderSeparator = () => <View style={styles.separator} />;

  // ── État vide ────────────────────────────────────────────────
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="notifications-off-outline" size={40} color="#cbd5e0" />
        </View>
        <Text style={styles.emptyTitle}>Aucune notification</Text>
        <Text style={styles.emptySubtitle}>
          Vous n'avez pas encore reçu de notification.
        </Text>
      </View>
    );
  };

  // ── État d'erreur ─────────────────────────────────────────────
  if (error && notifications.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title="Notifications"
          onBack={() => onNavigate('home')}
          rightIcon="checkmark-done"
          onRightPress={handleMarkAllRead}
        />
        <View style={styles.emptyState}>
          <Ionicons name="wifi-outline" size={48} color="#cbd5e0" />
          <Text style={styles.emptyTitle}>Connexion impossible</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => { setLoading(true); loadNotifications(true); }}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Chargement initial ────────────────────────────────────────
  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title="Notifications"
          onBack={() => onNavigate('home')}
          rightIcon="checkmark-done"
          onRightPress={handleMarkAllRead}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0077b6" />
          <Text style={[styles.loadingText, { color: colors.subText }]}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Vue principale ────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Notifications"
        onBack={() => onNavigate('home')}
        rightIcon="checkmark-done"
        onRightPress={handleMarkAllRead}
      />

      {/* Bandeau non-lues */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="ellipse" size={8} color="#0077b6" style={{ marginRight: 6 }} />
          <Text style={styles.unreadBannerText}>
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllBtnText}>Tout lire</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && { flex: 1 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0077b6']}
            tintColor="#0077b6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Bandeau non-lues
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  unreadBannerText: { flex: 1, fontSize: 13, color: '#0077b6', fontWeight: '600' },
  markAllBtn: {
    backgroundColor: '#0077b6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  markAllBtnText: { fontSize: 12, color: '#fff', fontWeight: '600' },

  // Liste
  listContent: { padding: 16, paddingBottom: 30 },
  separator:   { height: 8 },

  // Carte
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#0077b6',
    backgroundColor: '#F0F9FF',
  },

  // Icône
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },

  // Contenu
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  cardTitleUnread: { fontWeight: '700' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#0077b6',
    marginLeft: 8, flexShrink: 0,
  },
  cardMessage: { fontSize: 13, lineHeight: 18, marginBottom: 8 },

  // Footer de carte
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  dateText: { fontSize: 11 },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  loadMoreContainer: { paddingVertical: 16, alignItems: 'center' },

  // Empty
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  emptyIconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#f7fafc',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17, fontWeight: '600', color: '#4a5568', marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14, color: '#a0aec0', textAlign: 'center', lineHeight: 20,
  },

  // Retry
  retryButton: {
    marginTop: 20, backgroundColor: '#0077b6',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25,
  },
  retryButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default NotificationsScreen;