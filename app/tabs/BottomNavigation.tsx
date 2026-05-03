import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  unreadCount?: number;
}

const navItems = [
  { screen: 'home',         icon: 'home',            iconOutline: 'home-outline',            label: 'Accueil' },
  { screen: 'chatbot',      icon: 'chatbubbles',      iconOutline: 'chatbubbles-outline',      label: 'IA' },
  { screen: 'appointments', icon: 'calendar',         iconOutline: 'calendar-outline',         label: 'Agenda' },
  { screen: 'profile',      icon: 'person',           iconOutline: 'person-outline',           label: 'Profil' },
];

const BottomNavigation = ({ currentScreen, onNavigate, unreadCount = 0 }: BottomNavigationProps) => {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNav, {
      backgroundColor: colors.card,
      borderTopColor: colors.border,
      paddingBottom: Math.max(insets.bottom, 8),
    }]}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;

        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => onNavigate(item.screen)}>
            <Ionicons
              name={isActive ? item.icon as any : item.iconOutline as any}
              size={24}
              color={isActive ? '#0077b6' : colors.subText}
            />
            <Text style={[styles.label, { color: isActive ? '#0077b6' : colors.subText }]}>
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
    paddingTop: 8,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default BottomNavigation;
