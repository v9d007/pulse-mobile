import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { AppScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useLogoutApiMutation } from '../../services/authApi';

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingIconContainer}>
      <Text style={styles.settingIcon}>{icon}</Text>
    </View>
    <View style={styles.settingInfo}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <Text style={styles.settingChevron}>›</Text>
  </TouchableOpacity>
);

export default function ProfileScreen({
  navigation,
}: AppScreenProps<'Profile'>) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutApi, { isLoading }] = useLogoutApiMutation();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Pulse?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutApi().unwrap();
            } catch {
              // Ignore network failure and logout locally
            } finally {
              dispatch(logout());
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.profileCard}>
          <Avatar
            name={user?.full_name || 'Pulse User'}
            imageUrl={user?.profile_image_url}
            size={80}
            isOnline={true}
          />
          <Text style={styles.userName}>{user?.full_name || 'Pulse User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@pulse.chat'}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              ⚡ {user?.status || 'Active on Pulse'}
            </Text>
          </View>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT & SECURITY</Text>
          <SettingRow
            icon="🔒"
            title="Privacy & Security"
            subtitle="Two-factor authentication, end-to-end encryption"
          />
          <SettingRow
            icon="🔔"
            title="Notifications & Sounds"
            subtitle="Message previews, call tones"
          />
          <SettingRow
            icon="🎨"
            title="Appearance"
            subtitle="Dark Mode (Default), Chat Wallpapers"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SUPPORT & ABOUT</Text>
          <SettingRow icon="❓" title="Help & Feedback" />
          <SettingRow icon="ℹ️" title="About Pulse" subtitle="Version 1.0.0" />
        </View>

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <Button
            title="Log Out"
            variant="danger"
            onPress={handleLogout}
            isLoading={isLoading}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: Colors.textPrimary,
    fontSize: 26,
    lineHeight: 28,
  },
  headerTitle: {
    ...Typography.title,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userName: {
    ...Typography.headlineMd,
    marginTop: Spacing.md,
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    marginTop: Spacing.md,
  },
  statusText: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingIcon: {
    fontSize: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  settingChevron: {
    color: Colors.textMuted,
    fontSize: 20,
    marginLeft: Spacing.sm,
  },
  logoutContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  logoutButton: {
    height: 50,
  },
});
