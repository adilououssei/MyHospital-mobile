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
    const { colors, theme, t, language } = useApp();

    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(true);
    const [locationServices, setLocationServices] = useState(true);

    const LANG_LABELS: Record<string, string> = {
      fr: '🇫🇷 Français', en: '🇬🇧 English', de: '🇩🇪 Deutsch',
    };

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
                    {t('settingsTitle')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Account Settings */}
                <SettingsSection title={t('settingsAccount')}>
                    <SettingsItem
                        icon="person-outline"
                        title={t('settingsAccountInfo')}
                        subtitle={t('settingsAccountInfoSub')}
                        onPress={() => onNavigate('editProfile')}
                    />
                    <SettingsItem
                        icon="shield-checkmark-outline"
                        title={t('settingsPrivacy')}
                        subtitle={t('settingsPrivacySub')}
                        onPress={() => onNavigate('privacySecurity')}
                    />
                    <SettingsItem
                        icon="lock-closed-outline"
                        title={t('settingsChangePassword')}
                        onPress={() => onNavigate('changePassword')}
                    />
                </SettingsSection>

                {/* Notifications */}
                <SettingsSection title={t('settingsNotif')}>
                    <ToggleItem
                        icon="notifications-outline"
                        title={t('settingsPush')}
                        subtitle={t('settingsPushSub')}
                        value={notifications}
                        onValueChange={setNotifications}
                    />
                    <ToggleItem
                        icon="mail-outline"
                        title={t('settingsEmailNotif')}
                        subtitle={t('settingsEmailSub')}
                        value={emailNotifications}
                        onValueChange={setEmailNotifications}
                    />
                    <ToggleItem
                        icon="chatbubble-outline"
                        title={t('settingsSmsNotif')}
                        subtitle={t('settingsSmsSub')}
                        value={smsNotifications}
                        onValueChange={setSmsNotifications}
                    />
                </SettingsSection>

                {/* Preferences */}
                <SettingsSection title={t('settingsPrefs')}>
                    <SettingsItem
                        icon="language-outline"
                        title={t('settingsLang')}
                        subtitle={LANG_LABELS[language] ?? 'Français'}
                        onPress={() => onNavigate('language')}
                    />
                    <SettingsItem
                        icon={theme === 'dark' ? 'moon' : 'moon-outline'}
                        title={t('settingsTheme')}
                        subtitle={theme === 'dark' ? t('settingsDark') : t('settingsLight')}
                        onPress={() => onNavigate('theme')}
                    />
                    <ToggleItem
                        icon="location-outline"
                        title={t('settingsLocation')}
                        subtitle={t('settingsLocationSub')}
                        value={locationServices}
                        onValueChange={setLocationServices}
                    />
                </SettingsSection>

                {/* Payment */}
                <SettingsSection title={t('settingsPayment')}>
                    <SettingsItem
                        icon="card-outline"
                        title={t('settingsPaymentMethods')}
                        subtitle={t('settingsPaymentSub')}
                        onPress={() => onNavigate('savedPaymentMethods')}
                    />
                    <SettingsItem
                        icon="receipt-outline"
                        title={t('settingsTransactionHistory')}
                        onPress={() => onNavigate('transactionHistory')}
                    />
                </SettingsSection>

                {/* Support */}
                <SettingsSection title={t('settingsHelp')}>
                    <SettingsItem
                        icon="help-circle-outline"
                        title={t('settingsHelpCenter')}
                        onPress={() => onNavigate('faqs')}
                    />
                    <SettingsItem
                        icon="document-text-outline"
                        title={t('settingsTerms')}
                        onPress={() => onNavigate('terms')}
                    />
                </SettingsSection>

                {/* About */}
                <SettingsSection title={t('settingsAbout')}>
                    <SettingsItem
                        icon="information-circle-outline"
                        title={t('settingsAppVersion')}
                        subtitle="v1.0.0"
                        showArrow={false}
                    />
                    <SettingsItem
                        icon="star-outline"
                        title={t('settingsRateApp')}
                        onPress={() => onNavigate('rateApp')}
                    />
                    <SettingsItem
                        icon="share-social-outline"
                        title={t('settingsShareApp')}
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