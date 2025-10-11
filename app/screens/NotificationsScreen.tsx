import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
  id: string;
  type: 'appointment' | 'status' | 'general';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationsScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  onUpdateUnreadCount?: (count: number) => void;
}

const NotificationsScreen = ({ onNavigate, onUpdateUnreadCount }: NotificationsScreenProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'Rappel de rendez-vous',
      message: 'Votre rendez-vous avec Dr. Marcus Horizon est prévu aujourd\'hui à 14h30. N\'oubliez pas d\'arriver 10 minutes en avance.',
      time: '10:30',
      isRead: false,
    },
    {
      id: '2',
      type: 'status',
      title: 'Mise à jour statut demande',
      message: 'Votre demande de rendez-vous avec Dr. Maria Elena a été confirmée. Vous recevrez une notification 30 minutes avant le rendez-vous.',
      time: '11:45',
      isRead: false,
    },
    {
      id: '3',
      type: 'general',
      title: 'Alerte générale',
      message: 'Nouveaux médecins disponibles dans votre région. Consultez la liste des médecins pour découvrir les nouveaux praticiens.',
      time: '12:30',
      isRead: true,
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Rappel de rendez-vous',
      message: 'N\'oubliez pas votre rendez-vous de demain à 10h00 avec Dr. Stevi Jessi à la clinique centrale.',
      time: '13:15',
      isRead: true,
    },
    {
      id: '5',
      type: 'status',
      title: 'Mise à jour statut demande',
      message: 'Votre paiement de 17000 FCFA a été confirmé avec succès. Votre rendez-vous est maintenant validé.',
      time: '14:00',
      isRead: true,
    },
    {
      id: '6',
      type: 'general',
      title: 'Alerte générale',
      message: 'Campagne de vaccination gratuite disponible dans les pharmacies de votre quartier jusqu\'au 30 juin.',
      time: '14:45',
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mettre à jour le compteur quand les notifications changent
  useEffect(() => {
    if (onUpdateUnreadCount) {
      onUpdateUnreadCount(unreadCount);
    }
  }, [unreadCount, onUpdateUnreadCount]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'calendar';
      case 'status':
        return 'time';
      case 'general':
        return 'notifications';
      default:
        return 'notifications';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Marquer comme lu
    const updatedNotifications = notifications.map((n) =>
      n.id === notification.id ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);

    // Naviguer vers les détails
    onNavigate('notificationDetail', { notification });
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('home')}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={markAllAsRead}
        >
          <Ionicons name="checkmark-done" size={24} color="#0077b6" />
        </TouchableOpacity>
      </View>

      {/* Unread Count */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.isRead && styles.notificationCardUnread,
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View
                style={[
                  styles.iconContainer,
                  !notification.isRead && styles.iconContainerUnread,
                ]}
              >
                <Ionicons
                  name={getIcon(notification.type) as any}
                  size={24}
                  color={!notification.isRead ? '#fff' : '#0077b6'}
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !notification.isRead && styles.notificationTitleUnread,
                    ]}
                  >
                    {notification.title}
                  </Text>
                  {!notification.isRead && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  markAllButton: {
    padding: 5,
  },
  unreadBanner: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#0077b6',
  },
  unreadText: {
    fontSize: 14,
    color: '#0077b6',
    fontWeight: '600',
  },
  notificationsList: {
    padding: 15,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationCardUnread: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#0077b6',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconContainerUnread: {
    backgroundColor: '#0077b6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: '600',
    color: '#000',
  },
  notificationTime: {
    fontSize: 13,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0077b6',
    marginLeft: 8,
  },
});

export default NotificationsScreen;