import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

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
  const { theme, language, colors } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: '1',
      icon: 'heart-outline',
      label: 'Mes Favoris',
      iconColor: '#0077b6',
      bgColor: '#e4f4fcff',
      screen: 'favorites',
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
      icon: 'language-outline',
      label: 'Langue',
      iconColor: '#0077b6',
      bgColor: '#e4f4fcff',
      screen: 'language',
    },
    {
      id: '4',
      icon: theme === 'dark' ? 'moon' : 'moon-outline',
      label: `Mode ${theme === 'dark' ? 'sombre' : 'clair'}`,
      iconColor: '#0077b6',
      bgColor: '#e4f4fcff',
      screen: 'theme',
    },
    {
      id: '5',
      icon: 'card-outline',
      label: 'Moyen de Paiement',
      iconColor: '#0077b6',
      bgColor: '#e4f4fcff',
      screen: 'savedPaymentMethods',
    },
    {
      id: '6',
      icon: 'help-circle-outline',
      label: 'FAQs',
      iconColor: '#0077b6',
      bgColor: '#e4f4fcff',
      screen: 'faqs',
    },
    {
      id: '7',
      icon: 'log-out-outline',
      label: 'Déconnexion',
      iconColor: '#FF6B6B',
      bgColor: '#FFE8E8',
      isLogout: true,
    },
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    onNavigate('welcome');
  };

  const MenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.card }]}
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
            { color: colors.text },
            item.isLogout && styles.menuItemTextLogout,
          ]}
        >
          {item.label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.subText} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#0077b6', '#0077b6']}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Menu Icon with Dropdown */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenuModal(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Profile Image */}
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={() => onNavigate('editProfile')}
          >
            <View style={styles.profileImageWrapper}>
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={50} color="#0077b6" />
              </View>
              <View style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* User Name */}
          <Text style={styles.userName}>Amelia Renata</Text>

          {/* Health Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="heart" size={24} color="#fff" />
              </View>
              <Text style={styles.statLabel}>Fréquence{'\n'}cardiaque</Text>
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
        </SafeAreaView>
      </LinearGradient>

      {/* Menu Items */}
      <ScrollView
        style={[styles.menuContainer, { backgroundColor: colors.card }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate('home')}
        >
          <Ionicons name="home-outline" size={24} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate('appointments')}
        >
          <Ionicons name="calendar-outline" size={24} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#0077b6" />
        </TouchableOpacity>
      </View>

      {/* Menu Modal (Settings & Logout) */}
      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableOpacity
          style={styles.menuModalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={[styles.menuModalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.menuModalItem}
              onPress={() => {
                setShowMenuModal(false);
                onNavigate('settings');
              }}
            >
              <Ionicons name="settings-outline" size={22} color="#0077b6" />
              <Text style={[styles.menuModalItemText, { color: colors.text }]}>Paramètres</Text>
            </TouchableOpacity>

            <View style={[styles.menuModalDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.menuModalItem}
              onPress={() => {
                setShowMenuModal(false);
                setShowLogoutModal(true);
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
              <Text style={[styles.menuModalItemText, { color: '#FF6B6B' }]}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out-outline" size={40} color="#0077b6" />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Êtes-vous sûr de vouloir</Text>
            <Text style={[styles.modalTitle, { color: colors.text }]}>vous déconnecter ?</Text>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 30,
  },
  safeArea: {
    paddingTop: 10,
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 30,
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
    textAlign: 'center',
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
    marginTop: -25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  menuContent: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 25,
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
    fontWeight: '500',
  },
  menuItemTextLogout: {
    color: '#FF6B6B',
  },
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
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 20,
  },
  menuModalContent: {
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuModalItemText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 15,
  },
  menuModalDivider: {
    height: 1,
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    borderRadius: 25,
    padding: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#e4f4fcff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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