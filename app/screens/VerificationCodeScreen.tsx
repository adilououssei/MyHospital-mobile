import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface VerificationCodeScreenProps {
  onNavigate: (screen: string) => void;
  contact?: string;
  type?: 'email' | 'phone';
}

const VerificationCodeScreen = ({
  onNavigate,
  contact = '085281882151',
  type = 'phone',
}: VerificationCodeScreenProps) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Timer pour le resend
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Permettre seulement les chiffres
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus sur le prochain champ
    if (text && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      alert('Veuillez entrer le code complet');
      return;
    }

    // Vérifier le code
    console.log('Code de vérification:', fullCode);
    onNavigate('createNewPassword');
  };

  const handleResend = () => {
    if (timer > 0) return;
    
    // Renvoyer le code
    setTimer(60);
    setCode(['', '', '', '']);
    inputRefs[0].current?.focus();
    alert('Code renvoyé !');
  };

  const maskContact = (contact: string) => {
    if (type === 'phone') {
      return contact.slice(0, 8) + '***';
    } else {
      const [username, domain] = contact.split('@');
      return username.slice(0, 3) + '***@' + domain;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('forgotPassword')}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Entrer le code de vérification</Text>
        <Text style={styles.description}>
          Entrez le code que nous avons envoyé à votre
        </Text>
        <Text style={styles.description}>
          numéro <Text style={styles.contact}>{maskContact(contact)}</Text>
        </Text>

        {/* Code Input Boxes */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[
                styles.codeBox,
                digit && styles.codeBoxFilled,
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyButtonText}>Vérifier</Text>
        </TouchableOpacity>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Vous n'avez pas reçu le code ? </Text>
          <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
            <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
              Renvoyer {timer > 0 && `(${timer}s)`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Number Keyboard */}
      <View style={styles.keyboardContainer}>
        <View style={styles.keyboardRow}>
          {[1, 2, 3].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => {
                const emptyIndex = code.findIndex((c) => !c);
                if (emptyIndex !== -1) {
                  handleCodeChange(num.toString(), emptyIndex);
                }
              }}
            >
              <Text style={styles.keyNumber}>{num}</Text>
              <Text style={styles.keyLetters}>
                {num === 2 && 'ABC'}
                {num === 3 && 'DEF'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.keyboardRow}>
          {[4, 5, 6].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => {
                const emptyIndex = code.findIndex((c) => !c);
                if (emptyIndex !== -1) {
                  handleCodeChange(num.toString(), emptyIndex);
                }
              }}
            >
              <Text style={styles.keyNumber}>{num}</Text>
              <Text style={styles.keyLetters}>
                {num === 4 && 'GHI'}
                {num === 5 && 'JKL'}
                {num === 6 && 'MNO'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.keyboardRow}>
          {[7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => {
                const emptyIndex = code.findIndex((c) => !c);
                if (emptyIndex !== -1) {
                  handleCodeChange(num.toString(), emptyIndex);
                }
              }}
            >
              <Text style={styles.keyNumber}>{num}</Text>
              <Text style={styles.keyLetters}>
                {num === 7 && 'PQRS'}
                {num === 8 && 'TUV'}
                {num === 9 && 'WXYZ'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.keyboardRow}>
          <View style={styles.key} />
          <TouchableOpacity
            style={styles.key}
            onPress={() => {
              const emptyIndex = code.findIndex((c) => !c);
              if (emptyIndex !== -1) {
                handleCodeChange('0', emptyIndex);
              }
            }}
          >
            <Text style={styles.keyNumber}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.key}
            onPress={() => {
              const lastFilledIndex = code.findIndex((c) => !c) - 1;
              if (lastFilledIndex >= 0) {
                const newCode = [...code];
                newCode[lastFilledIndex] = '';
                setCode(newCode);
                inputRefs[lastFilledIndex].current?.focus();
              }
            }}
          >
            <Ionicons name="backspace-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
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
  contact: {
    color: '#000',
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  codeBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  codeBoxFilled: {
    borderColor: '#0077b6',
    backgroundColor: '#F0F9F7',
  },
  verifyButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#0077b6',
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#999',
  },
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  key: {
    width: 110,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  keyNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  keyLetters: {
    fontSize: 10,
    color: '#666',
    marginTop: -5,
  },
});

export default VerificationCodeScreen;