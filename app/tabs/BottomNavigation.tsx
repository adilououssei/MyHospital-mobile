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
    { screen: 'home', icon: 'home', iconOutline: 'home-outline' },
    { screen: 'messages', icon: 'chatbubble', iconOutline: 'chatbubble-outline' },
    { screen: 'appointments', icon: 'calendar', iconOutline: 'calendar-outline' },
    { screen: 'profile', icon: 'person', iconOutline: 'person-outline' },
  ];

  return (
    <View style={[styles.bottomNav, { 
      backgroundColor: colors.card, 
      borderTopColor: colors.border 
    }]}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;
        
        return (
          <TouchableOpacity 
            key={item.screen}
            style={styles.navItem}
            onPress={() => onNavigate(item.screen)}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name={isActive ? item.icon as any : item.iconOutline as any}
                size={24} 
                color={isActive ? '#0077b6' : colors.subText} 
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingBottom: 50,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    padding: 5,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    borderWidth: 1,
    borderColor: '#fff',
  },
});

export default BottomNavigation;