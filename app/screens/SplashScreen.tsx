import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        // Animation du logo
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 2,
                useNativeDriver: true,
            }),
        ]).start();

        // Afficher le splash pendant 3 secondes
        const timer = setTimeout(() => {
            onFinish();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <LinearGradient
            colors={['#0077b6', '#00a8e8', '#0077b6']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    {!imageError ? (
                        <Image
                            source={require('../../assets/MyHospital1.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        // Fallback vers l'icône si l'image ne charge pas
                        <View style={styles.logoCircle}>
                            <Ionicons name="medical" size={80} color="#fff" />
                        </View>
                    )}
                </View>

                {/* App Name */}
                <Text style={styles.appName}>MyHospital</Text>
                <Text style={styles.tagline}>Votre santé, notre priorité</Text>

                {/* Loading Indicator */}
                <View style={styles.loadingContainer}>
                    <Animated.View
                        style={[
                            styles.loadingDot,
                            {
                                opacity: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.3, 1],
                                }),
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.loadingDot,
                            {
                                opacity: fadeAnim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0.3, 0.6, 1],
                                }),
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.loadingDot,
                            {
                                opacity: fadeAnim.interpolate({
                                    inputRange: [0, 0.7, 1],
                                    outputRange: [0.3, 0.7, 1],
                                }),
                            },
                        ]}
                    />
                </View>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Version 1.0.0</Text>
                <Text style={styles.footerText}>© 2024 MyHospital</Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 40,
    },
    logoCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    logoImage: {
        width: 150,
        height: 150,
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 60,
    },
    loadingContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    loadingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 4,
    },
});

export default SplashScreen;