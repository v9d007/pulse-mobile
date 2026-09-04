import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
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

interface InfoRowProps {
  label: string;
  value: string;
  isEditable?: boolean;
  onPress?: () => void;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  isEditable = true,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.infoRow}
    onPress={onPress}
    disabled={!isEditable}
    activeOpacity={0.7}
  >
    <View style={styles.infoLeft}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value || 'Not set'}
      </Text>
    </View>
    {isEditable && <Text style={styles.infoEditChevron}>›</Text>}
  </TouchableOpacity>
);

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
          'Please allow access to your photo library to choose an avatar.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
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

      // 2. Upload directly to Cloudflare R2 via native FileSystem uploadAsync
      const uploadResponse = await FileSystem.uploadAsync(
        uploadUrl,
        asset.uri,
        {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'Content-Type': mimeType,
          },
        },
      );

      if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
        throw new Error(
          `Storage upload failed with HTTP status ${uploadResponse.status}`,
        );
      }

      // 3. Update user profile with the new file URL
      const updatedUser = await updateProfileApi({
        profileImageUrl: fileUrl,
      }).unwrap();

      dispatch(setUser(updatedUser));
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (err: any) {
      console.warn('Avatar upload failed:', err);
      Alert.alert(
        'Upload Failed',
        err?.data?.message ||
          err?.message ||
          'Could not upload profile photo. Please try again.',
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
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Profile Card */}
        <View style={styles.heroCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickAvatar}
            disabled={isUploadingAvatar}
            activeOpacity={0.8}
          >
            <Avatar
              name={user?.full_name || 'Pulse User'}
              imageUrl={user?.profile_image_url}
              size={104}
              isOnline={true}
            />

            {/* Camera Overlay Badge */}
            <View style={styles.cameraBadge}>
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.cameraIcon}>📷</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.changeHint}>Tap photo to change</Text>

          <Text style={styles.userName}>{user?.full_name || 'Pulse User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@pulse.chat'}</Text>

          {/* Status Note Pill */}
          <TouchableOpacity
            style={styles.statusBadge}
            onPress={handleOpenEditModal}
            activeOpacity={0.7}
          >
            <Text style={styles.statusPulseDot}>🟢</Text>
            <Text style={styles.statusText} numberOfLines={1}>
              {user?.status || 'Active on Pulse'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>PERSONAL INFORMATION</Text>
            <TouchableOpacity onPress={handleOpenEditModal} activeOpacity={0.7}>
              <Text style={styles.sectionEditBtn}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardGroup}>
            <InfoRow
              label="Full Name"
              value={user?.full_name || ''}
              onPress={handleOpenEditModal}
            />
            <View style={styles.divider} />
            <InfoRow
              label="Status Message"
              value={user?.status || ''}
              onPress={handleOpenEditModal}
            />
            <View style={styles.divider} />
            <InfoRow
              label="Phone Number"
              value={user?.phone_number || ''}
              onPress={handleOpenEditModal}
            />
            <View style={styles.divider} />
            <InfoRow
              label="Email Address"
              value={user?.email || ''}
              isEditable={false}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SETTINGS</Text>
          <View style={styles.cardGroup}>
            <SettingRow
              icon="🔒"
              title="Privacy & Security"
              subtitle="Two-factor auth, blocked users"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="🔔"
              title="Notifications"
              subtitle="Sounds, previews, alerts"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="🎨"
              title="Appearance"
              subtitle="Dark Slate (Default)"
            />
          </View>
        </View>

        {/* Log Out */}
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

      {/* Edit Profile Bottom Sheet Modal */}
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
                placeholder="+91 9876543210"
                keyboardType="phone-pad"
                value={editPhoneNumber}
                onChangeText={setEditPhoneNumber}
              />

              <Input
                label="Status Message"
                placeholder="What's your current status?"
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
    fontSize: 17,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraIcon: {
    fontSize: 15,
  },
  changeHint: {
    color: Colors.secondaryLight,
    fontSize: 12,
    fontWeight: '500',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.headlineMd,
    fontSize: 20,
    fontWeight: '700',
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '90%',
  },
  statusPulseDot: {
    fontSize: 8,
    marginRight: 6,
  },
  statusText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sectionEditBtn: {
    color: Colors.secondaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  cardGroup: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  infoLeft: {
    flex: 1,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  infoEditChevron: {
    color: Colors.textMuted,
    fontSize: 20,
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
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
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  logoutButton: {
    height: 48,
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
