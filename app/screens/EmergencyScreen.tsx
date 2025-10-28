import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useApp } from '../context/AppContext';

interface EmergencyScreenProps {
  onNavigate: (screen: string) => void;
}

const EmergencyScreen = ({ onNavigate }: EmergencyScreenProps) => {
  const { colors } = useApp();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de pulsation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Animation de clignotement
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    blink.start();

    return () => {
      pulse.stop();
      blink.stop();
    };
  }, []);

  const handleEmergencyCall = () => {
    const phoneNumber = '96712198';
    
    Alert.alert(
      'Appel d\'urgence',
      `Voulez-vous appeler le ${phoneNumber} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Appeler',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
              Alert.alert('Erreur', 'Impossible de passer l\'appel');
              console.error('Error opening dialer:', err);
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('home')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Urgences
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="ambulance" size={80} color="#FF3B30" />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Urgence Médicale
        </Text>

        <Text style={[styles.description, { color: colors.subText }]}>
          En cas d'urgence médicale, appuyez sur le bouton ci-dessous pour contacter immédiatement les services d'urgence.
        </Text>

        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          }}
        >
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleEmergencyCall}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="phone-alt" size={28} color="#fff" />
            <Text style={styles.emergencyButtonText}>
              Appeler les Urgences
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={24} color="#0077b6" />
          <Text style={[styles.infoText, { color: colors.subText }]}>
            Ce service est disponible 24h/24 et 7j/7
          </Text>
        </View>

        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={20} color="#FFC107" />
          <Text style={[styles.warningText, { color: colors.subText }]}>
            N'utilisez ce service qu'en cas d'urgence réelle
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 160,
    height: 160,
    backgroundColor: '#FFE5E5',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    width: 320,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 30,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4F4FC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    maxWidth: 320,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
  },
  warningText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
});

export default EmergencyScreen;