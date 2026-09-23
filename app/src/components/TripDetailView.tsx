import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  MoreVertical,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileText,
  Plane,
  Shield,
  Hotel,
  Globe,
  PlusCircle,
  Map,
  ExternalLink,
  Share2,
  Trash2,
} from 'lucide-react-native';
import { MobileTrip, TripDocument, EventItem } from '@/data/tripsData';

interface TripDetailViewProps {
  trip: MobileTrip;
  onBack: () => void;
  onDeleteTrip?: (id: string) => void;
}

// Default documents matching mockup if none attached from web
const DEFAULT_DOCS: TripDocument[] = [
  {
    id: 'doc-1',
    type: 'passport',
    title: 'Passport',
    description: 'A valid passport with at least 6 months validity from your travel dates.',
    fileName: 'passport.pdf',
    fileSize: '2.4 MB',
    colorScheme: 'blue',
  },
  {
    id: 'doc-2',
    type: 'flight',
    title: 'Flight Itinerary',
    description: 'Your confirmed flight details (arrival and departure).',
    fileName: 'flight-itinerary.pdf',
    fileSize: '1.1 MB',
    colorScheme: 'sky',
  },
  {
    id: 'doc-3',
    type: 'hotel',
    title: 'Hotel Bookings',
    description: 'Confirmation vouchers for all accommodations.',
    fileName: 'hotel-bookings.pdf',
    fileSize: '3.2 MB',
    colorScheme: 'green',
  },
  {
    id: 'doc-4',
    type: 'insurance',
    title: 'Travel Insurance',
    description: 'Your travel insurance policy details.',
    fileName: 'travel-insurance.pdf',
    fileSize: '1.8 MB',
    colorScheme: 'red',
  },
  {
    id: 'doc-5',
    type: 'visa',
    title: 'Visa (if required)',
    description: 'Copy of your visa approval (if required).',
    fileName: 'visa.pdf',
    fileSize: '900 KB',
    colorScheme: 'purple',
  },
];

export function TripDetailView({ trip, onBack, onDeleteTrip }: TripDetailViewProps) {
  const [isDocsExpanded, setIsDocsExpanded] = useState(true);
  const [isItineraryExpanded, setIsItineraryExpanded] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Documents list
  const documents =
    trip.documents && trip.documents.length > 0 ? trip.documents : DEFAULT_DOCS;

  const handleOpenDoc = (doc: TripDocument) => {
    const msg = `Viewing ${doc.title} (${doc.fileName} • ${doc.fileSize})\n\n${doc.description}`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert(doc.title, msg, [{ text: 'OK' }]);
    }
  };

  const handleOpenMap = (location: string) => {
    const query = encodeURIComponent(location);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const handleMoreOptions = () => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Remove trip "${trip.name}" from this device?`);
      if (confirmDelete && onDeleteTrip) {
        onDeleteTrip(trip.id);
        onBack();
      }
    } else {
      Alert.alert(
        trip.name,
        `Trip Code: ${trip.tripCode || 'N/A'}`,
        [
          {
            text: 'Delete Trip from Device',
            style: 'destructive',
            onPress: () => {
              if (onDeleteTrip) {
                onDeleteTrip(trip.id);
                onBack();
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // Helper icon for document types
  const renderDocIcon = (doc: TripDocument) => {
    const iconSize = 20;
    switch (doc.type) {
      case 'passport':
        return (
          <View style={[styles.docIconCircle, { backgroundColor: '#e0f2fe' }]}>
            <Globe size={iconSize} color="#0284c7" strokeWidth={2.2} />
          </View>
        );
      case 'flight':
        return (
          <View style={[styles.docIconCircle, { backgroundColor: '#e0f2fe' }]}>
            <Plane size={iconSize} color="#2563eb" strokeWidth={2.2} />
          </View>
        );
      case 'hotel':
        return (
          <View style={[styles.docIconCircle, { backgroundColor: '#dcfce7' }]}>
            <Hotel size={iconSize} color="#16a34a" strokeWidth={2.2} />
          </View>
        );
      case 'insurance':
        return (
          <View style={[styles.docIconCircle, { backgroundColor: '#fee2e2' }]}>
            <Shield size={iconSize} color="#dc2626" strokeWidth={2.2} />
          </View>
        );
      case 'visa':
      default:
        return (
          <View style={[styles.docIconCircle, { backgroundColor: '#f3e8ff' }]}>
            <FileText size={iconSize} color="#9333ea" strokeWidth={2.2} />
          </View>
        );
    }
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top Hero Banner */}
        <ImageBackground
          source={{
            uri:
              trip.image ||
              'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
          }}
          style={styles.heroBackground}
          resizeMode="cover">
          {/* Top Floating Action Buttons */}
          <View style={styles.heroNav}>
            <TouchableOpacity onPress={onBack} style={styles.circleActionBtn}>
              <ChevronLeft size={22} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleMoreOptions} style={styles.circleActionBtn}>
              <MoreVertical size={20} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Hero Content Overlay */}
          <View style={styles.heroBottomRow}>
            {/* Left: Title & Meta */}
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>{trip.name}</Text>

              <View style={styles.heroMetaItem}>
                <Calendar size={13} color="#ffffff" strokeWidth={2.2} />
                <Text style={styles.heroMetaText}>{trip.days} Days</Text>
              </View>

              <View style={styles.heroMetaItem}>
                <Clock size={13} color="#ffffff" strokeWidth={2.2} />
                <Text style={styles.heroMetaText}>{trip.dateRange}</Text>
              </View>
            </View>

            {/* Right: Cursive Tagline */}
            <View style={styles.heroRight}>
              <Text style={styles.cursiveLine}>Good</Text>
              <Text style={styles.cursiveLine}>Trips</Text>
              <Text style={styles.cursiveLine}>Brighter</Text>
              <Text style={styles.cursiveLine}>Stories</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Content Sheet */}
        <View style={styles.sheetContainer}>
          {/* Section 1: Information and documents */}
          <View style={styles.sectionCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsDocsExpanded(!isDocsExpanded)}
              style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionIconWrapper}>
                  <FileText size={18} color="#2563eb" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Information and documents</Text>
                  <Text style={styles.sectionSubtitle}>
                    All important information for your trip in one place.
                  </Text>
                </View>
              </View>
              {isDocsExpanded ? (
                <ChevronUp size={20} color="#1e293b" strokeWidth={2.4} />
              ) : (
                <ChevronDown size={20} color="#1e293b" strokeWidth={2.4} />
              )}
            </TouchableOpacity>

            {isDocsExpanded && (
              <View style={styles.docsContent}>
                {documents.map((doc, idx) => (
                  <TouchableOpacity
                    key={doc.id || idx}
                    activeOpacity={0.7}
                    onPress={() => handleOpenDoc(doc)}
                    style={styles.docItem}>
                    {renderDocIcon(doc)}
                    <View style={styles.docTextContainer}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      <Text style={styles.docDesc}>{doc.description}</Text>
                      <Text style={styles.docMeta}>
                        {doc.fileName}  •  {doc.fileSize}
                      </Text>
                    </View>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => handleOpenDoc(doc)}
                      style={styles.docMoreBtn}>
                      <MoreVertical size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}

                {/* "+ Add More Documents" Dashed Card */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    const msg = 'Upload local traveller documents (Tickets, Boarding pass, Vouchers)';
                    if (Platform.OS === 'web') window.alert(msg);
                    else Alert.alert('Add Document', msg);
                  }}
                  style={styles.addDocsDashedBox}>
                  <View style={styles.addDocsHeader}>
                    <PlusCircle size={17} color="#2563eb" strokeWidth={2.4} />
                    <Text style={styles.addDocsTitle}>Add More Documents</Text>
                  </View>
                  <Text style={styles.addDocsSubtitle}>
                    Upload any additional documents for your trip.
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Section 2: Itinerary */}
          <View style={[styles.sectionCard, styles.itinerarySectionCard]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsItineraryExpanded(!isItineraryExpanded)}
              style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionIconWrapper}>
                  <Map size={18} color="#2563eb" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Itinerary</Text>
                  <Text style={styles.sectionSubtitle}>
                    Your day-by-day plan. Expand each event for more details.
                  </Text>
                </View>
              </View>
              {isItineraryExpanded ? (
                <ChevronUp size={20} color="#1e293b" strokeWidth={2.4} />
              ) : (
                <ChevronDown size={20} color="#1e293b" strokeWidth={2.4} />
              )}
            </TouchableOpacity>

            {isItineraryExpanded && (
              <View style={styles.itineraryContent}>
                {trip.events && trip.events.length > 0 ? (
                  trip.events.map((evt: EventItem, idx: number) => {
                    const isExpanded = expandedEventId === evt.id;
                    return (
                      <View key={evt.id || idx} style={styles.eventCard}>
                        {/* Event Header */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() =>
                            setExpandedEventId(isExpanded ? null : evt.id)
                          }
                          style={styles.eventCardHeader}>
                          {evt.coverImage ? (
                            <Image
                              source={{ uri: evt.coverImage }}
                              style={styles.eventThumb}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.eventThumbPlaceholder}>
                              <Map size={16} color="#94a3b8" />
                            </View>
                          )}

                          <View style={styles.eventHeaderInfo}>
                            <Text style={styles.eventDayBadge}>
                              DAY {evt.dayNumber || idx + 1}
                            </Text>
                            <Text style={styles.eventTitle}>{evt.title}</Text>
                            <View style={styles.eventSubMeta}>
                              <Text style={styles.eventDateText}>{evt.date}</Text>
                              <Text style={styles.dotSeparator}>•</Text>
                              <Text style={styles.eventDurationText}>{evt.duration}</Text>
                            </View>
                          </View>

                          <View style={styles.expandChevronCircle}>
                            {isExpanded ? (
                              <ChevronUp size={16} color="#64748b" />
                            ) : (
                              <ChevronDown size={16} color="#64748b" />
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* Location Link (Always accessible) */}
                        {evt.location && (
                          <TouchableOpacity
                            onPress={() => handleOpenMap(evt.location)}
                            style={styles.eventLocationRow}>
                            <MapPin size={13} color="#2563eb" />
                            <Text style={styles.eventLocationText} numberOfLines={1}>
                              {evt.location}
                            </Text>
                            <ExternalLink size={11} color="#94a3b8" style={{ marginLeft: 3 }} />
                          </TouchableOpacity>
                        )}

                        {/* Expanded details: Description, Notes & Photos */}
                        {isExpanded && (
                          <View style={styles.eventExpandedDetails}>
                            {evt.description && (
                              <Text style={styles.eventDescText}>
                                {evt.description.replace(/<[^>]*>?/gm, '')}
                              </Text>
                            )}

                            {/* Notes */}
                            {evt.notes && evt.notes.length > 0 && (
                              <View style={styles.notesContainer}>
                                <Text style={styles.notesHeading}>Important Notes:</Text>
                                {evt.notes.map((note: string, nIdx: number) => (
                                  <View key={nIdx} style={styles.noteBulletRow}>
                                    <View style={styles.noteDot} />
                                    <Text style={styles.noteText}>{note}</Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {/* Gallery Photos */}
                            {evt.photos && evt.photos.length > 0 && (
                              <View style={styles.photosSection}>
                                <Text style={styles.photosHeading}>Photos ({evt.photos.length})</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                                  {evt.photos.map((p: string, pIdx: number) => (
                                    <Image key={pIdx} source={{ uri: p }} style={styles.photoThumb} />
                                  ))}
                                </ScrollView>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyItineraryBox}>
                    <Text style={styles.emptyItineraryText}>
                      Detailed daily schedule will be available soon.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  heroBackground: {
    width: '100%',
    height: 270,
    position: 'relative',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 26,
  },
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circleActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2.5,
  },
  heroMetaText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroRight: {
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  cursiveLine: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    fontStyle: 'italic',
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sheetContainer: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itinerarySectionCard: {
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#172554',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  docsContent: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  docIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docTextContainer: {
    flex: 1,
  },
  docTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  docDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
    lineHeight: 15,
  },
  docMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 3,
  },
  docMoreBtn: {
    padding: 6,
  },
  addDocsDashedBox: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93c5fd',
    borderRadius: 14,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDocsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addDocsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2563eb',
  },
  addDocsSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  itineraryContent: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 11,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventThumb: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  eventThumbPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventHeaderInfo: {
    flex: 1,
  },
  eventDayBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  eventSubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  eventDateText: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  dotSeparator: {
    fontSize: 10,
    color: '#cbd5e1',
  },
  eventDurationText: {
    fontSize: 11.5,
    color: '#64748b',
  },
  expandChevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    gap: 4,
  },
  eventLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    flex: 1,
  },
  eventExpandedDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  eventDescText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#334155',
  },
  notesContainer: {
    marginTop: 8,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
  },
  notesHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  noteBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  noteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563eb',
  },
  noteText: {
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
  },
  photosSection: {
    marginTop: 10,
  },
  photosHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  photosScroll: {
    flexDirection: 'row',
  },
  photoThumb: {
    width: 80,
    height: 56,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: '#e2e8f0',
  },
  emptyItineraryBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyItineraryText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
