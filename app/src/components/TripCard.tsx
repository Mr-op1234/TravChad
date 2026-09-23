import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Calendar,
  MapPin,
  MoreVertical,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { MobileTrip } from '@/data/tripsData';

interface TripCardProps {
  trip: MobileTrip;
  onPress: (trip: MobileTrip) => void;
  onOptionsPress: (trip: MobileTrip) => void;
}

export function TripCard({ trip, onPress, onOptionsPress }: TripCardProps) {
  const isUpcoming = trip.status === 'upcoming';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(trip)}
      style={styles.cardContainer}>
      {/* Left: Thumbnail Image + Badge */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: trip.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Status Badge */}
        <View
          style={[
            styles.badge,
            isUpcoming ? styles.upcomingBadge : styles.completedBadge,
          ]}>
          {isUpcoming ? (
            <Calendar size={10} color="#ffffff" strokeWidth={2.5} style={styles.badgeIcon} />
          ) : (
            <Check size={10} color="#ffffff" strokeWidth={3} style={styles.badgeIcon} />
          )}
          <Text style={styles.badgeText}>
            {isUpcoming ? 'Upcoming' : 'Completed'}
          </Text>
        </View>
      </View>

      {/* Right: Trip Content */}
      <View style={styles.contentContainer}>
        {/* Title + More Options */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {trip.name}
          </Text>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => onOptionsPress(trip)}
            style={styles.moreButton}>
            <MoreVertical size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Date Range */}
        <Text style={styles.dateRange}>{trip.dateRange}</Text>

        {/* Meta Row: Days & Locations */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={12} color="#64748b" strokeWidth={2} />
            <Text style={styles.metaText}>{trip.days} Days</Text>
          </View>
          <View style={[styles.metaItem, styles.locationItem]}>
            <MapPin size={12} color="#64748b" strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {trip.locations}
            </Text>
          </View>
        </View>

        {/* Description & Chevron Action */}
        <View style={styles.bottomRow}>
          <Text style={styles.description} numberOfLines={2}>
            {trip.description}
          </Text>
          <View style={styles.chevronCircle}>
            <ChevronRight size={14} color="#2563eb" strokeWidth={2.6} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 11,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  imageWrapper: {
    width: 106,
    height: 98,
    borderRadius: 13,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e2e8f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  upcomingBadge: {
    backgroundColor: '#16a34a',
  },
  completedBadge: {
    backgroundColor: '#475569',
  },
  badgeIcon: {
    marginRight: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    minHeight: 96,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
    flex: 1,
  },
  moreButton: {
    padding: 2,
  },
  dateRange: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
  },
  locationItem: {
    flex: 1,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  description: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 15.5,
    color: '#64748b',
  },
  chevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
