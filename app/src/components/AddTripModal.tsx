import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Calendar, MapPin, Image as ImageIcon, Sparkles } from 'lucide-react-native';
import { MobileTrip } from '@/data/tripsData';

interface AddTripModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTrip: (trip: MobileTrip) => void;
}

const PRESET_IMAGES = [
  {
    name: 'Switzerland',
    url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Paris',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Maldives',
    url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'New York',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
  },
];

export function AddTripModal({ visible, onClose, onAddTrip }: AddTripModalProps) {
  const [name, setName] = useState('');
  const [locations, setLocations] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState('7');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'completed'>('upcoming');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);

  const handleSubmit = () => {
    if (!name.trim() || !locations.trim()) return;

    const dateRange =
      startDate && endDate ? `${startDate}  →  ${endDate}` : 'Dates to be announced';

    const newTrip: MobileTrip = {
      id: `trip-${Date.now()}`,
      name: name.trim(),
      status,
      startDate: startDate || '2025-07-01',
      endDate: endDate || '2025-07-08',
      dateRange,
      days: parseInt(days, 10) || 7,
      locations: locations.trim(),
      description:
        description.trim() ||
        'An unforgettable journey exploring local culture and scenic wonders.',
      image: imageUrl.trim() || PRESET_IMAGES[0].url,
      isSaved: false,
    };

    onAddTrip(newTrip);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setLocations('');
    setStartDate('');
    setEndDate('');
    setDays('7');
    setDescription('');
    setStatus('upcoming');
    setImageUrl(PRESET_IMAGES[0].url);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Sparkles size={18} color="#2563eb" />
              </View>
              <Text style={styles.headerTitle}>Add New Trip</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Trip Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Destination / Trip Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Switzerland Alps"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            {/* Status Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Trip Status</Text>
              <View style={styles.statusToggle}>
                <TouchableOpacity
                  onPress={() => setStatus('upcoming')}
                  style={[
                    styles.statusOption,
                    status === 'upcoming' && styles.statusOptionActive,
                  ]}>
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === 'upcoming' && styles.statusOptionTextActive,
                    ]}>
                    🗓️ Upcoming
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStatus('completed')}
                  style={[
                    styles.statusOption,
                    status === 'completed' && styles.statusOptionActive,
                  ]}>
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === 'completed' && styles.statusOptionTextActive,
                    ]}>
                    ✓ Completed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Locations */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Key Locations / Cities *</Text>
              <TextInput
                value={locations}
                onChangeText={setLocations}
                placeholder="e.g. Zurich, Interlaken, Zermatt"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            {/* Dates & Days */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="e.g. Jul 10, 2025"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="e.g. Jul 20, 2025"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </View>
              <View style={[styles.inputGroup, { width: 70, marginLeft: 10 }]}>
                <Text style={styles.label}>Days</Text>
                <TextInput
                  value={days}
                  onChangeText={setDays}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#94a3b8"
                  style={[styles.input, { textAlign: 'center' }]}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Write a brief summary of this adventure..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />
            </View>

            {/* Cover Image */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cover Image URL</Text>
              <TextInput
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Paste image link..."
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
              <Text style={styles.sublabel}>Or select a preset:</Text>
              <View style={styles.presetsRow}>
                {PRESET_IMAGES.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setImageUrl(preset.url)}
                    style={[
                      styles.presetThumb,
                      imageUrl === preset.url && styles.presetThumbActive,
                    ]}>
                    <Image source={{ uri: preset.url }} style={styles.presetImg} />
                    <Text style={styles.presetName} numberOfLines={1}>
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>Add Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    marginTop: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  sublabel: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  statusOptionActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusOptionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
  },
  statusOptionTextActive: {
    color: '#2563eb',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetThumb: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  presetThumbActive: {
    borderColor: '#2563eb',
  },
  presetImg: {
    width: '100%',
    height: 48,
    borderRadius: 6,
  },
  presetName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
