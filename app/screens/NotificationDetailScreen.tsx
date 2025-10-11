import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface NotificationDetailScreenProps {
  onNavigate: (screen: string) => void;
  notification?: any;
}

const NotificationDetailScreen = ({
  onNavigate,
  notification,
}: NotificationDetailScreenProps) => {
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

  const getIconColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return '#0077b6';
      case 'status':
        return '#FFA500';
      case 'general':
        return '#0077b6';
      default:
        return '#0077b6';
    }
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('fr-FR', options);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('notifications')}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Icon and Type */}
          <View style={styles.iconSection}>
            <View
              style={[
                styles.largeIconContainer,
                { backgroundColor: getIconColor(notification?.type) + '20' },
              ]}
            >
              <Ionicons
                name={getIcon(notification?.type) as any}
                size={50}
                color={getIconColor(notification?.type)}
              />
            </View>
            <Text style={styles.typeLabel}>
              {notification?.type === 'appointment'
                ? 'Rendez-vous'
                : notification?.type === 'status'
                ? 'Mise à jour'
                : 'Information'}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.notificationTitle}>{notification?.title}</Text>

          {/* Date & Time */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.dateTimeText}>{getCurrentDate()}</Text>
            </View>
            <View style={styles.dateTimeRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.dateTimeText}>{notification?.time}</Text>
            </View>
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Message</Text>
            <Text style={styles.messageText}>{notification?.message}</Text>
          </View>

          {/* Actions */}
          {notification?.type === 'appointment' && (
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsLabel}>Actions rapides</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onNavigate('appointments')}
              >
                <Ionicons name="calendar" size={20} color="#0077b6" />
                <Text style={styles.actionButtonText}>
                  Voir mes rendez-vous
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="map" size={20} color="#0077b6" />
                <Text style={styles.actionButtonText}>Itinéraire</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="call" size={20} color="#0077b6" />
                <Text style={styles.actionButtonText}>Appeler le médecin</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}

          {notification?.type === 'status' && (
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsLabel}>Actions rapides</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onNavigate('appointments')}
              >
                <Ionicons name="document-text" size={20} color="#0077b6" />
                <Text style={styles.actionButtonText}>
                  Voir les détails
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}

          {notification?.type === 'general' && (
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsLabel}>En savoir plus</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onNavigate('home')}
              >
                <Ionicons name="information-circle" size={20} color="#0077b6" />
                <Text style={styles.actionButtonText}>
                  Plus d'informations
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onNavigate('notifications')}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
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
  menuButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  largeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  notificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#666',
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8E8',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

export default NotificationDetailScreen;