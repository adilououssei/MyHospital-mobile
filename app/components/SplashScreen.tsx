import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, StatusBar } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1, tension: 50, friction: 4, useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1, duration: 700, useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1.4, duration: 700, useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0, duration: 700, useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineFade, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onFinish, 2400);
    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        {/* Anneau d'ondulation */}
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />

        {/* Logo avec animation */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
              ],
            },
          ]}
        >
          <Image
            source={require('../../assets/Fichier 2icône MyHospital.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Texte qui apparaît après */}
        <Animated.View style={{ opacity: taglineFade, alignItems: 'center' }}>
          <Text style={styles.appName}>MyHospital</Text>
          <Text style={styles.tagline}>Votre santé, notre priorité</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a56db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 90,
    height: 90,
    tintColor: '#fff',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
});

export default SplashScreen;
