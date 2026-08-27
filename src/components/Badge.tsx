import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Radii } from '../constants/theme';

interface BadgeProps {
  count: number;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ count, style }) => {
  if (count <= 0) return null;

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.secondary,
    minWidth: 20,
    height: 20,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
});
