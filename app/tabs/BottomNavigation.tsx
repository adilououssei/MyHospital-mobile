import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  unreadCount?: number;
}

const BottomNavigation = ({ currentScreen, onNavigate, unreadCount = 0 }: BottomNavigationProps) => {
  const { colors } = useApp();

  const navItems = [
    { screen: 'home',        icon: 'home',           iconOutline: 'home-outline' },
    { screen: 'messages',    icon: 'chatbubble',     iconOutline: 'chatbubble-outline' },
    { screen: 'chatbot',     icon: 'hardware-chip',  iconOutline: 'hardware-chip-outline' }, // ← IA
    { screen: 'appointments',icon: 'calendar',       iconOutline: 'calendar-outline' },
    { screen: 'profile',     icon: 'person',         iconOutline: 'person-outline' },
  ];

  return (
    <View style={[styles.bottomNav, {
      backgroundColor: colors.card,
      borderTopColor: '#ccc',
    }]}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;
        const isChatbot = item.screen === 'chatbot';

        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => onNavigate(item.screen)}>
            {isChatbot ? (
              // Bouton IA mis en valeur
              <View style={[styles.chatbotBtn, isActive && styles.chatbotBtnActive]}>
                <Ionicons
                  name={isActive ? item.icon as any : item.iconOutline as any}
                  size={22}
                  color={isActive ? '#fff' : '#0077b6'}
                />
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? item.icon as any : item.iconOutline as any}
                  size={24}
                  color={isActive ? '#0077b6' : colors.subText}
                />
              </View>
            )}
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
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: { padding: 5, alignItems: 'center' },
  iconContainer: { position: 'relative' },
  // Bouton IA spécial
  chatbotBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#0077b6',
  },
  chatbotBtnActive: {
    backgroundColor: '#0077b6',
    borderColor: '#0077b6',
  },
});

export default BottomNavigation;