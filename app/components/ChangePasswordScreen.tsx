// app/components/ChangePasswordScreen.tsx

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    Alert, KeyboardAvoidingView, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useAuth } from '../context/AppContext';
import { getProfileByUserId, changePassword } from '../services/profileService';

interface ChangePasswordScreenProps {
    onNavigate: (screen: string) => void;
}

const ChangePasswordScreen = ({ onNavigate }: ChangePasswordScreenProps) => {
    const { colors, t } = useApp();
    const { user } = useAuth();
    const [patientId, setPatientId]                      = useState<number | null>(null);
    const [saving, setSaving]                             = useState(false);
    const [currentPassword, setCurrentPassword]         = useState('');
    const [newPassword, setNewPassword]                 = useState('');
    const [confirmPassword, setConfirmPassword]         = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword]         = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        getProfileByUserId(user.id).then(p => setPatientId(p.id)).catch(() => {});
    }, [user?.id]);

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 8)  return { strength: 33, label: t('cpWeak'),   color: '#FF6B6B' };
        if (password.length < 12) return { strength: 66, label: t('cpMedium'), color: '#FFA500' };
        return { strength: 100, label: t('cpStrong'), color: '#00C48C' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleChangePassword = async () => {
        if (!currentPassword) { Alert.alert(t('error'), t('cpErrCurrent')); return; }
        if (!newPassword)     { Alert.alert(t('error'), t('cpErrNew'));     return; }
        if (newPassword.length < 8) { Alert.alert(t('error'), t('cpErrLen')); return; }
        if (newPassword !== confirmPassword) { Alert.alert(t('error'), t('cpNoMatch')); return; }
        if (currentPassword === newPassword) { Alert.alert(t('error'), t('cpErrSame')); return; }
        if (!patientId) { Alert.alert(t('error'), t('epErrLoad')); return; }

        setSaving(true);
        const result = await changePassword(patientId, currentPassword, newPassword);
        setSaving(false);

        if (result.success) {
            Alert.alert(t('success'), t('cpSuccess'), [{ text: 'OK', onPress: () => onNavigate('settings') }]);
        } else {
            Alert.alert(t('error'), result.error ?? t('epErrSave'));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('privacySecurity')}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{t('cpTitle')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {/* Info */}
                        <View style={[styles.infoBox, { backgroundColor: '#eff6ff' }]}>
                            <Ionicons name="information-circle" size={24} color="#1a56db" />
                            <Text style={[styles.infoText, { color: colors.text }]}>{t('cpInfo')}</Text>
                        </View>

                        {/* Mot de passe actuel */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('cpCurrent')}</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={styles.inputIcon} />
                                <TextInput style={[styles.input, { color: colors.text }]}
                                    placeholder={t('cpCurrentPlaceholder')} placeholderTextColor={colors.subText}
                                    value={currentPassword} onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrentPassword} />
                                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                    <Ionicons name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.subText} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.forgotLink} onPress={() => onNavigate('forgotPassword')}>
                                <Text style={styles.forgotLinkText}>{t('cpForgot')}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Nouveau mot de passe */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('cpNew')}</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={styles.inputIcon} />
                                <TextInput style={[styles.input, { color: colors.text }]}
                                    placeholder={t('cpNewPlaceholder')} placeholderTextColor={colors.subText}
                                    value={newPassword} onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPassword} />
                                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                    <Ionicons name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.subText} />
                                </TouchableOpacity>
                            </View>
                            {newPassword ? (
                                <View style={styles.strengthContainer}>
                                    <View style={styles.strengthBarContainer}>
                                        <View style={[styles.strengthBar, { width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }]} />
                                    </View>
                                    <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Confirmer */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('cpConfirm')}</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.subText} style={styles.inputIcon} />
                                <TextInput style={[styles.input, { color: colors.text }]}
                                    placeholder={t('cpConfirmPlaceholder')} placeholderTextColor={colors.subText}
                                    value={confirmPassword} onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword} />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.subText} />
                                </TouchableOpacity>
                            </View>
                            {confirmPassword && newPassword ? (
                                <View style={styles.matchContainer}>
                                    <View style={styles.matchRow}>
                                        <Ionicons name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'} size={16}
                                            color={newPassword === confirmPassword ? '#00C48C' : '#FF6B6B'} />
                                        <Text style={[styles.matchText, { color: newPassword === confirmPassword ? '#00C48C' : '#FF6B6B' }]}>
                                            {newPassword === confirmPassword ? t('cpMatch') : t('cpNoMatch')}
                                        </Text>
                                    </View>
                                </View>
                            ) : null}
                        </View>

                        <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.7 }]} onPress={handleChangePassword} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{t('cpSave')}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={() => onNavigate('privacySecurity')}>
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    content: { paddingHorizontal: 20, paddingTop: 20 },
    infoBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 25, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    infoText: { flex: 1, marginLeft: 12, fontSize: 13, lineHeight: 18 },
    inputContainer: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: 'rgba(255,255,255,0.88)', paddingHorizontal: 15, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#111827' },
    forgotLink: { alignSelf: 'flex-end', marginTop: 8 },
    forgotLinkText: { color: '#1a56db', fontSize: 13, fontWeight: '500' },
    strengthContainer: { marginTop: 10 },
    strengthBarContainer: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
    strengthBar: { height: '100%', borderRadius: 2 },
    strengthLabel: { fontSize: 12, fontWeight: '600' },
    matchContainer: { marginTop: 10 },
    matchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    matchText: { fontSize: 12, fontWeight: '500' },
    saveButton: { backgroundColor: '#1a3fad', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cancelButton: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', marginTop: 15, marginBottom: 40 },
    cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
});

export default ChangePasswordScreen;
