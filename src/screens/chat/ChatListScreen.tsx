import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { AppScreenProps } from '../../navigation/types';
import { useAppSelector } from '../../app/hooks';

interface ContactPresence {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
  isRead?: boolean;
  isTyping?: boolean;
}

const MOCK_ONLINE_USERS: ContactPresence[] = [
  { id: '1', name: 'Sarah', isOnline: true },
  { id: '2', name: 'Alex', isOnline: true },
  { id: '3', name: 'David', isOnline: true },
  { id: '4', name: 'Elena', isOnline: true },
  { id: '5', name: 'Maya', isOnline: true },
  { id: '6', name: 'Liam', isOnline: true },
];

const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-1',
    name: 'Sarah Connor',
    lastMessage: "Let's review the real-time API PR 🚀",
    time: '10:42 AM',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'conv-2',
    name: 'Marcus Vance',
    lastMessage: 'The database migration completed successfully.',
    time: '9:15 AM',
    unreadCount: 0,
    isOnline: false,
    isRead: true,
  },
  {
    id: 'conv-3',
    name: 'Design Guild 🎨',
    lastMessage: 'Elena: Updated the new component library tokens...',
    time: 'Yesterday',
    unreadCount: 5,
    isOnline: true,
  },
  {
    id: 'conv-4',
    name: 'Alex Rivera',
    lastMessage: 'See you tomorrow at the standup!',
    time: 'Aug 24',
    unreadCount: 0,
    isOnline: false,
    isRead: true,
  },
  {
    id: 'conv-5',
    name: 'Sophia Chen',
    lastMessage: 'Typing...',
    time: 'Aug 23',
    unreadCount: 0,
    isOnline: true,
    isTyping: true,
  },
];

export default function ChatListScreen({
  navigation,
}: AppScreenProps<'Home'>) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filterChips = ['All', 'Unread (7)', 'Direct', 'Groups'];

  const filteredConversations = MOCK_CONVERSATIONS.filter((item) => {
    if (selectedFilter === 'Unread (7)' && item.unreadCount === 0) return false;
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBadge}>
            <Text style={styles.headerIconText}>⚡</Text>
          </View>
          <Text style={styles.headerTitle}>Pulse</Text>
        </View>

        <TouchableOpacity
          style={styles.profileTrigger}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Avatar
            name={currentUser?.full_name || 'Me'}
            imageUrl={currentUser?.profile_image_url}
            size={36}
          />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search chats or people..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterChips.map((chip) => {
            const isSelected = selectedFilter === chip;
            return (
              <TouchableOpacity
                key={chip}
                onPress={() => setSelectedFilter(chip)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Presence Stories Row */}
      <View style={styles.presenceContainer}>
        <Text style={styles.presenceTitle}>ACTIVE NOW</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presenceScroll}
        >
          {MOCK_ONLINE_USERS.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.presenceItem}
              onPress={() =>
                navigation.navigate('Chat', {
                  conversationId: contact.id,
                  name: contact.name,
                  isOnline: true,
                })
              }
              activeOpacity={0.7}
            >
              <Avatar
                name={contact.name}
                size={52}
                isOnline={contact.isOnline}
              />
              <Text style={styles.presenceName} numberOfLines={1}>
                {contact.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('Chat', {
                conversationId: item.id,
                name: item.name,
                isOnline: item.isOnline,
              })
            }
          >
            <Avatar
              name={item.name}
              imageUrl={item.avatar}
              size={50}
              isOnline={item.isOnline}
            />

            <View style={styles.chatInfo}>
              <View style={styles.chatHeaderRow}>
                <Text style={styles.chatName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>

              <View style={styles.chatMessageRow}>
                <Text
                  style={[
                    styles.chatSnippet,
                    item.unreadCount > 0 && styles.chatSnippetUnread,
                    item.isTyping && styles.chatSnippetTyping,
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
                <Badge count={item.unreadCount} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          navigation.navigate('Chat', {
            conversationId: 'new',
            name: 'Sarah Connor',
            isOnline: true,
          });
        }}
      >
        <Text style={styles.fabIcon}>✍️</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          activeOpacity={0.7}
        >
          <Text style={styles.bottomNavIconActive}>💬</Text>
          <Text style={styles.bottomNavLabelActive}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.bottomNavIcon}>👤</Text>
          <Text style={styles.bottomNavLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 16,
  },
  headerTitle: {
    ...Typography.headlineMd,
  },
  profileTrigger: {
    padding: 2,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    height: 46,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  clearIcon: {
    color: Colors.textMuted,
    fontSize: 14,
    padding: Spacing.xs,
  },
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  presenceContainer: {
    marginBottom: Spacing.md,
  },
  presenceTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  presenceScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  presenceItem: {
    alignItems: 'center',
    width: 60,
  },
  presenceName: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceGlass,
  },
  chatInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  chatTime: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  chatMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatSnippet: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.sm,
  },
  chatSnippetUnread: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  chatSnippetTyping: {
    color: Colors.secondaryLight,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 22,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomNavItem: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  bottomNavIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  bottomNavIconActive: {
    fontSize: 22,
  },
  bottomNavLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  bottomNavLabelActive: {
    fontSize: 11,
    color: Colors.secondaryLight,
    fontWeight: '700',
    marginTop: 2,
  },
});
