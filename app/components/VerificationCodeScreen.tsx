// app/components/VerificationCodeScreen.tsx - Saisie du code OTP (6 cases)

import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, ScrollView, ActivityIndicator,
    NativeSyntheticEvent, TextInputKeyPressEventData
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import authService from '../services/authService';

interface VerificationCodeScreenProps {
    onNavigate: (screen: string, params?: any) => void;
    route?: { params?: { email: string } };
    contact?: string;
    type?: string;
}

const CODE_LENGTH = 6;

const VerificationCodeScreen = ({ onNavigate, route, contact, type }: VerificationCodeScreenProps) => {
    const { t } = useApp();
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const inputsRef = useRef<Array<TextInput | null>>([]);

    const email = contact || route?.params?.email || '';
    const code = digits.join('');

    const focusInput = (index: number) => {
        if (index >= 0 && index < CODE_LENGTH) {
            inputsRef.current[index]?.focus();
        }
    };

    const handleChange = (text: string, index: number) => {
        setErrorMessage('');
        const clean = text.replace(/[^0-9]/g, '');

        // Collage d'un code complet dans une seule case
        if (clean.length > 1) {
            const chars = clean.slice(0, CODE_LENGTH).split('');
            const next = Array(CODE_LENGTH).fill('');
            chars.forEach((c, i) => { next[i] = c; });
            setDigits(next);
            const lastFilled = Math.min(chars.length, CODE_LENGTH) - 1;
            focusInput(lastFilled < CODE_LENGTH - 1 ? lastFilled + 1 : CODE_LENGTH - 1);
            if (chars.length >= CODE_LENGTH) {
                verify(next.join(''));
            }
            return;
        }

        const next = [...digits];
        next[index] = clean;
        setDigits(next);

        if (clean && index < CODE_LENGTH - 1) {
            focusInput(index + 1);
        }

        // Auto-validation quand les 6 chiffres sont saisis
        const joined = next.join('');
        if (joined.length === CODE_LENGTH && !joined.includes('')) {
            verify(joined);
        }
    };

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
            const next = [...digits];
            next[index - 1] = '';
            setDigits(next);
            focusInput(index - 1);
        }
    };

    const verify = async (fullCode: string) => {
        if (fullCode.length !== CODE_LENGTH) {
            setErrorMessage(t('verificationInvalidCode'));
            return;
        }
        if (!email) {
            setErrorMessage(t('cnpErrSession') || 'Session expirée. Veuillez recommencer.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.verifyResetToken(fullCode, email);
            if (response?.success) {
                onNavigate('createNewPassword', { token: fullCode, email });
            } else {
                setErrorMessage(response?.error || t('verificationError'));
            }
        } catch (error: any) {
            setErrorMessage(error?.error || t('verificationError'));
        } finally {
            setIsLoading(false);
        }
    };

    const getContactDisplay = () => {
        if (type === 'phone' && email) {
            if (email.length > 6) {
                return `${email.slice(0, 4)}****${email.slice(-2)}`;
            }
            return email;
        }
        if (email && email.includes('@')) {
            const [localPart, domain] = email.split('@');
            const maskedLocal = localPart.length > 3
                ? localPart.slice(0, 3) + '***'
                : localPart.slice(0, 1) + '***';
            return `${maskedLocal}@${domain}`;
        }
        return email;
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('forgotPassword')}>
                            <Ionicons name="chevron-back" size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>{t('verificationTitle')}</Text>
                        <Text style={styles.subtitle}>
                            {t('verificationSubtitle')} {getContactDisplay()}
                        </Text>

                        <View style={styles.codeRow}>
                            {digits.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(el) => { inputsRef.current[index] = el; }}
                                    style={[
                                        styles.codeCell,
                                        digit ? styles.codeCellFilled : null,
                                        errorMessage ? styles.codeCellError : null,
                                    ]}
                                    value={digit}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={CODE_LENGTH}
                                    textAlign="center"
                                    editable={!isLoading}
                                    autoFocus={index === 0}
                                    selectTextOnFocus
                                    returnKeyType="done"
                                />
                            ))}
                        </View>

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                        <TouchableOpacity
                            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
                            onPress={() => verify(code)}
                            disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.verifyButtonText}>{t('verificationVerify')}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resendLink}
                            onPress={() => onNavigate('forgotPassword')}>
                            <Text style={styles.resendLinkText}>{t('verificationResend')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backButton: { padding: 5 },
    content: { paddingHorizontal: 30, paddingTop: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
    subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 40, lineHeight: 20 },
    codeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    codeCell: {
        width: 48,
        height: 58,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    codeCellFilled: { borderColor: '#1a3fad' },
    codeCellError: { borderColor: '#FF6B6B', borderWidth: 2 },
    errorText: { color: '#FF6B6B', fontSize: 12, textAlign: 'center', marginBottom: 20 },
    verifyButton: {
        backgroundColor: '#1a3fad',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#1a56db',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    verifyButtonDisabled: { backgroundColor: '#B0B0B0' },
    verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    resendLink: { alignItems: 'center', marginTop: 20 },
    resendLinkText: { color: '#1a56db', fontSize: 14, fontWeight: '500' }
});

export default VerificationCodeScreen;
