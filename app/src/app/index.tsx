import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plane,
  Bell,
  Search,
  Plus,
  Home,
  Compass,
  Heart,
  User,
  X,
} from 'lucide-react-native';

import { PhoneViewWrapper } from '@/components/PhoneViewWrapper';
import { TripCard } from '@/components/TripCard';
import { AddTripModal } from '@/components/AddTripModal';
import { TripDetailModal } from '@/components/TripDetailModal';
import { INITIAL_MOBILE_TRIPS, MobileTrip } from '@/data/tripsData';

type FilterType = 'all' | 'upcoming' | 'completed' | 'saved';
type BottomTabType = 'home' | 'explore' | 'saved' | 'profile';

export default function HomeScreen() {
  const [trips, setTrips] = useState<MobileTrip[]>(INITIAL_MOBILE_TRIPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTabType>('home');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<MobileTrip | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtered trips computation
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // Category filter
      if (activeFilter === 'upcoming' && trip.status !== 'upcoming') return false;
      if (activeFilter === 'completed' && trip.status !== 'completed') return false;
      if (activeFilter === 'saved' && !trip.isSaved) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = trip.name.toLowerCase().includes(q);
        const matchesLoc = trip.locations.toLowerCase().includes(q);
        const matchesDesc = trip.description.toLowerCase().includes(q);
        return matchesName || matchesLoc || matchesDesc;
      }

      return true;
    });
  }, [trips, activeFilter, searchQuery]);

  // Trip operations
  const handleAddTrip = (newTrip: MobileTrip) => {
    setTrips((prev) => [newTrip, ...prev]);
  };

  const handleToggleSave = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isSaved: !t.isSaved } : t))
    );
    if (selectedTrip && selectedTrip.id === id) {
      setSelectedTrip((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : null));
    }
  };

  const handleDeleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCardPress = (trip: MobileTrip) => {
    setSelectedTrip(trip);
    setIsDetailModalOpen(true);
  };

  const handleCardOptions = (trip: MobileTrip) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Delete trip "${trip.name}"?`);
      if (confirmDelete) {
        handleDeleteTrip(trip.id);
      }
    } else {
      Alert.alert(
        trip.name,
        'Choose an action for this trip',
        [
          {
            text: trip.isSaved ? 'Remove from Saved' : 'Save to Favorites',
            onPress: () => handleToggleSave(trip.id),
          },
          {
            text: 'Delete Trip',
            style: 'destructive',
            onPress: () => handleDeleteTrip(trip.id),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const handleBottomTabPress = (tab: BottomTabType) => {
    setActiveBottomTab(tab);
    if (tab === 'saved') {
      setActiveFilter('saved');
    } else if (tab === 'home') {
      setActiveFilter('all');
    }
  };

  return (
    <PhoneViewWrapper>
      <View style={styles.container}>
        {/* Main Scrollable Area */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Top Hero Section with Mountain Background */}
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
            }}
            style={styles.heroBackground}
            resizeMode="cover">
            {/* Soft Gradient Overlay for Readability */}
            <LinearGradient
              colors={['rgba(15, 23, 42, 0.35)', 'rgba(15, 23, 42, 0.55)', '#f8fafc']}
              locations={[0, 0.65, 1]}
              style={styles.gradientOverlay}>
              {/* App Bar: TripMate Logo + Actions */}
              <View style={styles.topBar}>
                <View style={styles.brandRow}>
                  <View style={styles.planeIconWrapper}>
                    <Plane size={20} color="#2563eb" strokeWidth={2.6} />
                  </View>
                  <Text style={styles.brandTitle}>TripMate</Text>
                </View>

                <View style={styles.topRightActions}>
                  <TouchableOpacity
                    style={styles.bellButton}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        window.alert('Notifications: You have 2 upcoming itinerary updates!');
                      } else {
                        Alert.alert('Notifications', 'You have 2 upcoming itinerary updates!');
                      }
                    }}>
                    <Bell size={19} color="#0f172a" strokeWidth={2.2} />
                    <View style={styles.notificationDot} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.avatarWrapper}>
                    <Image
                      source={{
                        uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                      }}
                      style={styles.avatarImage}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Greetings & Inspirational Cursive Banner */}
              <View style={styles.heroGreetingRow}>
                <View style={styles.heroGreetingLeft}>
                  <Text style={styles.helloText}>Hello, Alex!</Text>
                  <Text style={styles.subGreetingText}>
                    Where will your next{'\n'}adventure take you?
                  </Text>
                </View>

                <View style={styles.cursiveTagWrapper}>
                  <Text style={styles.cursiveTagText}>Collect Experiences</Text>
                  <Text style={styles.cursiveTagText}>Not Things</Text>
                  <View style={styles.cursiveUnderline} />
                </View>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Search size={16} color="#94a3b8" strokeWidth={2.2} style={styles.searchIcon} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search your trips..."
                  placeholderTextColor="#94a3b8"
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
                    <X size={14} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Filter Pills */}
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}>
              <TouchableOpacity
                onPress={() => setActiveFilter('all')}
                style={[
                  styles.filterPill,
                  activeFilter === 'all' ? styles.filterPillActive : styles.filterPillInactive,
                ]}>
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'all'
                      ? styles.filterPillTextActive
                      : styles.filterPillTextInactive,
                  ]}>
                  All Trips
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveFilter('upcoming')}
                style={[
                  styles.filterPill,
                  activeFilter === 'upcoming'
                    ? styles.filterPillActive
                    : styles.filterPillInactive,
                ]}>
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'upcoming'
                      ? styles.filterPillTextActive
                      : styles.filterPillTextInactive,
                  ]}>
                  Upcoming
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveFilter('completed')}
                style={[
                  styles.filterPill,
                  activeFilter === 'completed'
                    ? styles.filterPillActive
                    : styles.filterPillInactive,
                ]}>
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'completed'
                      ? styles.filterPillTextActive
                      : styles.filterPillTextInactive,
                  ]}>
                  Completed
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveFilter('saved')}
                style={[
                  styles.filterPill,
                  activeFilter === 'saved'
                    ? styles.filterPillActive
                    : styles.filterPillInactive,
                ]}>
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'saved'
                      ? styles.filterPillTextActive
                      : styles.filterPillTextInactive,
                  ]}>
                  Saved
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Trip Cards List */}
          <View style={styles.tripsListContainer}>
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onPress={handleCardPress}
                  onOptionsPress={handleCardOptions}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Compass size={36} color="#94a3b8" />
                <Text style={styles.emptyTitle}>No trips found</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing your search or choose a different category.
                </Text>
              </View>
            )}

            {/* "+ Add New Trip" Prominent Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setIsAddModalOpen(true)}
              style={styles.addTripButton}>
              <Plus size={18} color="#ffffff" strokeWidth={2.8} />
              <Text style={styles.addTripButtonText}>Add New Trip</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => handleBottomTabPress('home')}
            style={styles.navTab}>
            <Home
              size={22}
              color={activeBottomTab === 'home' ? '#2563eb' : '#64748b'}
              strokeWidth={activeBottomTab === 'home' ? 2.5 : 2}
            />
            <Text
              style={[
                styles.navLabel,
                activeBottomTab === 'home' && styles.navLabelActive,
              ]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleBottomTabPress('explore')}
            style={styles.navTab}>
            <Compass
              size={22}
              color={activeBottomTab === 'explore' ? '#2563eb' : '#64748b'}
              strokeWidth={activeBottomTab === 'explore' ? 2.5 : 2}
            />
            <Text
              style={[
                styles.navLabel,
                activeBottomTab === 'explore' && styles.navLabelActive,
              ]}>
              Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleBottomTabPress('saved')}
            style={styles.navTab}>
            <Heart
              size={22}
              color={activeBottomTab === 'saved' ? '#2563eb' : '#64748b'}
              strokeWidth={activeBottomTab === 'saved' ? 2.5 : 2}
            />
            <Text
              style={[
                styles.navLabel,
                activeBottomTab === 'saved' && styles.navLabelActive,
              ]}>
              Saved
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleBottomTabPress('profile')}
            style={styles.navTab}>
            <User
              size={22}
              color={activeBottomTab === 'profile' ? '#2563eb' : '#64748b'}
              strokeWidth={activeBottomTab === 'profile' ? 2.5 : 2}
            />
            <Text
              style={[
                styles.navLabel,
                activeBottomTab === 'profile' && styles.navLabelActive,
              ]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modals */}
        <AddTripModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddTrip={handleAddTrip}
        />

        <TripDetailModal
          trip={selectedTrip}
          visible={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onToggleSave={handleToggleSave}
          onDeleteTrip={handleDeleteTrip}
        />
      </View>
    </PhoneViewWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroBackground: {
    width: '100%',
    minHeight: 220,
  },
  gradientOverlay: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  planeIconWrapper: {
    transform: [{ rotate: '-35deg' }],
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#ef4444',
  },
  avatarWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  heroGreetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 16,
  },
  heroGreetingLeft: {
    flex: 1,
  },
  helloText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  subGreetingText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#f8fafc',
    marginTop: 2,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cursiveTagWrapper: {
    alignItems: 'flex-end',
    paddingBottom: 2,
    transform: [{ rotate: '-4deg' }],
  },
  cursiveTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
    letterSpacing: 0.2,
  },
  cursiveUnderline: {
    width: 80,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    marginTop: 3,
    transform: [{ rotate: '-2deg' }],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 7,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0f172a',
    padding: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  filterSection: {
    marginTop: 10,
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7.5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterPillInactive: {
    backgroundColor: '#e2e8f0',
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  filterPillTextInactive: {
    color: '#334155',
  },
  tripsListContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  addTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 13,
    paddingVertical: 12.5,
    marginTop: 6,
    marginBottom: 10,
    gap: 7,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addTripButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    flex: 1,
    gap: 3,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  navLabelActive: {
    color: '#2563eb',
  },
});
