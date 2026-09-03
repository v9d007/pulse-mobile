import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { AppScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, setUser } from '../../features/auth/authSlice';
import { useLogoutApiMutation } from '../../services/authApi';
import {
  useGetAvatarUploadUrlMutation,
  useUpdateProfileMutation,
} from '../../services/usersApi';

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

const PRESET_STATUSES = [
  '⚡ Active on Pulse',
  '💻 Working from home',
  '📅 In a meeting',
  '☕ Out for coffee',
  '🔕 Do not disturb',
];

export default function ProfileScreen({
  navigation,
}: AppScreenProps<'Profile'>) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutApiMutation();
  const [updateProfileApi, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [getAvatarUploadUrl] = useGetAvatarUploadUrlMutation();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Edit form state
  const [editFullName, setEditFullName] = useState(user?.full_name || '');
  const [editStatus, setEditStatus] = useState(user?.status || '');
  const [editPhoneNumber, setEditPhoneNumber] = useState(
    user?.phone_number || '',
  );

  const handlePickAvatar = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to upload a profile avatar.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';

      setIsUploadingAvatar(true);

      // 1. Request presigned upload URL from backend
      const { uploadUrl, fileUrl } = await getAvatarUploadUrl({
        fileType: mimeType,
      }).unwrap();

      // 2. Fetch the image file as a Blob/ArrayBuffer
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // 3. Upload directly to S3 via PUT
      await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': mimeType,
        },
      });

      // 4. Update user profile with the new file URL
      const updatedUser = await updateProfileApi({
        profileImageUrl: fileUrl,
      }).unwrap();

      dispatch(setUser(updatedUser));
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (err: any) {
      console.warn('Avatar upload failed:', err);
      Alert.alert(
        'Upload Failed',
        err?.data?.message || 'Could not upload profile photo. Please try again.',
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditFullName(user?.full_name || '');
    setEditStatus(user?.status || '');
    setEditPhoneNumber(user?.phone_number || '');
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      Alert.alert('Validation Error', 'Full name cannot be empty.');
      return;
    }

    try {
      const updatedUser = await updateProfileApi({
        fullName: editFullName.trim(),
        status: editStatus.trim(),
        phoneNumber: editPhoneNumber.trim() || undefined,
      }).unwrap();

      dispatch(setUser(updatedUser));
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert(
        'Update Failed',
        err?.data?.message || 'Failed to update profile.',
      );
    }
  };

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
              // Ignore network error and logout locally
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
        <TouchableOpacity onPress={handleOpenEditModal} activeOpacity={0.7}>
          <Text style={styles.editHeaderBtn}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card with Interactive Avatar */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Avatar
              name={user?.full_name || 'Pulse User'}
              imageUrl={user?.profile_image_url}
              size={88}
              isOnline={true}
            />

            {/* Camera / Edit Overlay Badge */}
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handlePickAvatar}
              disabled={isUploadingAvatar}
              activeOpacity={0.8}
            >
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} />
              ) : (
                <Text style={styles.cameraIcon}>📷</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.full_name || 'Pulse User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@pulse.chat'}</Text>

          {Boolean(user?.phone_number) && (
            <Text style={styles.userPhone}>{user?.phone_number}</Text>
          )}

          <TouchableOpacity
            style={styles.statusBadge}
            onPress={handleOpenEditModal}
            activeOpacity={0.7}
          >
            <Text style={styles.statusText}>
              {user?.status || '⚡ Active on Pulse'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT & SECURITY</Text>
          <SettingRow
            icon="✏️"
            title="Edit Profile"
            subtitle="Change name, status message, and phone"
            onPress={handleOpenEditModal}
          />
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
            isLoading={isLoggingOut}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Input
                label="Full Name"
                placeholder="Your Name"
                value={editFullName}
                onChangeText={setEditFullName}
              />

              <Input
                label="Phone Number"
                placeholder="+1 555-0199"
                keyboardType="phone-pad"
                value={editPhoneNumber}
                onChangeText={setEditPhoneNumber}
              />

              <Input
                label="Status Message"
                placeholder="What's on your mind?"
                value={editStatus}
                onChangeText={setEditStatus}
                maxLength={120}
              />

              {/* Status Presets */}
              <Text style={styles.presetLabel}>QUICK PRESETS</Text>
              <View style={styles.presetRow}>
                {PRESET_STATUSES.map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetChip,
                      editStatus === preset && styles.presetChipActive,
                    ]}
                    onPress={() => setEditStatus(preset)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        editStatus === preset && styles.presetTextActive,
                      ]}
                    >
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setIsEditModalVisible(false)}
                  style={styles.modalCancelBtn}
                />
                <Button
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  isLoading={isUpdatingProfile}
                  style={styles.modalSaveBtn}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  editHeaderBtn: {
    color: Colors.secondaryLight,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: Spacing.xs,
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
  avatarWrapper: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.surface,
  },
  cameraIcon: {
    fontSize: 14,
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
  userPhone: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.headlineMd,
  },
  modalCloseText: {
    color: Colors.textMuted,
    fontSize: 20,
    padding: Spacing.xs,
  },
  presetLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  presetChip: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  presetTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
  },
  modalSaveBtn: {
    flex: 2,
  },
});
