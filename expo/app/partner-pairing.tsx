import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Heart, Copy, UserPlus, Users, Unlink, Check, ArrowRight } from 'lucide-react-native';

interface Partnership {
  userId: string;
  partnerId: string;
  partnerName: string;
  pairingCode: string;
  pairedAt: string;
}

export default function PartnerPairingScreen() {
  const [code, setCode] = useState('');
  const [myCode, setMyCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [partnerInfo, setPartnerInfo] = useState<Partnership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    loadPartnership();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const loadPartnership = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(`partnership_${user?.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setPartnerInfo(data);
      } else {
        const newCode = generateUniqueCode();
        setMyCode(newCode);
        await AsyncStorage.setItem(`user_code_${user?.id}`, newCode);
      }
    } catch (error) {
      console.error('Error loading partnership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNewCode = async () => {
    try {
      setError('');
      const newCode = generateUniqueCode();
      setMyCode(newCode);
      await AsyncStorage.setItem(`user_code_${user?.id}`, newCode);
      setSuccess('New code generated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to generate code');
    }
  };

  const handleConnectWithCode = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-character code');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      if (code === myCode) {
        setError('You cannot use your own code!');
        return;
      }

      const partnerName = await AsyncStorage.getItem(`user_name_${code}`);
      
      const partnership: Partnership = {
        userId: user?.id || '',
        partnerId: code,
        partnerName: partnerName || 'Your Partner',
        pairingCode: code,
        pairedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(`partnership_${user?.id}`, JSON.stringify(partnership));
      await AsyncStorage.setItem(`partnership_${code}`, JSON.stringify({
        ...partnership,
        userId: code,
        partnerId: user?.id,
      }));

      setPartnerInfo(partnership);
      Alert.alert('Success! 🎉', 'You are now connected with your partner!');
      setCode('');
    } catch {
      setError('Failed to connect. Make sure the code is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (myCode) {
      await Clipboard.setStringAsync(myCode);
      setSuccess('Code copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleUnlink = () => {
    Alert.alert(
      'Unlink Partner',
      'Are you sure you want to unlink from your partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`partnership_${user?.id}`);
              if (partnerInfo) {
                await AsyncStorage.removeItem(`partnership_${partnerInfo.partnerId}`);
              }
              setPartnerInfo(null);
              const newCode = generateUniqueCode();
              setMyCode(newCode);
              await AsyncStorage.setItem(`user_code_${user?.id}`, newCode);
              Alert.alert('Unlinked', 'You have been unlinked from your partner');
            } catch {
              Alert.alert('Error', 'Failed to unlink');
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
    successMessage: {
      backgroundColor: '#10B981',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    successText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600' as const,
      flex: 1,
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
            {partnerInfo ? (
              <Users size={40} color={colors.accentRose} />
            ) : (
              <Heart size={40} color={colors.accentRose} />
            )}
          </View>
          <Text style={styles.title}>
            {partnerInfo ? 'Partner Connected' : 'Connect With Partner'}
          </Text>
          <Text style={styles.subtitle}>
            {partnerInfo
              ? 'You and your partner are now connected!'
              : 'Share your code or enter your partner&apos;s code to connect'}
          </Text>
        </View>

        {success ? (
          <View style={styles.successMessage}>
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accentRose} />
          </View>
        ) : partnerInfo ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>✨ Your Partner</Text>
            <View style={styles.pairedCard}>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>
                  {partnerInfo.partnerName}
                </Text>
                <Text style={styles.partnerEmail}>
                  Connected on {new Date(partnerInfo.pairedAt).toLocaleDateString()}
                </Text>
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
              <Text style={styles.cardTitle}>📱 Your Connection Code</Text>
              <Text style={styles.infoText}>
                Share this code with your partner so they can connect with you. Each user needs to enter the other&apos;s code.
              </Text>
              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Your Code</Text>
                <Text style={styles.code}>{myCode || '------'}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1 }]}
                  onPress={handleCopyCode}
                >
                  <Copy size={20} color={colors.accentRose} />
                  <Text style={styles.secondaryButtonText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1 }]}
                  onPress={handleGenerateNewCode}
                >
                  <UserPlus size={20} color={colors.accentRose} />
                  <Text style={styles.secondaryButtonText}>New Code</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>💝 Enter Partner&apos;s Code</Text>
              <Text style={styles.infoText}>
                Ask your partner for their code and enter it below to connect
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
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
                style={[styles.button, code.length !== 6 && { opacity: 0.5 }]}
                onPress={handleConnectWithCode}
                disabled={code.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <ArrowRight size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Connect Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
