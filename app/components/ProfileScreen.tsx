// app/screens/ProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, useAuth } from '../context/AppContext';
import BottomNavigation from '../tabs/BottomNavigation';
import {
  PatientProfile, getProfileByUserId,
  formatTaille, getGenreLabel, getImcLabel,
} from '../services/profileService';
import { API_BASE_URL } from '../services/api.config';

interface ProfileScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

const ProfileScreen = ({ onNavigate }: ProfileScreenProps) => {
  const { colors, isDarkMode, language } = useApp();
  const { user, logout }                 = useAuth();

  const [profile, setProfile]                 = useState<PatientProfile | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenuModal, setShowMenuModal]     = useState(false);
  const [unreadCount, setUnreadCount]         = useState(0);

  useEffect(() => { if (user?.id) loadProfile(); }, [user?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfileByUserId(user!.id);
      setProfile(data);
    } catch (err: any) {
      console.error('❌ loadProfile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    onNavigate('welcome');
  };

  const photoUrl = profile?.personal_info.photo
    ? `${API_BASE_URL}${profile.personal_info.photo}`
    : null;

  // ── Labels langue pour affichage dans le menu ──────────────
  const LANG_LABELS: Record<string, string> = {
    fr: '🇫🇷 Français', en: '🇬🇧 English', es: '🇪🇸 Español',
    de: '🇩🇪 Deutsch',  ar: '🇸🇦 عربي',    zh: '🇨🇳 中文',
  };

  // ── Menu items (COMPLET avec Langue + Apparence) ───────────
  const menuItems = [
    {
      id: '1', icon: 'person-outline',
      label: 'Modifier le profil', screen: 'editProfile',
      iconColor: '#0077b6', bgColor: '#e4f4fc',
    },
    {
      id: '2', icon: 'heart-outline',
      label: 'Mes Favoris', screen: 'favorites',
      iconColor: '#0077b6', bgColor: '#e4f4fc',
    },
    {
      id: '3', icon: 'calendar-outline',
      label: 'Rendez-vous', screen: 'appointments',
      iconColor: '#0077b6', bgColor: '#e4f4fc',
    },
    {
      id: '4', icon: 'document-text-outline',
      label: 'Mes Ordonnances', screen: 'prescriptions',
      iconColor: '#0077b6', bgColor: '#e4f4fc',
    },
    {
      id: '5', icon: 'notifications-outline',
      label: 'Notifications', screen: 'notifications',
      iconColor: '#0077b6', bgColor: '#e4f4fc',
    },
    {
      // ✅ LANGUE — affiche la langue actuelle en sous-titre
      id: '6', icon: 'language-outline',
      label: 'Langue', screen: 'language',
      iconColor: '#0077b6', bgColor: '#e4f4fc',
      badge: LANG_LABELS[language] ?? '🇫🇷 Français',
    },
    {
      // ✅ APPARENCE — affiche le mode actuel en sous-titre
      id: '7', icon: isDarkMode ? 'moon' : 'sunny-outline',
      label: 'Apparence', screen: 'theme',
      iconColor: '#0077b6', bgColor: '#e4f4fc',
      badge: isDarkMode ? 'Mode sombre' : 'Mode clair',
    },
    {
      id: '8', icon: 'card-outline',
      label: 'Moyen de Paiement', screen: 'savedPaymentMethods',
      iconColor: '#0077b6', bgColor: '#e4f4fc',
    },
    {
      id: '9', icon: 'help-circle-outline',
      label: 'FAQs', screen: 'faqs',
      iconColor: '#0077b6', bgColor: '#e4f4fc',
    },
    {
      id: '10', icon: 'log-out-outline',
      label: 'Déconnexion', screen: null,
      iconColor: '#FF6B6B', bgColor: '#FFE8E8',
      isLogout: true,
    },
  ];

  // ── Item de menu ───────────────────────────────────────────
  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: colors.card }]}
      onPress={() => {
        if (item.isLogout)  { setShowLogoutModal(true); return; }
        if (item.screen)    onNavigate(item.screen);
      }}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: item.bgColor }]}>
          <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
        </View>
        <View>
          <Text style={[styles.menuItemText, { color: item.isLogout ? '#FF6B6B' : colors.text }]}>
            {item.label}
          </Text>
          {/* Sous-titre pour Langue et Apparence */}
          {'badge' in item && item.badge ? (
            <Text style={[styles.menuItemBadge, { color: colors.subText }]}>{item.badge}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.subText} />
    </TouchableOpacity>
  );

  // ── Chargement ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0077b6" />
      </View>
    );
  }

  const poids    = profile?.health_info.poids  ?? null;
  const taille   = profile?.health_info.taille ?? null;
  const imc      = profile?.health_info.imc    ?? null;
  const fullName = profile?.personal_info.full_name
    ?? `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Header gradient ──────────────────────────────── */}
      <LinearGradient colors={['#0077b6', '#005a8c']} style={styles.headerGradient}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>

          <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenuModal(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity style={styles.profileImageContainer} onPress={() => onNavigate('editProfile')}>
            <View style={styles.profileImageWrapper}>
              {photoUrl
                ? <Image source={{ uri: photoUrl }} style={styles.profileImage} />
                : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={50} color="#0077b6" />
                  </View>
                )}
              <View style={styles.editButton}>
                <Ionicons name="pencil" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userEmail}>{profile?.personal_info.email ?? user?.email}</Text>

          {/* Stats santé */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={22} color="#fff" style={styles.statIcon} />
              <Text style={styles.statLabel}>Poids</Text>
              <Text style={styles.statValue}>{poids ? `${poids} kg` : '--'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="resize-outline" size={22} color="#fff" style={styles.statIcon} />
              <Text style={styles.statLabel}>Taille</Text>
              <Text style={styles.statValue}>{taille ? formatTaille(taille) : '--'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="fitness-outline" size={22} color="#fff" style={styles.statIcon} />
              <Text style={styles.statLabel}>IMC</Text>
              <Text style={styles.statValue}>{imc ? imc.toString() : '--'}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Menu + carte santé ───────────────────────────── */}
      <ScrollView
        style={[styles.menuContainer, { backgroundColor: colors.card }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        {profile && (
          <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.infoCardTitle, { color: colors.text }]}>Informations de santé</Text>
            {[
              { icon: 'water-outline',       label: 'Groupe sanguin', value: profile.health_info.groupe_sanguin ?? 'Non renseigné' },
              { icon: 'person-outline',      label: 'Genre',          value: getGenreLabel(profile.health_info.genre) },
              { icon: 'calendar-outline',    label: 'Âge',            value: profile.health_info.age ? `${profile.health_info.age} ans` : 'Non renseigné' },
              ...(imc ? [{ icon: 'fitness-outline', label: 'Statut IMC', value: getImcLabel(imc) }] : []),
              { icon: 'stats-chart-outline', label: 'Rendez-vous',    value: String(profile.stats.appointments_count) },
            ].map(row => (
              <View key={row.label} style={styles.infoRow}>
                <Ionicons name={row.icon as any} size={18} color="#0077b6" />
                <Text style={[styles.infoLabel, { color: colors.subText }]}>{row.label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}

        {menuItems.map(renderMenuItem)}
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavigation currentScreen="profile" onNavigate={onNavigate} unreadCount={unreadCount} />

      {/* ── Modal menu ⋮ ─────────────────────────────────── */}
      <Modal visible={showMenuModal} transparent animationType="fade" onRequestClose={() => setShowMenuModal(false)}>
        <TouchableOpacity style={styles.menuModalOverlay} activeOpacity={1} onPress={() => setShowMenuModal(false)}>
          <View style={[styles.menuModalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.menuModalItem} onPress={() => { setShowMenuModal(false); onNavigate('settings'); }}>
              <Ionicons name="settings-outline" size={22} color="#0077b6" />
              <Text style={[styles.menuModalItemText, { color: colors.text }]}>Paramètres</Text>
            </TouchableOpacity>
            <View style={[styles.menuModalDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.menuModalItem} onPress={() => { setShowMenuModal(false); setShowLogoutModal(true); }}>
              <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
              <Text style={[styles.menuModalItemText, { color: '#FF6B6B' }]}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Modal logout ─────────────────────────────────── */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out-outline" size={40} color="#0077b6" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Êtes-vous sûr de vouloir</Text>
            <Text style={[styles.modalTitle, { color: colors.text }]}>vous déconnecter ?</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowLogoutModal(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1 },
  headerGradient: { paddingBottom: 30 },
  safeArea:       { paddingTop: 10 },
  menuButton:     { position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 5, marginTop: 25 },

  profileImageContainer: { alignItems: 'center', marginTop: 30 },
  profileImageWrapper:   { position: 'relative' },
  profileImage:          { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
  profileImagePlaceholder: {
    width: 100, height: 100, backgroundColor: '#fff',
    borderRadius: 50, justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#fff',
  },
  editButton: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#0077b6', width: 30, height: 30,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },

  userName:  { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginTop: 12 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 20 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingTop: 5 },
  statItem:       { alignItems: 'center', flex: 1 },
  statIcon:       { marginBottom: 6 },
  statLabel:      { fontSize: 11, color: '#fff', opacity: 0.85, marginBottom: 3, textAlign: 'center' },
  statValue:      { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  statDivider:    { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },

  menuContainer: { flex: 1, marginTop: -25, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  menuContent:   { paddingTop: 20 },

  infoCard:      { marginHorizontal: 15, marginBottom: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  infoCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  infoRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 8 },
  infoLabel:     { flex: 1, fontSize: 14 },
  infoValue:     { fontSize: 14, fontWeight: '600' },

  menuItem:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 20, marginBottom: 1 },
  menuItemLeft:       { flexDirection: 'row', alignItems: 'center' },
  menuIconContainer:  { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuItemText:       { fontSize: 15, fontWeight: '500' },
  // ✅ Sous-titre (badge) pour Langue et Apparence
  menuItemBadge:      { fontSize: 12, marginTop: 2 },

  menuModalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 70, paddingRight: 20 },
  menuModalContent:  { borderRadius: 12, paddingVertical: 8, minWidth: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  menuModalItem:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  menuModalItemText: { fontSize: 15, fontWeight: '500', marginLeft: 14 },
  menuModalDivider:  { height: 1, marginVertical: 4 },

  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  modalContent:       { borderRadius: 25, padding: 30, width: '100%', alignItems: 'center' },
  modalIconContainer: { width: 80, height: 80, backgroundColor: '#e4f4fc', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle:         { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  logoutButton:       { backgroundColor: '#0077b6', paddingVertical: 14, borderRadius: 25, marginTop: 25, width: '100%', alignItems: 'center' },
  logoutButtonText:   { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelButton:       { marginTop: 12, paddingVertical: 8 },
  cancelButtonText:   { color: '#0077b6', fontSize: 15, fontWeight: '500' },
});

export default ProfileScreen;