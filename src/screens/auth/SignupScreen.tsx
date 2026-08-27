import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { AuthScreenProps } from '../../navigation/types';
import { useSignupMutation } from '../../services/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from '../../features/auth/authSlice';

export default function SignupScreen({
  navigation,
}: AuthScreenProps<'Signup'>) {
  const dispatch = useAppDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute password strength (1 to 4 bars)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 10) strength += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong'];
  const strengthColors = [
    Colors.error,
    Colors.warning,
    Colors.secondary,
    Colors.online,
  ];

  const handleSignup = async () => {
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    try {
      const response = await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
      }).unwrap();

      dispatch(setCredentials(response));
    } catch (err: any) {
      const message =
        err?.data?.message || err?.error || 'Registration failed. Please try again.';
      setError(message);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Pulse for fast, secure messaging
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            <Input
              label="Full Name"
              placeholder="Alex Johnson"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setError(null);
              }}
            />

            <Input
              label="Email Address"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
            />

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarsRow}>
                  {[1, 2, 3, 4].map((bar) => (
                    <View
                      key={bar}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            bar <= strength
                              ? strengthColors[strength - 1]
                              : Colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.strengthLabel,
                    { color: strengthColors[strength - 1] || Colors.textMuted },
                  ]}
                >
                  {strengthLabels[strength - 1] || ''}
                </Text>
              </View>
            )}

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              isPassword
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError(null);
              }}
            />

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  agreeTerms && styles.checkboxActive,
                ]}
              >
                {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsHighlight}>Terms of Service</Text> and{' '}
                <Text style={styles.termsHighlight}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button
              title="Create Account"
              onPress={handleSignup}
              isLoading={isLoading}
              style={styles.createButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.logInLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
  },
  title: {
    ...Typography.headlineLg,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  strengthBarsRow: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginRight: Spacing.md,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: Radii.xs,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  termsText: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  termsHighlight: {
    color: Colors.secondaryLight,
    fontWeight: '600',
  },
  createButton: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  logInLink: {
    color: Colors.secondaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
