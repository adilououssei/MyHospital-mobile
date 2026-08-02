import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Keyboard,
  Animated, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useAuth } from '../context/AppContext';
import apiClient from '../services/api.config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface Props { onNavigate: (screen: string) => void; }

const QUICK_SUGGESTIONS = [
  { icon: 'medical-outline',     label: 'Pharmacies\nde garde proches', text: 'Où trouver une pharmacie de garde près de moi ?' },
  { icon: 'calendar-outline',    label: 'Prendre un\nrendez-vous',      text: 'Comment prendre un rendez-vous avec un médecin ?' },
  { icon: 'medkit-outline',      label: "Services\nd'urgences",         text: "J'ai besoin d'aller aux urgences, que faire ?" },
  { icon: 'heart-outline',       label: 'Problèmes\ncardiaques',        text: "J'ai des douleurs dans la poitrine, que faire ?" },
  { icon: 'thermometer-outline', label: 'Fièvre',                       text: "J'ai de la fièvre depuis 3 jours, quel médecin consulter ?" },
];

// ─── Bulle de message ─────────────────────────────────────────────────────────
const MessageBubble = ({ msg, colors, t }: { msg: Message; colors: any; t: (k: string) => string }) => {
  const isUser = msg.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, []);

  const timeStr = msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <Animated.View style={[styles.userRow, { opacity: fadeAnim }]}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{msg.content}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.userTime}>{timeStr}</Text>
            <Ionicons name="checkmark-done" size={13} color="#93c5fd" />
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.botRow, { opacity: fadeAnim }]}>
      {/* Avatar sans background bleu */}
      <View style={styles.botAvatar}>
        <Image
          source={require('../../assets/Fichier 2icône MyHospital.png')}
          style={styles.botAvatarImg}
          resizeMode="contain"
        />
      </View>

      <View style={styles.botBubble}>
        {msg.loading ? (
          <View style={styles.typingRow}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, { marginHorizontal: 4 }]} />
            <View style={styles.typingDot} />
          </View>
        ) : (
          <>
            <Text style={styles.botBubbleText}>{msg.content}</Text>
            <Text style={styles.botTime}>{timeStr}</Text>
          </>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Carte de bienvenue ───────────────────────────────────────────────────────
const WelcomeCard = ({ userName }: { userName: string }) => {
  const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={styles.welcomeCard}>
      {/* Avatar sans background bleu */}
      <View style={styles.welcomeAvatarBox}>
        <Image
          source={require('../../assets/Fichier 2icône MyHospital.png')}
          style={styles.welcomeAvatarImg}
          resizeMode="contain"
        />
      </View>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeGreet}>Bonjour {userName} 👋</Text>
        <Text style={styles.welcomeText}>
          Je suis votre assistant santé.{'\n'}Comment puis-je vous aider aujourd'hui ?
        </Text>
        <Text style={styles.welcomeTime}>{timeStr}</Text>
      </View>
    </View>
  );
};

// ─── Grille de suggestions ────────────────────────────────────────────────────
const SuggestionsGrid = ({ onSelect }: { onSelect: (text: string) => void }) => (
  <View style={styles.suggestionsWrap}>
    <Text style={styles.suggestionsTitle}>Suggestions populaires</Text>
    <View style={styles.suggestionsGrid}>
      {QUICK_SUGGESTIONS.map((s, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.suggestionCard,
            QUICK_SUGGESTIONS.length % 2 !== 0 && i === QUICK_SUGGESTIONS.length - 1
              ? styles.suggestionCardFull
              : styles.suggestionCardHalf,
          ]}
          onPress={() => onSelect(s.text)}
          activeOpacity={0.75}
        >
          <View style={styles.suggestionIconBox}>
            <Ionicons name={s.icon as any} size={20} color="#1a56db" />
          </View>
          <Text style={styles.suggestionLabel}>{s.label}</Text>
          <Ionicons name="chevron-forward" size={14} color="#9ca3af" style={styles.suggestionArrow} />
        </TouchableOpacity>
      ))}
    </View>

    <View style={styles.infoCard}>
      <View style={styles.infoIconBox}>
        <Ionicons name="bulb" size={22} color="#fff" />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>Bon à savoir</Text>
        <Text style={styles.infoBody}>
          Je peux vous aider pour des informations générales sur votre santé et vous orienter vers les bons services.
        </Text>
      </View>
      <Ionicons name="add" size={22} color="#bfdbfe" />
    </View>
  </View>
);

// ─── Composant principal ──────────────────────────────────────────────────────
const ChatbotScreen = ({ onNavigate }: Props) => {
  const { colors, t } = useApp();
  const { user }      = useAuth();

  const [messages, setMessages]               = useState<Message[]>([]);
  const [inputText, setInputText]             = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showDisclaimer, setShowDisclaimer]   = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setShowSuggestions(false);

    const userMsg: Message  = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date() };
    const loadingMsg: Message = { id: 'loading', role: 'assistant', content: '', timestamp: new Date(), loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const history     = messages.filter(m => !m.loading).map(m => ({ role: m.role, content: m.content }));
      const userContext = user ? { prenom: user.prenom, nom: user.nom, ville: user.ville } : {};
      const response    = await apiClient.post('/api/chatbot/message', { message: text.trim(), history, userContext });
      const botContent  = response.data.message || t('chatbotNoResponse');
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'loading'),
        { id: Date.now() + '_bot', role: 'assistant', content: botContent, timestamp: new Date() },
      ]);
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || error?.message || t('chatbotError');
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'loading'),
        { id: Date.now() + '_err', role: 'assistant', content: errMsg, timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [isLoading, messages, user, scrollToBottom]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setShowSuggestions(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble msg={item} colors={colors} t={t} />
  ), [colors, t]);

  const userName = user?.prenom || 'vous';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => onNavigate('home')}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {/* Icône sans background bleu */}
          <View style={styles.headerAvatarBox}>
            <Image
              source={require('../../assets/Fichier 2icône MyHospital.png')}
              style={styles.headerAvatarImg}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.headerName}>MyHospital IA</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>En ligne</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.headerRefresh} onPress={clearHistory}>
          <Ionicons name="refresh-outline" size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>
      </SafeAreaView>

      {/* ── Disclaimer ───────────────────────────────────────────── */}
      {showDisclaimer && (
        <View style={styles.disclaimer}>
          <View style={styles.disclaimerIcon}>
            <Ionicons name="shield-checkmark" size={16} color="#1a56db" />
          </View>
          <Text style={styles.disclaimerText}>
            Cet assistant peut se tromper. En cas d'urgence, consultez un professionnel de santé.
          </Text>
          <TouchableOpacity onPress={() => setShowDisclaimer(false)}>
            <Ionicons name="close" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Corps : messages + saisie ──────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1, paddingBottom: keyboardVisible ? 0 : 110 }}>
          {/* Liste des messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            style={{ flex: 1 }}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            ListHeaderComponent={<WelcomeCard userName={userName} />}
            ListFooterComponent={showSuggestions ? <SuggestionsGrid onSelect={sendMessage} /> : null}
          />

          {/* ── Zone de saisie ────────────────────────────────────────── */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Écrivez votre message..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => setKeyboardVisible(true)}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnOff]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name={isLoading ? 'hourglass-outline' : 'send'} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  // Header
  headerSafeArea: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 4,
  },
  headerBack:   { padding: 6 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 4 },
  // Pas de backgroundColor ici → fond blanc transparent
  headerAvatarBox: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  headerAvatarImg: { width: 44, height: 44 },
  headerName:   { fontSize: 16, fontWeight: '800', color: '#1a56db' },
  onlineRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  onlineDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  onlineText:   { fontSize: 12, color: '#10b981', fontWeight: '600' },
  headerRefresh:{ padding: 6 },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#eff6ff',
    marginHorizontal: 14, marginTop: 10, marginBottom: 4,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  disclaimerIcon: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center',
  },
  disclaimerText: { flex: 1, fontSize: 12, color: '#374151', lineHeight: 17 },

  // Messages
  messagesList: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 20 },

  // Carte bienvenue
  welcomeCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  // Pas de backgroundColor → fond blanc naturel
  welcomeAvatarBox: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  welcomeAvatarImg: { width: 48, height: 48 },
  welcomeContent:   { flex: 1 },
  welcomeGreet:     { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 6 },
  welcomeText:      { fontSize: 15, color: '#374151', lineHeight: 22 },
  welcomeTime:      { fontSize: 11, color: '#9ca3af', marginTop: 8 },

  // Suggestions
  suggestionsWrap:  { marginBottom: 16 },
  suggestionsTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 12 },
  suggestionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  suggestionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  suggestionCardHalf: { width: '47.5%' },
  suggestionCardFull: { width: '100%' },
  suggestionIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  suggestionLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1a56db', lineHeight: 18 },
  suggestionArrow: { marginLeft: 4 },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#eff6ff', borderRadius: 16, padding: 14, marginTop: 10,
  },
  infoIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1a56db', justifyContent: 'center', alignItems: 'center',
  },
  infoText:  { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#1a56db', marginBottom: 3 },
  infoBody:  { fontSize: 12, color: '#374151', lineHeight: 17 },

  // Bulle utilisateur
  userRow:       { alignItems: 'flex-end', marginBottom: 14 },
  userBubble:    {
    maxWidth: '78%', backgroundColor: '#1a3fad',
    borderRadius: 20, borderBottomRightRadius: 4,
    paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#1a56db', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  userBubbleText:{ fontSize: 15, color: '#fff', lineHeight: 21 },
  userMeta:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, justifyContent: 'flex-end' },
  userTime:      { fontSize: 11, color: 'rgba(255,255,255,0.65)' },

  // Bulle bot
  botRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 14 },
  // Pas de backgroundColor → fond transparent, logo visible tel quel
  botAvatar: {
    width: 40, height: 40, borderRadius: 12,
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
  },
  botAvatarImg: { width: 40, height: 40 },
  botBubble: {
    maxWidth: '75%', backgroundColor: '#fff',
    borderRadius: 20, borderBottomLeftRadius: 4,
    paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  botBubbleText:{ fontSize: 15, color: '#111827', lineHeight: 21 },
  botTime:      { fontSize: 11, color: '#9ca3af', marginTop: 5 },

  typingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a56db', opacity: 0.6 },

  // Zone de saisie
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 4,
  },
  textInput: {
    flex: 1, borderRadius: 24, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 18, paddingVertical: 11,
    fontSize: 14, color: '#111827',
    maxHeight: 100, minHeight: 46, lineHeight: 20,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: '#1a3fad',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  sendBtnOff: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
});

export default ChatbotScreen;