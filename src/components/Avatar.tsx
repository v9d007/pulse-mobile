import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  isOnline?: boolean;
}

// Consistent color palette for initials avatars
const AVATAR_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
];

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 48,
  isOnline = false,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const getInitials = (fullName: string) => {
    if (!fullName) return 'P';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const getBgColor = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const indicatorSize = Math.max(10, size * 0.25);
  const bgColor = getBgColor(name || 'Pulse');

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {/* Background Initials Fallback (Always exists so never transparent) */}
      <View
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
          },
        ]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
          {getInitials(name)}
        </Text>
      </View>

      {/* Actual Image if available and not errored */}
      {Boolean(imageUrl) && !imageError && (
        <Image
          source={{ uri: imageUrl! }}
          onError={() => setImageError(true)}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          resizeMode="cover"
        />
      )}

      {/* Online indicator badge */}
      {isOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
              bottom: 1,
              right: 1,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: Colors.background,
  },
});
