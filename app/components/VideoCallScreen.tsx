// app/components/VideoCallScreen.tsx
// Consultation en ligne via Jitsi Meet (WebView)
// Installation requise : expo install react-native-webview

import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import WebView, { WebViewNavigation } from 'react-native-webview';

interface VideoCallScreenProps {
    onNavigate: (screen: string) => void;
    jitsiUrl?: string;
    doctorName?: string;
    patientName?: string;
    appointmentId?: string;
}

const VideoCallScreen = ({
    onNavigate,
    jitsiUrl,
    doctorName = 'Médecin',
    patientName = 'Patient',
    appointmentId,
}: VideoCallScreenProps) => {

    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading]   = useState(true);
    const [hasError, setHasError]     = useState(false);
    const [isMuted, setIsMuted]       = useState(false);
    const [isCamOff, setIsCamOff]     = useState(false);

    // ── URL Jitsi avec configuration ──────────────────────────────────────────
    const buildJitsiUrl = (): string => {
        if (!jitsiUrl) {
            // URL de démo si aucune URL fournie
            return 'https://meet.jit.si/myhospital-demo-' + Date.now();
        }

        // Ajouter config si l'URL ne contient pas déjà de #
        if (!jitsiUrl.includes('#')) {
            const config = [
                'config.prejoinPageEnabled=false',
                'config.disableDeepLinking=true',
                'config.startWithAudioMuted=false',
                'config.startWithVideoMuted=false',
                `userInfo.displayName=${encodeURIComponent(patientName)}`,
            ].join('&');
            return `${jitsiUrl}#${config}`;
        }

        return jitsiUrl;
    };

    // ── JS injecté pour masquer certains éléments Jitsi UI ───────────────────
    const injectedJS = `
        (function() {
            // Attendre que Jitsi soit chargé
            const waitForJitsi = setInterval(function() {
                // Cacher le logo Jitsi (optionnel)
                const logo = document.querySelector('.watermark');
                if (logo) logo.style.display = 'none';
                
                const poweredBy = document.querySelector('.powered-by');
                if (poweredBy) poweredBy.style.display = 'none';

                clearInterval(waitForJitsi);
            }, 2000);
        })();
        true;
    `;

    // ── Gérer la fin de la consultation (quand Jitsi redirige) ───────────────
    const handleNavigationChange = (navState: WebViewNavigation) => {
        // Jitsi redirige vers sa page d'accueil quand on quitte
        if (navState.url === 'https://meet.jit.si/' ||
            navState.url === 'about:blank') {
            handleLeave();
        }
    };

    const handleLeave = () => {
        Alert.alert(
            'Quitter la consultation',
            'La consultation est terminée. Voulez-vous quitter ?',
            [
                { text: 'Rester', style: 'cancel' },
                {
                    text: 'Quitter',
                    style: 'destructive',
                    onPress: () => onNavigate('appointments'),
                },
            ]
        );
    };

    const toggleMute = () => {
        // Injecter du JS pour muter/démuter dans Jitsi
        webViewRef.current?.injectJavaScript(`
            (function() {
                const muteBtn = document.querySelector('[aria-label="Mute / Unmute"]') ||
                                document.querySelector('button[id*="microphone"]');
                if (muteBtn) muteBtn.click();
            })();
            true;
        `);
        setIsMuted(!isMuted);
    };

    const toggleCamera = () => {
        webViewRef.current?.injectJavaScript(`
            (function() {
                const camBtn = document.querySelector('[aria-label="Start / Stop camera"]') ||
                               document.querySelector('button[id*="camera"]');
                if (camBtn) camBtn.click();
            })();
            true;
        `);
        setIsCamOff(!isCamOff);
    };

    // ── Écran d'erreur ────────────────────────────────────────────────────────
    if (hasError) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="videocam-off-outline" size={60} color="#fff" />
                <Text style={styles.errorTitle}>Connexion impossible</Text>
                <Text style={styles.errorSubtitle}>
                    Vérifiez votre connexion internet et réessayez.
                </Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => { setHasError(false); setIsLoading(true); }}
                >
                    <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.leaveErrorButton} onPress={() => onNavigate('appointments')}>
                    <Text style={styles.leaveErrorText}>Retour aux rendez-vous</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* ── Header ──────────────────────────────────────────────────── */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>EN DIRECT</Text>
                    </View>
                    <View style={styles.headerCenter}>
                        <Text style={styles.doctorNameText} numberOfLines={1}>
                            {doctorName}
                        </Text>
                        <Text style={styles.consultationTypeText}>Consultation en ligne</Text>
                    </View>
                    <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
                        <Ionicons name="call-outline" size={20} color="#fff" />
                        <Text style={styles.leaveBtnText}>Quitter</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ── WebView Jitsi ────────────────────────────────────────────── */}
            <WebView
                ref={webViewRef}
                source={{ uri: buildJitsiUrl() }}
                style={styles.webView}
                // Permissions media
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                // Camera & micro
                allowsFullscreenVideo
                javaScriptEnabled
                domStorageEnabled
                // JS injecté
                injectedJavaScript={injectedJS}
                // Events
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onNavigationStateChange={handleNavigationChange}
                onError={() => setHasError(true)}
                onHttpError={() => setHasError(true)}
                // Permissions (Android)
                geolocationEnabled={false}
                cacheEnabled={false}
            />

            {/* ── Spinner de chargement ────────────────────────────────────── */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0077b6" />
                    <Text style={styles.loadingText}>
                        Connexion à la consultation...
                    </Text>
                    <Text style={styles.loadingSubText}>
                        Avec {doctorName}
                    </Text>
                </View>
            )}

            {/* ── Contrôles personnalisés ──────────────────────────────────── */}
            <SafeAreaView edges={['bottom']} style={styles.controls}>
                <View style={styles.controlsRow}>
                    {/* Micro */}
                    <TouchableOpacity
                        style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                        onPress={toggleMute}
                    >
                        <Ionicons
                            name={isMuted ? 'mic-off' : 'mic-outline'}
                            size={26}
                            color={isMuted ? '#FF3B30' : '#fff'}
                        />
                        <Text style={[styles.controlLabel, isMuted && { color: '#FF3B30' }]}>
                            {isMuted ? 'Muet' : 'Micro'}
                        </Text>
                    </TouchableOpacity>

                    {/* Bouton quitter (rouge, central) */}
                    <TouchableOpacity style={styles.endCallBtn} onPress={handleLeave}>
                        <Ionicons name="call" size={30} color="#fff" />
                    </TouchableOpacity>

                    {/* Caméra */}
                    <TouchableOpacity
                        style={[styles.controlBtn, isCamOff && styles.controlBtnActive]}
                        onPress={toggleCamera}
                    >
                        <Ionicons
                            name={isCamOff ? 'videocam-off' : 'videocam-outline'}
                            size={26}
                            color={isCamOff ? '#FF3B30' : '#fff'}
                        />
                        <Text style={[styles.controlLabel, isCamOff && { color: '#FF3B30' }]}>
                            {isCamOff ? 'Caméra off' : 'Caméra'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30',
    },
    liveText: {
        color: '#FF3B30',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    doctorNameText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    consultationTypeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        marginTop: 2,
    },
    leaveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FF3B30',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    leaveBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    webView: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#001a2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        marginTop: 20,
    },
    loadingSubText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginTop: 6,
    },
    controls: {
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
    },
    controlBtn: {
        alignItems: 'center',
        gap: 4,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    controlBtnActive: {
        backgroundColor: 'rgba(255,59,48,0.15)',
    },
    controlLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
    },
    endCallBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        // Rotation de 135° = icône téléphone "raccrocher"
        transform: [{ rotate: '135deg' }],
    },
    // ── Écran d'erreur ────────────────────────────────────────
    errorContainer: {
        flex: 1,
        backgroundColor: '#001a2e',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    errorSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    retryButton: {
        backgroundColor: '#0077b6',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginBottom: 15,
    },
    retryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    leaveErrorButton: {
        paddingVertical: 12,
    },
    leaveErrorText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
});

export default VideoCallScreen;