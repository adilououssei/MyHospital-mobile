import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useApp } from '../context/AppContext';
import { BIOMETRIC_LOCK_KEY } from '../constants/security';

interface PrivacySecurityScreenProps {
    onNavigate: (screen: string) => void;
}

const PrivacySecurityScreen = ({ onNavigate }: PrivacySecurityScreenProps) => {
    const { colors } = useApp();

    const [faceId, setFaceId] = useState(false);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [profileVisibility, setProfileVisibility] = useState(true);
    const [shareHealthData, setShareHealthData] = useState(false);
    const [locationTracking, setLocationTracking] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem(BIOMETRIC_LOCK_KEY).then(v => setFaceId(v === 'true'));
    }, []);

    const handleToggleFaceId = async (value: boolean) => {
        if (!value) {
            setFaceId(false);
            await AsyncStorage.setItem(BIOMETRIC_LOCK_KEY, 'false');
            return;
        }

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
            Alert.alert(
                'Non disponible',
                "Aucune empreinte digitale ou Face ID n'est configuré sur cet appareil. Ajoutez-en un dans les réglages de votre téléphone pour activer cette option."
            );
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Confirmez votre identité',
        });
        if (result.success) {
            setFaceId(true);
            await AsyncStorage.setItem(BIOMETRIC_LOCK_KEY, 'true');
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Supprimer le compte',
            'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès');
                    },
                },
            ]
        );
    };

    const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const ToggleItem = ({
        icon,
        title,
        subtitle,
        value,
        onValueChange
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
    }) => (
        <View style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon as any} size={22} color="#1a56db" />
                </View>
                <View style={styles.settingsItemText}>
                    <Text style={[styles.settingsItemTitle, { color: colors.text }]}>{title}</Text>
                    {subtitle && (
                        <Text style={[styles.settingsItemSubtitle, { color: colors.subText }]}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: '#1a56db' }}
                thumbColor="#fff"
            />
        </View>
    );

    const ActionItem = ({
        icon,
        title,
        subtitle,
        onPress,
        iconColor = '#1a56db'
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        onPress: () => void;
        iconColor?: string;
    }) => (
        <TouchableOpacity
            style={styles.settingsItem}
            onPress={onPress}
        >
            <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon as any} size={22} color={iconColor} />
                </View>
                <View style={styles.settingsItemText}>
                    <Text style={[styles.settingsItemTitle, { color: colors.text }]}>{title}</Text>
                    {subtitle && (
                        <Text style={[styles.settingsItemSubtitle, { color: colors.subText }]}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => onNavigate('settings')}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Confidentialité et Sécurité
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Sécurité */}
                <SettingsSection title="SÉCURITÉ DU COMPTE">
                    <ActionItem
                        icon="lock-closed-outline"
                        title="Changer le mot de passe"
                        subtitle="Modifier votre mot de passe actuel"
                        onPress={() => onNavigate('changePassword')}
                    />
                    <ToggleItem
                        icon="finger-print"
                        title="Authentification biométrique"
                        subtitle="Utiliser Face ID ou empreinte digitale"
                        value={faceId}
                        onValueChange={handleToggleFaceId}
                    />
                </SettingsSection>

                {/* Confidentialité */}
                <SettingsSection title="CONFIDENTIALITÉ DES DONNÉES">
                    <ToggleItem
                        icon="fitness-outline"
                        title="Partager les données de santé"
                        subtitle="Avec les professionnels de santé autorisés"
                        value={shareHealthData}
                        onValueChange={setShareHealthData}
                    />
                    <ToggleItem
                        icon="location-outline"
                        title="Suivi de localisation"
                        subtitle="Pour trouver les hôpitaux à proximité"
                        value={locationTracking}
                        onValueChange={setLocationTracking}
                    />
                    <ActionItem
                        icon="download-outline"
                        title="Télécharger mes données"
                        subtitle="Obtenir une copie de vos informations"
                        onPress={() => Alert.alert('Téléchargement', 'Vos données seront envoyées par email')}
                    />
                </SettingsSection>

                {/* Gestion des données */}
                <SettingsSection title="GESTION DES DONNÉES">
                    <ActionItem
                        icon="trash-outline"
                        title="Effacer l'historique"
                        subtitle="Supprimer l'historique de recherche"
                        onPress={() => Alert.alert('Historique effacé', 'Votre historique a été supprimé')}
                    />
                    <ActionItem
                        icon="albums-outline"
                        title="Gérer les autorisations"
                        subtitle="Caméra, contacts, localisation"
                        onPress={() => Alert.alert('Autorisations', 'Gérez vos autorisations dans les paramètres')}
                    />
                    <ActionItem
                        icon="document-text-outline"
                        title="Voir la politique de confidentialité"
                        onPress={() => onNavigate('privacyPolicy')}
                    />
                </SettingsSection>

                {/* Zone dangereuse */}
                <SettingsSection title="ZONE DANGEREUSE">
                    <TouchableOpacity
                        style={styles.dangerItem}
                        onPress={handleDeleteAccount}
                    >
                        <View style={styles.settingsItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FFE8E8' }]}>
                                <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                            </View>
                            <View style={styles.settingsItemText}>
                                <Text style={[styles.settingsItemTitle, { color: '#FF6B6B' }]}>
                                    Supprimer mon compte
                                </Text>
                                <Text style={[styles.settingsItemSubtitle, { color: colors.subText }]}>
                                    Action irréversible
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                </SettingsSection>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    section: {
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
        paddingHorizontal: 20,
        marginBottom: 10,
        color: '#6b7280',
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingsItemText: {
        flex: 1,
    },
    settingsItemTitle: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
        color: '#111827',
    },
    settingsItemSubtitle: {
        fontSize: 13,
    },
    dangerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
});

export default PrivacySecurityScreen;
