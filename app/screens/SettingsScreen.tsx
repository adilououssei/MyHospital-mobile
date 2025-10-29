import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface SettingsScreenProps {
    onNavigate: (screen: string) => void;
}

const SettingsScreen = ({ onNavigate }: SettingsScreenProps) => {
    const { colors, theme } = useApp();

    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(true);
    const [locationServices, setLocationServices] = useState(true);

    const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.subText }]}>{title}</Text>
            {children}
        </View>
    );

    const SettingsItem = ({
        icon,
        title,
        subtitle,
        onPress,
        showArrow = true,
        rightElement
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        onPress?: () => void;
        showArrow?: boolean;
        rightElement?: React.ReactNode;
    }) => (
        <TouchableOpacity
            style={[styles.settingsItem, { backgroundColor: colors.card }]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon as any} size={22} color="#0077b6" />
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
            {rightElement || (showArrow && (
                <Ionicons name="chevron-forward" size={20} color={colors.subText} />
            ))}
        </TouchableOpacity>
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
        <View style={[styles.settingsItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon as any} size={22} color="#0077b6" />
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
                trackColor={{ false: colors.border, true: '#0077b6' }}
                thumbColor="#fff"
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => onNavigate('profile')}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Paramètres
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Account Settings */}
                <SettingsSection title="COMPTE">
                    <SettingsItem
                        icon="person-outline"
                        title="Informations du compte"
                        subtitle="Modifier votre profil"
                        onPress={() => onNavigate('editProfile')}
                    />
                    <SettingsItem
                        icon="shield-checkmark-outline"
                        title="Confidentialité et sécurité"
                        subtitle="Gérer vos données"
                        onPress={() => onNavigate('privacySecurity')}
                    />
                    <SettingsItem
                        icon="lock-closed-outline"
                        title="Changer le mot de passe"
                        onPress={() => onNavigate('changePassword')}
                    />
                </SettingsSection>

                {/* Notifications */}
                <SettingsSection title="NOTIFICATIONS">
                    <ToggleItem
                        icon="notifications-outline"
                        title="Notifications Push"
                        subtitle="Recevoir des alertes sur votre téléphone"
                        value={notifications}
                        onValueChange={setNotifications}
                    />
                    <ToggleItem
                        icon="mail-outline"
                        title="Notifications Email"
                        subtitle="Recevoir des mises à jour par email"
                        value={emailNotifications}
                        onValueChange={setEmailNotifications}
                    />
                    <ToggleItem
                        icon="chatbubble-outline"
                        title="Notifications SMS"
                        subtitle="Recevoir des rappels par SMS"
                        value={smsNotifications}
                        onValueChange={setSmsNotifications}
                    />
                </SettingsSection>

                {/* Preferences */}
                <SettingsSection title="PRÉFÉRENCES">
                    <SettingsItem
                        icon="language-outline"
                        title="Langue"
                        subtitle="Français"
                        onPress={() => onNavigate('language')}
                    />
                    <SettingsItem
                        icon={theme === 'dark' ? 'moon' : 'moon-outline'}
                        title="Thème"
                        subtitle={theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
                        onPress={() => onNavigate('theme')}
                    />
                    <ToggleItem
                        icon="location-outline"
                        title="Services de localisation"
                        subtitle="Trouver des hôpitaux à proximité"
                        value={locationServices}
                        onValueChange={setLocationServices}
                    />
                </SettingsSection>

                {/* Payment */}
                <SettingsSection title="PAIEMENT">
                    <SettingsItem
                        icon="card-outline"
                        title="Moyens de paiement"
                        subtitle="Gérer vos moyens de paiement"
                        onPress={() => onNavigate('savedPaymentMethods')}
                    />
                    <SettingsItem
                        icon="receipt-outline"
                        title="Historique des transactions"
                        onPress={() => onNavigate('transactionHistory')}
                    />
                </SettingsSection>

                {/* Support */}
                <SettingsSection title="AIDE ET SUPPORT">
                    <SettingsItem
                        icon="help-circle-outline"
                        title="Centre d'aide (FAQs)"
                        onPress={() => onNavigate('faqs')}
                    />
                    <SettingsItem
                        icon="document-text-outline"
                        title="Conditions d'utilisation"
                        onPress={() => onNavigate('terms')}
                    />
                </SettingsSection>

                {/* About */}
                <SettingsSection title="À PROPOS">
                    <SettingsItem
                        icon="information-circle-outline"
                        title="Version de l'application"
                        subtitle="v1.0.0"
                        showArrow={false}
                    />
                    <SettingsItem
                        icon="star-outline"
                        title="Noter l'application"
                        onPress={() => onNavigate('rateApp')}
                    />
                    <SettingsItem
                        icon="share-social-outline"
                        title="Partager l'application"
                        onPress={() => console.log('Share app')}
                    />
                </SettingsSection>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 1,
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#e4f4fcff',
        borderRadius: 10,
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
    },
    settingsItemSubtitle: {
        fontSize: 13,
    },
});

export default SettingsScreen;