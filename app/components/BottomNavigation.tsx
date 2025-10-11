import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const BottomNavigation = ({ currentScreen, onNavigate }: BottomNavigationProps) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => onNavigate('home')}
      >
        <Ionicons 
          name={currentScreen === 'home' ? 'home' : 'home-outline'} 
          size={24} 
          color={currentScreen === 'home' ? '#00B894' : '#999'} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => onNavigate('messages')}
      >
        <Ionicons 
          name={currentScreen === 'messages' ? 'chatbubble' : 'chatbubble-outline'} 
          size={24} 
          color={currentScreen === 'messages' ? '#00B894' : '#999'} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => onNavigate('appointments')}
      >
        <Ionicons 
          name={currentScreen === 'appointments' ? 'calendar' : 'calendar-outline'} 
          size={24} 
          color={currentScreen === 'appointments' ? '#00B894' : '#999'} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => onNavigate('profile')}
      >
        <Ionicons 
          name={currentScreen === 'profile' ? 'person' : 'person-outline'} 
          size={24} 
          color={currentScreen === 'profile' ? '#00B894' : '#999'} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    padding: 5,
  },
});

export default BottomNavigation;