import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  iconColor: string;
  bgColor: string;
  isLogout?: boolean;
  screen?: string;
}

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const ProfileScreen = ({ onNavigate }: ProfileScreenProps) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: '1',
      icon: 'heart-outline',
      label: 'Mes Favoris',
      iconColor: '#0077b6',
      bgColor: '#e4f4fcff',
    },
    {
      id: '2',
      icon: 'calendar-outline',
      label: 'Rendez-vous',
      iconColor: '#0077b6',
      bgColor: '#e4f4fcff',
      screen: 'appointments',
    },
    {
      id: '3',
      icon: 'card-outline',
      label: 'Moyen de Paiement',
      iconColor: '#0077b6',
      bgColor: '#e4f4fcff',
    },
    {
      id: '4',
      icon: 'help-circle-outline',
      label: 'FAQs',
      iconColor: '#0077b6',
      bgColor: '#e4f4fcff',
    },
    {
      id: '5',
      icon: 'log-out-outline',
      label: 'Déconnexion',
      iconColor: '#FF6B6B',
      bgColor: '#FFE8E8',
      isLogout: true,
    },
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    // Logique de déconnexion ici
    console.log('Utilisateur déconnecté');
  };

  const MenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        if (item.isLogout) {
          setShowLogoutModal(true);
        } else if (item.screen) {
          onNavigate(item.screen);
        } else {
          console.log(`Navigation vers ${item.label}`);
        }
      }}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: item.bgColor }]}>
          <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
        </View>
        <Text
          style={[
            styles.menuItemText,
            item.isLogout && styles.menuItemTextLogout,
          ]}
        >
          {item.label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0077b6', '#0077b6']}
        style={styles.headerGradient}
      >
        {/* Menu Icon */}
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImageWrapper}>
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={50} color="#0077b6" />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Name */}
        <Text style={styles.userName}>Amelia Renata</Text>

        {/* Health Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="heart" size={24} color="#fff" />
            </View>
            <Text style={styles.statLabel1}>Fréquence cardiaque</Text>
            <Text style={styles.statValue}>215bpm</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame" size={24} color="#fff" />
            </View>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>756cal</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="barbell" size={24} color="#fff" />
            </View>
            <Text style={styles.statLabel}>Poids</Text>
            <Text style={styles.statValue}>103lbs</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <ScrollView
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigate('home')}
        >
          <Ionicons name="home-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigate('appointments')}
        >
          <Ionicons name="calendar-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#0077b6" />
        </TouchableOpacity>
      </View>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out-outline" size={40} color="#0077b6" />
            </View>

            <Text style={styles.modalTitle}>Êtes-vous sûr de vouloir</Text>
            <Text style={styles.modalTitle}>vous déconnecter ?</Text>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowLogoutModal(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingTop: 15,
    paddingBottom: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 10,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0077b6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  statLabel1: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
    marginLeft: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#fff',
    opacity: 0.3,
    marginHorizontal: 10,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  menuItemTextLogout: {
    color: '#FF6B6B',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingBottom: 50,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F9F5',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#0077b6',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;