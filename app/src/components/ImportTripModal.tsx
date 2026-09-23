import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ticket, X, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { verifyAndFetchTrip } from '@/services/api';
import { MobileTrip } from '@/data/tripsData';

interface ImportTripModalProps {
  visible: boolean;
  onClose: () => void;
  onTripImported: (trip: MobileTrip) => void;
}

const DEMO_CODES = ['TC-JAPAN', 'TC-ITALY', 'TC-NEWZEALAND', 'TC-BALI', 'TC-SANTORINI'];

export function ImportTripModal({ visible, onClose, onTripImported }: ImportTripModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleVerify = async (codeToVerify?: string) => {
    const targetCode = (codeToVerify || code).trim().toUpperCase();
    if (!targetCode) {
      setErrorMessage('Please enter a trip code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await verifyAndFetchTrip(targetCode);
    setIsLoading(false);

    if (!res.success || !res.trip) {
      setErrorMessage(res.error || 'Failed to verify trip code.');
      return;
    }

    setSuccessMessage(`Verified "${res.trip.name}"! Importing...`);
    setTimeout(() => {
      onTripImported(res.trip!);
      handleClose();
    }, 600);
  };

  const handleClose = () => {
    setCode('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ticket size={20} color="#2563eb" strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.title}>Enter Trip Code</Text>
                <Text style={styles.subtitle}>Import your itinerary from the web app</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Description hint */}
          <Text style={styles.infoText}>
            Each trip code is generated in the web app for travel agents. Enter your unique code below to import your complete itinerary.
          </Text>

          {/* Code Input */}
          <View style={styles.inputContainer}>
            <TextInput
              value={code}
              onChangeText={(text) => {
                setCode(text.toUpperCase());
                setErrorMessage(null);
              }}
              placeholder="e.g. TC-JAPAN"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.codeInput}
              editable={!isLoading}
              onSubmitEditing={() => handleVerify()}
            />
          </View>

          {/* Quick Demo Code Pill Buttons */}
          <View style={styles.demoSection}>
            <Text style={styles.demoLabel}>Or try a sample code:</Text>
            <View style={styles.demoPillsRow}>
              {DEMO_CODES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    setCode(c);
                    handleVerify(c);
                  }}
                  style={styles.demoPill}>
                  <Text style={styles.demoPillText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Feedback Messages */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#ef4444" style={styles.feedbackIcon} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBox}>
              <CheckCircle2 size={16} color="#16a34a" style={styles.feedbackIcon} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleVerify()}
              disabled={isLoading || !code.trim()}
              style={[
                styles.submitBtn,
                (!code.trim() || isLoading) && styles.submitBtnDisabled,
              ]}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Verify & Import</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  inputContainer: {
    marginBottom: 12,
  },
  codeInput: {
    borderWidth: 1.5,
    borderColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#1e3a8a',
    backgroundColor: '#f8fafc',
    textAlign: 'center',
    letterSpacing: 2,
  },
  demoSection: {
    marginBottom: 14,
  },
  demoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  demoPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 9,
    padding: 10,
    marginBottom: 12,
  },
  feedbackIcon: {
    marginRight: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    flex: 1,
    fontWeight: '500',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 9,
    padding: 10,
    marginBottom: 12,
  },
  successText: {
    fontSize: 12,
    color: '#16a34a',
    flex: 1,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748b',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
