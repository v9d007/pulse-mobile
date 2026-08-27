import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Avatar } from '../../components/Avatar';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { AppScreenProps } from '../../navigation/types';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    text: 'Hey! Did you check out the new backend foundation for Pulse?',
    sender: 'other',
    time: '10:38 AM',
  },
  {
    id: 'm2',
    text: 'Yes! Just finished reviewing the database pool & Zod config. Works like a charm 🚀',
    sender: 'me',
    time: '10:40 AM',
  },
  {
    id: 'm3',
    text: "Awesome! Let's review the real-time API PR together before merging.",
    sender: 'other',
    time: '10:42 AM',
  },
];

const SMART_REPLIES = [
  'Sounds great! 👍',
  "I'll open the PR now 💻",
  "Let's connect at 5 PM ⏰",
];

export default function ChatScreen({
  route,
  navigation,
}: AppScreenProps<'Chat'>) {
  const { name = 'Sarah Connor', isOnline = true, avatar } =
    route.params || {};

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: content.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  return (
    <ScreenWrapper>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerUser}>
          <Avatar name={name} imageUrl={avatar} size={40} isOnline={isOnline} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.headerStatus}>
              {isOnline ? 'Active now' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>📹</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Thread */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isMe = item.sender === 'me';
            return (
              <View
                style={[
                  styles.messageRow,
                  isMe ? styles.messageRowMe : styles.messageRowOther,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.bubbleMe : styles.bubbleOther,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isMe ? styles.textMe : styles.textOther,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      isMe ? styles.timeMe : styles.timeOther,
                    ]}
                  >
                    {item.time} {isMe ? '✓✓' : ''}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* AI Smart Replies Suggestions Bar */}
        <View style={styles.smartRepliesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.smartRepliesScroll}
          >
            {SMART_REPLIES.map((reply) => (
              <TouchableOpacity
                key={reply}
                style={styles.smartReplyChip}
                onPress={() => handleSend(reply)}
                activeOpacity={0.7}
              >
                <Text style={styles.smartReplyText}>✨ {reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Input Composer */}
        <View style={styles.composerContainer}>
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
            <Text style={styles.attachIcon}>➕</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.composerInput}
            placeholder={`Message ${name.split(' ')[0]}...`}
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              Boolean(inputText.trim()) && styles.sendButtonActive,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>🚀</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  backIcon: {
    color: Colors.textPrimary,
    fontSize: 26,
    lineHeight: 28,
  },
  headerUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  headerInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  headerName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerStatus: {
    color: Colors.online,
    fontSize: 12,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 15,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.lg,
  },
  bubbleMe: {
    backgroundColor: Colors.sentBubble,
    borderBottomRightRadius: Radii.xs,
  },
  bubbleOther: {
    backgroundColor: Colors.receivedBubble,
    borderBottomLeftRadius: Radii.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMe: {
    color: Colors.sentBubbleText,
  },
  textOther: {
    color: Colors.receivedBubbleText,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeOther: {
    color: Colors.textMuted,
  },
  smartRepliesContainer: {
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceGlass,
  },
  smartRepliesScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  smartReplyChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  smartReplyText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    fontSize: 14,
  },
  composerInput: {
    flex: 1,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  sendIcon: {
    fontSize: 15,
  },
});
