import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withSafeArea?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  withSafeArea = true,
}) => {
  if (withSafeArea) {
    return (
      <SafeAreaView style={[styles.container, style]}>
        <StatusBar style="light" />
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <StatusBar style="light" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
