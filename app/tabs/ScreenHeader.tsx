import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  showNotification?: boolean;
  unreadCount?: number;
  onNotificationPress?: () => void;
}

const ScreenHeader = ({ 
  title, 
  onBack, 
  rightIcon,
  onRightPress,
  showNotification,
  unreadCount = 0,
  onNotificationPress
}: ScreenHeaderProps) => {
  const { colors } = useApp();

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {/* Left Button (Back or Empty) */}
      {onBack ? (
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {/* Right Button (Notification, Custom Icon, or Empty) */}
      {showNotification ? (
        <TouchableOpacity style={styles.button} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ) : rightIcon ? (
        <TouchableOpacity style={styles.button} onPress={onRightPress}>
          <Ionicons name={rightIcon as any} size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  button: {
    padding: 5,
    position: 'relative',
  },
  placeholder: {
    width: 34,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default ScreenHeader;