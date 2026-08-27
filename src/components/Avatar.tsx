import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii } from '../constants/theme';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 48,
  isOnline = false,
}) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const indicatorSize = Math.max(10, size * 0.25);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {isOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
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
  },
  image: {
    backgroundColor: Colors.surface,
  },
  fallback: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: Colors.background,
  },
});
