import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Heart,
  Share2,
  Trash2,
  Compass,
} from 'lucide-react-native';
import { MobileTrip } from '@/data/tripsData';

interface TripDetailModalProps {
  trip: MobileTrip | null;
  visible: boolean;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  onDeleteTrip: (id: string) => void;
}

export function TripDetailModal({
  trip,
  visible,
  onClose,
  onToggleSave,
  onDeleteTrip,
}: TripDetailModalProps) {
  if (!trip) return null;

  const isUpcoming = trip.status === 'upcoming';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Cover Hero with Close & Heart Buttons */}
          <View style={styles.heroContainer}>
            <Image source={{ uri: trip.image }} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
              <TouchableOpacity onPress={onClose} style={styles.floatingCircleBtn}>
                <X size={18} color="#0f172a" />
              </TouchableOpacity>
              <View style={styles.heroRightActions}>
                <TouchableOpacity
                  onPress={() => onToggleSave(trip.id)}
                  style={styles.floatingCircleBtn}>
                  <Heart
                    size={18}
                    color={trip.isSaved ? '#ef4444' : '#0f172a'}
                    fill={trip.isSaved ? '#ef4444' : 'transparent'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onDeleteTrip(trip.id);
                    onClose();
                  }}
                  style={[styles.floatingCircleBtn, styles.deleteBtn]}>
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Pill Badge */}
            <View
              style={[
                styles.statusBadge,
                isUpcoming ? styles.upcomingBadge : styles.completedBadge,
              ]}>
              <Text style={styles.statusBadgeText}>
                {isUpcoming ? '🗓️ Upcoming Adventure' : '✓ Completed Journey'}
              </Text>
            </View>
          </View>

          {/* Details Scroll Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Title & Date Range */}
            <View style={styles.titleSection}>
              <Text style={styles.tripTitle}>{trip.name}</Text>
              <Text style={styles.tripDateRange}>{trip.dateRange}</Text>
            </View>

            {/* Quick Stat Chips */}
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Calendar size={14} color="#2563eb" />
                <Text style={styles.chipText}>{trip.days} Days</Text>
              </View>
              <View style={styles.chip}>
                <MapPin size={14} color="#2563eb" />
                <Text style={styles.chipText} numberOfLines={1}>
                  {trip.locations}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>About this trip</Text>
              <Text style={styles.descriptionText}>{trip.description}</Text>
            </View>

            {/* Highlights Card */}
            <View style={styles.highlightsCard}>
              <View style={styles.highlightsHeader}>
                <Compass size={16} color="#2563eb" />
                <Text style={styles.highlightsTitle}>Itinerary Highlights</Text>
              </View>
              <View style={styles.itineraryItem}>
                <View style={styles.dot} />
                <Text style={styles.itineraryText}>
                  Explore historical landmarks, museums & cultural heritage
                </Text>
              </View>
              <View style={styles.itineraryItem}>
                <View style={styles.dot} />
                <Text style={styles.itineraryText}>
                  Savor authentic regional culinary delicacies
                </Text>
              </View>
              <View style={styles.itineraryItem}>
                <View style={styles.dot} />
                <Text style={styles.itineraryText}>
                  Capture picturesque scenery and natural wonders
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  heroContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#1e293b',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...(StyleSheet.absoluteFill as object),
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  floatingCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heroRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  upcomingBadge: {
    backgroundColor: '#16a34a',
  },
  completedBadge: {
    backgroundColor: '#334155',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  titleSection: {
    marginBottom: 12,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  tripDateRange: {
    fontSize: 13.5,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#475569',
  },
  highlightsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  highlightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  highlightsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1e293b',
  },
  itineraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
  },
  itineraryText: {
    fontSize: 12.5,
    color: '#475569',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  doneBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
