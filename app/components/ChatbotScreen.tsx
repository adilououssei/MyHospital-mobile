import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useAuth } from '../context/AppContext';
import BottomNavigation from '../tabs/BottomNavigation';
import apiClient from '../services/api.config';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface Props { onNavigate: (screen: string) => void; }

// ─── Suggestions rapides ──────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  { label: '💊 Pharmacie de garde proche', text: 'Où trouver une pharmacie de garde près de moi ?' },
  { label: '👨‍⚕️ Prendre un rendez-vous',   text: 'Comment prendre un rendez-vous avec un médecin ?' },
  { label: '🏥 Urgences',                   text: 'J\'ai besoin d\'aller aux urgences, que faire ?' },
  { label: '❤️ Problème cardiaque',         text: 'J\'ai des douleurs dans la poitrine, que faire ?' },
  { label: '🤒 Fièvre',                     text: 'J\'ai de la fièvre depuis 3 jours, quel médecin consulter ?' },
  { label: '🤰 Maternité',                  text: 'Je suis enceinte, quels médecins sont disponibles ?' },
];

// Hauteur totale de BottomNavigation (paddingVertical:10 + paddingBottom:20 + icônes ~46px)
const BOTTOM_NAV_HEIGHT = 80;

// ─── Bulle de message ─────────────────────────────────────────────────────────
const MessageBubble = ({ msg, colors }: { msg: Message; colors: any }) => {
  const isUser = msg.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[
      styles.bubbleRow,
      isUser ? styles.bubbleRowUser : styles.bubbleRowBot,
      { opacity: fadeAnim },
    ]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Ionicons name="hardware-chip" size={16} color="#fff" />
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser
          ? [styles.bubbleUser, { backgroundColor: '#0077b6' }]
          : [styles.bubbleBot, { backgroundColor: colors.card, borderColor: colors.border }],
      ]}>
        {msg.loading ? (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#0077b6" />
            <Text style={[styles.typingText, { color: colors.subText }]}>MedBot réfléchit...</Text>
          </View>
        ) : (
          <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.text }]}>
            {msg.content}
          </Text>
        )}
        <Text style={[styles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.6)' : colors.subText }]}>
          {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────
const ChatbotScreen = ({ onNavigate }: Props) => {
  const { colors } = useApp();
  const { user }   = useAuth();

  const [messages, setMessages]               = useState<Message[]>([]);
  const [inputText, setInputText]             = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour${user?.prenom ? ' ' + user.prenom : ''} ! 👋 Je suis MedBot, votre assistant santé.\n\nJe peux vous aider à :\n• 💊 Trouver une pharmacie de garde\n• 👨‍⚕️ Choisir le bon médecin\n• 🏥 Localiser un hôpital\n• 📅 Prendre un rendez-vous\n• 🩺 Répondre à vos questions de santé\n\nQue puis-je faire pour vous ?`,
      timestamp: new Date(),
    }]);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setShowSuggestions(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    const loadingMsg: Message = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome' && !m.loading)
        .map((m) => ({ role: m.role, content: m.content }));

      const userContext = user
        ? { prenom: user.prenom, nom: user.nom, ville: user.ville }
        : {};

      const response = await apiClient.post('/api/chatbot/message', {
        message: text.trim(),
        history,
        userContext,
      });

      const botContent = response.data.message || 'Désolé, je n\'ai pas pu répondre.';
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'loading'),
        {
          id: Date.now().toString() + '_bot',
          role: 'assistant',
          content: botContent,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'loading'),
        {
          id: Date.now().toString() + '_err',
          role: 'assistant',
          content: '❌ Impossible de contacter MedBot. Vérifiez votre connexion.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [isLoading, messages, user, scrollToBottom]);

  const clearHistory = useCallback(() => {
    setMessages([{
      id: 'welcome_' + Date.now(),
      role: 'assistant',
      content: 'Conversation réinitialisée. Comment puis-je vous aider ?',
      timestamp: new Date(),
    }]);
    setShowSuggestions(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble msg={item} colors={colors} />
  ), [colors]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Ionicons name="hardware-chip" size={18} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>MedBot</Text>
            <Text style={styles.headerSubtitle}>Assistant santé IA • En ligne</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearHistory} style={{ padding: 4 }}>
          <Ionicons name="refresh-outline" size={22} color={colors.subText} />
        </TouchableOpacity>
      </View>

      {/* ── Disclaimer ── */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={13} color="#e67e22" />
        <Text style={styles.disclaimerText}>
          MedBot ne remplace pas un médecin. En cas d'urgence : appelez le 170 (Ambulance Togo)
        </Text>
      </View>

      {/*
        ✅ FIX : paddingBottom = BOTTOM_NAV_HEIGHT
           → La zone de saisie reste visible AU-DESSUS de la BottomNavigation absolue.
           Sur iOS, keyboardVerticalOffset compense header + disclaimer (~115px).
      */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 115 : 0}
      >
        {/* ── Messages ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          style={{ flex: 1 }}
          ListFooterComponent={
            showSuggestions ? (
              <View style={styles.suggestions}>
                <Text style={[styles.suggestionsLabel, { color: colors.subText }]}>
                  Questions fréquentes
                </Text>
                <View style={styles.suggestionsGrid}>
                  {QUICK_SUGGESTIONS.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => sendMessage(s.text)}
                    >
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {/* ── Zone de saisie ── */}
        <View style={[styles.inputArea, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            }]}
            placeholder="Posez votre question..."
            placeholderTextColor={colors.subText}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name={isLoading ? 'hourglass-outline' : 'send'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ✅ BottomNavigation EN DEHORS du KeyboardAvoidingView — reste fixe */}
      <BottomNavigation currentScreen="chatbot" onNavigate={onNavigate} />

    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1 },

  // ✅ FIX PRINCIPAL : paddingBottom = hauteur de BottomNavigation
  // → empêche l'inputArea de se cacher derrière la barre de navigation absolue
  keyboardView: {
    flex: 1,
    paddingBottom: BOTTOM_NAV_HEIGHT,
  },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, gap: 10,
  },
  headerCenter:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar:   {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#0077b6',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle:    { fontSize: 16, fontWeight: '700' },
  headerSubtitle: { fontSize: 11, color: '#27ae60', fontWeight: '500' },

  disclaimer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 14, paddingVertical: 7,
  },
  disclaimerText: { fontSize: 11, color: '#e67e22', flex: 1, lineHeight: 15 },

  messagesList: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },

  bubbleRow:     { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowBot:  { justifyContent: 'flex-start' },

  botAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#0077b6',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },

  bubble: {
    maxWidth: '80%', borderRadius: 18, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  bubbleUser:    { borderBottomRightRadius: 4 },
  bubbleBot:     { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText:    { fontSize: 14, lineHeight: 20 },
  bubbleTime:    { fontSize: 10, marginTop: 4, textAlign: 'right' },

  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText:      { fontSize: 13 },

  suggestions:      { marginTop: 8, marginBottom: 4 },
  suggestionsLabel: { fontSize: 12, marginBottom: 8, fontWeight: '500' },
  suggestionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip:   { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  suggestionText:   { fontSize: 12, fontWeight: '500' },

  inputArea: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1, borderRadius: 22, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, maxHeight: 100, minHeight: 44, lineHeight: 20,
  },
  sendBtn:         {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#0077b6',
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#b0bec5' },
});

export default ChatbotScreen;