import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string, params?: any) => void;
}

const PROTECTED_SCREENS = ['appointments', 'profile'];

const navItems = [
  { screen: 'home',         icon: 'home',            iconOutline: 'home-outline',            label: 'Accueil' },
  { screen: 'chatbot',      icon: 'chatbubbles',      iconOutline: 'chatbubbles-outline',      label: 'IA' },
  { screen: 'appointments', icon: 'calendar',         iconOutline: 'calendar-outline',         label: 'Agenda' },
  { screen: 'profile',      icon: 'person',           iconOutline: 'person-outline',           label: 'Profil' },
];

const BottomNavigation = ({ currentScreen, onNavigate }: BottomNavigationProps) => {
  const { unreadCount } = useNotifications();
  const { isAuthenticated } = useAuth();

  const handleNav = (screen: string) => {
    if (!isAuthenticated && PROTECTED_SCREENS.includes(screen)) {
      onNavigate('login', { returnTo: screen });
      return;
    }
    onNavigate(screen);
  };

  return (
    <View style={[styles.bottomNav, {
      backgroundColor: '#fff',
      borderTopColor: '#e5e7eb',
    }]}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;

        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => handleNav(item.screen)}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name={isActive ? item.icon as any : item.iconOutline as any}
                size={26}
                color={isActive ? '#1a56db' : '#6b7280'}
              />
              {item.screen === 'home' && unreadCount > 0 && (
                <View style={styles.navBadge}>
                  <Text style={styles.navBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color: isActive ? '#1a56db' : '#6b7280' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 50,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  iconWrapper: {
    position: 'relative',
  },
  navBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF6B6B',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  navBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});

export default BottomNavigation;
