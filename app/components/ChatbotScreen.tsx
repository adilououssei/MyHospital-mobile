import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useAuth } from '../context/AppContext';
import BottomNavigation from '../tabs/BottomNavigation';
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
  { label: '💊 Pharmacie de garde proche', text: 'Où trouver une pharmacie de garde près de moi ?' },
  { label: '👨‍⚕️ Prendre un rendez-vous',   text: 'Comment prendre un rendez-vous avec un médecin ?' },
  { label: '🏥 Urgences',                   text: 'J\'ai besoin d\'aller aux urgences, que faire ?' },
  { label: '❤️ Problème cardiaque',         text: 'J\'ai des douleurs dans la poitrine, que faire ?' },
  { label: '🤒 Fièvre',                     text: 'J\'ai de la fièvre depuis 3 jours, quel médecin consulter ?' },
  { label: '🤰 Maternité',                  text: 'Je suis enceinte, quels médecins sont disponibles ?' },
];

const MessageBubble = ({ msg, colors, t }: { msg: Message; colors: any; t: (key: string) => string }) => {
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
          ? [styles.bubbleUser, { backgroundColor: '#1a56db' }]
          : [styles.bubbleBot, { backgroundColor: colors.card, borderColor: colors.border }],
      ]}>
        {msg.loading ? (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#1a56db" />
            <Text style={[styles.typingText, { color: colors.subText }]}>{t('chatbotThinking')}</Text>
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

const ChatbotScreen = ({ onNavigate }: Props) => {
  const { colors, t } = useApp();
  const { user }   = useAuth();
  const insets     = useSafeAreaInsets();

  const [messages, setMessages]               = useState<Message[]>([]);
  const [inputText, setInputText]             = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `${t('chatbotWelcome')}${user?.prenom ? ' ' + user.prenom : ''}${t('chatbotWelcome2')}${t('chatbotWelcome3')}`,
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

      const botContent = response.data.message || t('chatbotNoResponse');
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
          content: t('chatbotError'),
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
      content: t('chatbotReset'),
      timestamp: new Date(),
    }]);
    setShowSuggestions(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble msg={item} colors={colors} t={t} />
  ), [colors, t]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom', 'left', 'right']}
    >
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Ionicons name="hardware-chip" size={18} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>MedBot</Text>
            <Text style={styles.headerSubtitle}>{t('chatbotAssistant')} • {t('chatbotOnline')}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearHistory} style={{ padding: 4 }}>
          <Ionicons name="refresh-outline" size={22} color={colors.subText} />
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={13} color="#e67e22" />
        <Text style={styles.disclaimerText}>
          {t('chatbotDisclaimer')}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={[styles.keyboardView, { paddingBottom: insets.bottom + 64 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 115 : 0}
      >
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
                  {t('chatbotSuggestions')}
                </Text>
                <View style={styles.suggestionsGrid}>
                  {QUICK_SUGGESTIONS.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.suggestionChip}
                      onPress={() => sendMessage(s.text)}
                    >
                      <Text style={styles.suggestionText}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            placeholder={t('searchPlaceholder')}
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

      <BottomNavigation currentScreen="chatbot" onNavigate={onNavigate} />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f0f4f8' },

  keyboardView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 12,
    borderBottomWidth: 1, gap: 10,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  headerCenter:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar:   {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1a56db',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle:    { fontSize: 17, fontWeight: '700' },
  headerSubtitle: { fontSize: 11, color: '#27ae60', fontWeight: '500' },

  disclaimer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 14, paddingVertical: 7,
  },
  disclaimerText: { fontSize: 11, color: '#e67e22', flex: 1, lineHeight: 15 },

  messagesList: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },

  bubbleRow:     { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowBot:  { justifyContent: 'flex-start' },

  botAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#1a56db',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },

  bubble: {
    maxWidth: '80%', borderRadius: 16, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
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
  suggestionChip:   {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#e5e7eb',
  },
  suggestionText:   { fontSize: 12, fontWeight: '500', color: '#1a56db' },

  inputArea: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  textInput: {
    flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, maxHeight: 100, minHeight: 44, lineHeight: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  sendBtn:         {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#1a3fad',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1a56db', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  sendBtnDisabled: { backgroundColor: '#9ca3af' },
});

export default ChatbotScreen;
