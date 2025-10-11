import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ForgotPasswordScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

const ForgotPasswordScreen = ({ onNavigate }: ForgotPasswordScreenProps) => {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleResetPassword = () => {
    if (activeTab === 'email') {
      if (!validateEmail(email)) {
        alert('Veuillez entrer un email valide');
        return;
      }
      // Envoyer le code par email
      onNavigate('verification', { contact: email, type: 'email' });
    } else {
      if (!phone || phone.length < 10) {
        alert('Veuillez entrer un numéro de téléphone valide');
        return;
      }
      // Envoyer le code par SMS
      onNavigate('verification', { contact: phone, type: 'phone' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => onNavigate('login')}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Mot de passe oublié ?</Text>
            <Text style={styles.description}>
              Entrez votre email ou votre numéro de téléphone,
            </Text>
            <Text style={styles.description}>
              nous vous enverrons un code de confirmation
            </Text>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'email' && styles.activeTab]}
                onPress={() => setActiveTab('email')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'email' && styles.activeTabText,
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
                onPress={() => setActiveTab('phone')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'phone' && styles.activeTabText,
                  ]}
                >
                  Téléphone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Field */}
            {activeTab === 'email' ? (
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#0077b6" />
                <TextInput
                  style={styles.input}
                  placeholder="exemple@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {email && validateEmail(email) && (
                  <Ionicons name="checkmark" size={20} color="#0077b6" />
                )}
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#0077b6" />
                <TextInput
                  style={styles.input}
                  placeholder="0612345678"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                {phone && phone.length >= 10 && (
                  <Ionicons name="checkmark" size={20} color="#0077b6" />
                )}
              </View>
            )}

            {/* Reset Button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
            >
              <Text style={styles.resetButtonText}>Réinitialiser le mot de passe</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#999',
    lineHeight: 22,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 4,
    marginTop: 30,
    marginBottom: 25,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 22,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0077b6',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 25,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#000',
  },
  resetButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;