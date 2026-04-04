// app/components/VerificationCodeScreen.tsx - Version ultra simple sans refs
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import authService from '../services/authService';

interface VerificationCodeScreenProps {
    onNavigate: (screen: string, params?: any) => void;
    route?: { params?: { email: string } };
}

const VerificationCodeScreen = ({ onNavigate, route }: VerificationCodeScreenProps) => {
    const { t } = useApp();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const email = route?.params?.email || '';

    const handleCodeChange = (text: string) => {
        // Limiter à 6 chiffres
        const cleanText = text.replace(/[^0-9]/g, '').slice(0, 6);
        setCode(cleanText);
        setErrorMessage('');
    };

    const handleVerify = async () => {
        if (code.length !== 6) {
            setErrorMessage(t('verificationInvalidCode') || 'Le code doit contenir 6 chiffres');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.verifyResetToken(code, email);
            if (response.success) {
                onNavigate('createNewPassword', { token: code, email });
            } else {
                setErrorMessage(response.error || t('verificationError') || 'Erreur de vérification');
            }
        } catch (error: any) {
            setErrorMessage(error.error || t('verificationError') || 'Erreur de vérification');
        } finally {
            setIsLoading(false);
        }
    };

    // Afficher les chiffres avec des espaces pour une meilleure lisibilité
    const displayCode = code.split('').join(' ');

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('forgotPassword')}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>{t('verificationTitle') || 'Vérification'}</Text>
                        <Text style={styles.subtitle}>
                            {t('verificationSubtitle') || 'Entrez le code de vérification envoyé à'} {email}
                        </Text>

                        <View style={styles.codeContainer}>
                            <TextInput
                                style={[styles.codeInput, errorMessage ? styles.codeInputError : null]}
                                value={displayCode}
                                onChangeText={handleCodeChange}
                                keyboardType="number-pad"
                                maxLength={11} // 6 chiffres + 5 espaces
                                placeholder="● ● ● ● ● ●"
                                placeholderTextColor="#ccc"
                                textAlign="center"
                                editable={!isLoading}
                                autoFocus
                            />
                        </View>

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                        <TouchableOpacity 
                            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
                            onPress={handleVerify}
                            disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.verifyButtonText}>
                                    {t('verificationVerify') || 'Vérifier'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.resendLink}
                            onPress={() => onNavigate('forgotPassword')}>
                            <Text style={styles.resendLinkText}>
                                {t('verificationResend') || 'Renvoyer le code'}
                            </Text>
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
    codeContainer: { marginBottom: 20 },
    codeInput: {
        height: 60,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        letterSpacing: 8,
        textAlign: 'center'
    },
    codeInputError: { borderWidth: 2, borderColor: '#FF6B6B' },
    errorText: { color: '#FF6B6B', fontSize: 12, textAlign: 'center', marginBottom: 20 },
    verifyButton: { backgroundColor: '#0077b6', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
    verifyButtonDisabled: { backgroundColor: '#B0B0B0' },
    verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    resendLink: { alignItems: 'center', marginTop: 20 },
    resendLinkText: { color: '#0077b6', fontSize: 14, fontWeight: '500' }
});

export default VerificationCodeScreen;