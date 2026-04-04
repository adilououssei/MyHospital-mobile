// app/components/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import authService from '../services/authService';

interface ForgotPasswordScreenProps {
    onNavigate: (screen: string, params?: any) => void;
}

const ForgotPasswordScreen = ({ onNavigate }: ForgotPasswordScreenProps) => {
    const { t } = useApp();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

    const handleSendEmail = async () => {
        if (!validateEmail(email)) {
            setErrorMessage(t('forgotInvalidEmail'));
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await authService.requestPasswordReset(email);
            setEmailSent(true);
            Alert.alert(
                t('forgotEmailSent'),
                t('forgotEmailSentDesc'),
                [{ text: 'OK', onPress: () => onNavigate('verificationCode', { email }) }]
            );
        } catch (error: any) {
            setErrorMessage(error.error || t('forgotError'));
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('login')}>
                        <Ionicons name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Ionicons name="mail-outline" size={60} color="#0077b6" />
                    </View>
                    <Text style={styles.successTitle}>{t('forgotCheckEmail')}</Text>
                    <Text style={styles.successText}>
                        {t('forgotEmailSentTo')} {email}
                    </Text>
                    <Text style={styles.successSubtext}>
                        {t('forgotEmailInstruction')}
                    </Text>
                    <TouchableOpacity 
                        style={styles.resendButton}
                        onPress={handleSendEmail}
                        disabled={isLoading}>
                        <Text style={styles.resendButtonText}>
                            {t('forgotResend')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('login')}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>{t('forgotTitle')}</Text>
                        <Text style={styles.subtitle}>{t('forgotSubtitle')}</Text>

                        <View style={[styles.inputContainer, errorMessage ? styles.inputError : null]}>
                            <Ionicons name="mail-outline" size={20} color="#999" />
                            <TextInput
                                style={styles.input}
                                placeholder={t('forgotEmailPlaceholder')}
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={text => { setEmail(text); setErrorMessage(''); }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                            {email && validateEmail(email) && (
                                <Ionicons name="checkmark" size={20} color="#0077b6" />
                            )}
                        </View>

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                        <TouchableOpacity 
                            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                            onPress={handleSendEmail}
                            disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.sendButtonText}>{t('forgotSend')}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.backToLogin}
                            onPress={() => onNavigate('login')}>
                            <Text style={styles.backToLoginText}>{t('forgotBackToLogin')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backButton: { padding: 5 },
    content: { paddingHorizontal: 30, paddingTop: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 12 },
    subtitle: { fontSize: 14, color: '#999', marginBottom: 40, lineHeight: 20 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F5F5F5', borderRadius: 25,
        paddingHorizontal: 20, paddingVertical: 15,
        marginBottom: 15, borderWidth: 1, borderColor: '#F5F5F5'
    },
    inputError: { borderColor: '#FF6B6B', borderWidth: 2 },
    input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#000' },
    errorText: { color: '#FF6B6B', fontSize: 12, marginBottom: 10, marginLeft: 20 },
    sendButton: {
        backgroundColor: '#0077b6',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20
    },
    sendButtonDisabled: { backgroundColor: '#B0B0B0' },
    sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    backToLogin: { alignItems: 'center', marginTop: 20 },
    backToLoginText: { color: '#0077b6', fontSize: 14, fontWeight: '500' },
    successContainer: { paddingHorizontal: 30, alignItems: 'center', marginTop: 60 },
    successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F9F5', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    successTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 15, textAlign: 'center' },
    successText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 10 },
    successSubtext: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20 },
    resendButton: { marginTop: 30, paddingVertical: 12, paddingHorizontal: 30 },
    resendButtonText: { color: '#0077b6', fontSize: 14, fontWeight: '600' }
});

export default ForgotPasswordScreen;