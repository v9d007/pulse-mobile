import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Storage } from '../services/storage';
import { setCredentials } from '../features/auth/authSlice';
import { Colors } from '../constants/theme';

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [accessToken, refreshToken, user] = await Promise.all([
          Storage.getAccessToken(),
          Storage.getRefreshToken(),
          Storage.getUser(),
        ]);

        if (accessToken && refreshToken && user) {
          dispatch(
            setCredentials({
              user,
              tokens: { accessToken, refreshToken },
            }),
          );
        }
      } catch (err) {
        console.warn('Failed to restore session:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    void restoreSession();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});