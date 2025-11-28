import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { usePartner } from '@/contexts/PartnerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Heart, Copy, UserPlus, Users, Unlink } from 'lucide-react-native';

export default function PartnerPairingScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { isPaired, partnerName, partnerEmail, pairingCode, isLoading, generateCode, acceptCode, unlinkPartner } = usePartner();
  const { colors } = useTheme();

  const handleGenerateCode = async () => {
    try {
      setError('');
      await generateCode();
    } catch (err: any) {
      setError(err.message || 'Failed to generate code');
      Alert.alert('Error', err.message || 'Failed to generate code');
    }
  };

  const handleAcceptCode = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-character code');
      return;
    }

    try {
      setError('');
      await acceptCode(code.toUpperCase());
      Alert.alert('Success', 'Successfully paired with your partner!');
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to accept code');
      Alert.alert('Error', err.message || 'Failed to accept code');
    }
  };

  const handleCopyCode = () => {
    if (pairingCode) {
      Clipboard.setString(pairingCode);
      Alert.alert('Copied', 'Pairing code copied to clipboard');
    }
  };

  const handleUnlink = () => {
    Alert.alert(
      'Unlink Partner',
      'Are you sure you want to unlink from your partner? This will remove all shared data access.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkPartner();
              Alert.alert('Success', 'Successfully unlinked from partner');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to unlink');
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    scrollContent: {
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
      paddingTop: 20,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.softRose,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    card: {
      backgroundColor: colors.lightGray,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    pairedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    partnerInfo: {
      flex: 1,
    },
    partnerName: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    partnerEmail: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    codeContainer: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
    },
    codeLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
    },
    code: {
      fontSize: 32,
      fontWeight: '700' as const,
      color: colors.accentRose,
      letterSpacing: 4,
      marginBottom: 12,
    },
    codeExpiry: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    input: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      fontSize: 18,
      color: colors.textPrimary,
      marginBottom: 12,
      textAlign: 'center',
      letterSpacing: 4,
      fontWeight: '600' as const,
      textTransform: 'uppercase' as const,
    },
    button: {
      backgroundColor: colors.accentRose,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600' as const,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.accentRose,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginTop: 12,
    },
    secondaryButtonText: {
      color: colors.accentRose,
      fontSize: 16,
      fontWeight: '600' as const,
    },
    unlinkButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#EF4444',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginTop: 12,
    },
    unlinkButtonText: {
      color: '#EF4444',
      fontSize: 16,
      fontWeight: '600' as const,
    },
    error: {
      color: '#EF4444',
      fontSize: 14,
      marginBottom: 12,
      textAlign: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: colors.mediumGray,
      marginVertical: 24,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Partner Pairing',
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.textPrimary,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {isPaired ? (
              <Users size={40} color={colors.accentRose} />
            ) : (
              <Heart size={40} color={colors.accentRose} />
            )}
          </View>
          <Text style={styles.title}>
            {isPaired ? 'Partner Linked' : 'Link Your Partner'}
          </Text>
          <Text style={styles.subtitle}>
            {isPaired
              ? 'You and your partner can now see each other\'s progress and goals'
              : 'Connect with your partner using a secret pairing code'}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.accentRose} />
        ) : isPaired ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Partner</Text>
            <View style={styles.pairedCard}>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>
                  {partnerName || 'Partner'}
                </Text>
                {partnerEmail && (
                  <Text style={styles.partnerEmail}>{partnerEmail}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.unlinkButton}
              onPress={handleUnlink}
            >
              <Unlink size={20} color="#EF4444" />
              <Text style={styles.unlinkButtonText}>Unlink Partner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Pairing Code</Text>
              <Text style={styles.infoText}>
                Share this code with your partner so they can connect with you
              </Text>
              {pairingCode ? (
                <>
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Your Code</Text>
                    <Text style={styles.code}>{pairingCode}</Text>
                    <Text style={styles.codeExpiry}>Expires in 24 hours</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleCopyCode}
                  >
                    <Copy size={20} color={colors.accentRose} />
                    <Text style={styles.secondaryButtonText}>Copy Code</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleGenerateCode}
                >
                  <UserPlus size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Generate Pairing Code</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Enter Partner&apos;s Code</Text>
              <Text style={styles.infoText}>
                Have a code from your partner? Enter it below to connect
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TextInput
                style={styles.input}
                placeholder="XXXXXX"
                placeholderTextColor={colors.textSecondary}
                value={code}
                onChangeText={(text) => {
                  setCode(text.toUpperCase());
                  setError('');
                }}
                maxLength={6}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleAcceptCode}
                disabled={code.length !== 6}
              >
                <Users size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Connect with Partner</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
