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
  Share,
  Modal,
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
  Download,
  CheckCircle2,
  X,
  Eye,
  FileCheck,
} from 'lucide-react-native';
import { MobileTrip, TripDocument, EventItem } from '@/data/tripsData';

interface TripDetailViewProps {
  trip: MobileTrip;
  onBack: () => void;
  onDeleteTrip?: (id: string) => void;
}

export function TripDetailView({ trip, onBack, onDeleteTrip }: TripDetailViewProps) {
  // Information and documents is expanded by default (matching mockup)
  const [isDocsExpanded, setIsDocsExpanded] = useState(true);
  // Itinerary is collapsed by default (matching mockup)
  const [isItineraryExpanded, setIsItineraryExpanded] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Document modal viewer state
  const [selectedDoc, setSelectedDoc] = useState<TripDocument | null>(null);

  // Dynamic documents matching the exact mockup text
  const defaultDocs: TripDocument[] = [
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
      description: `Confirmation vouchers for all accommodations in ${trip.name || 'Japan'}.`,
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
      description: `Copy of your ${trip.name || 'Japan'} visa approval (if required).`,
      fileName: 'visa.pdf',
      fileSize: '900 KB',
      colorScheme: 'purple',
    },
  ];

  const documents =
    trip.documents && trip.documents.length > 0 ? trip.documents : defaultDocs;

  const handleOpenDoc = (doc: TripDocument) => {
    setSelectedDoc(doc);
  };

  const handleShareTrip = async () => {
    const text = `Trip: ${trip.name}\nCode: ${trip.tripCode || 'N/A'}\nDates: ${trip.dateRange}\nDuration: ${trip.days} Days`;
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: trip.name, text });
        } else {
          navigator.clipboard.writeText(text);
          window.alert(`Trip details copied to clipboard!\n\n${text}`);
        }
      } else {
        await Share.share({ message: text });
      }
    } catch {}
  };

  const handleShareDoc = async (doc: TripDocument) => {
    const text = `Document: ${doc.title} (${doc.fileName} - ${doc.fileSize})\nTrip: ${trip.name}\nStatus: Verified`;
    try {
      if (Platform.OS === 'web') {
        navigator.clipboard.writeText(text);
        window.alert(`Document information copied to clipboard!\n\n${text}`);
      } else {
        await Share.share({ message: text });
      }
    } catch {}
  };

  const handleDownloadDoc = (doc: TripDocument) => {
    const msg = `Downloading ${doc.fileName} (${doc.fileSize}) to device storage...`;
    if (Platform.OS === 'web') {
      window.alert(`Downloaded ${doc.fileName}!`);
    } else {
      Alert.alert('Download Complete', msg);
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
        `Trip Code: ${trip.tripCode || 'N/A'}\nStatus: ${trip.status}`,
        [
          {
            text: 'Share Trip',
            onPress: handleShareTrip,
          },
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

  const handleDocOptions = (doc: TripDocument) => {
    if (Platform.OS === 'web') {
      setSelectedDoc(doc);
    } else {
      Alert.alert(
        doc.title,
        `${doc.fileName} • ${doc.fileSize}`,
        [
          { text: 'View Document', onPress: () => setSelectedDoc(doc) },
          { text: 'Download PDF', onPress: () => handleDownloadDoc(doc) },
          { text: 'Share', onPress: () => handleShareDoc(doc) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // Render colored document category icon matching mockup
  const renderDocIcon = (doc: TripDocument) => {
    switch (doc.type) {
      case 'passport':
        return (
          <View style={[styles.docIconBox, { backgroundColor: '#e0f2fe' }]}>
            <View style={styles.passportEmblem}>
              <Globe size={20} color="#0284c7" strokeWidth={2.4} />
            </View>
          </View>
        );
      case 'flight':
        return (
          <View style={[styles.docIconBox, { backgroundColor: '#e0f2fe' }]}>
            <Plane
              size={22}
              color="#0284c7"
              strokeWidth={2.4}
              style={{ transform: [{ rotate: '-45deg' }] }}
            />
          </View>
        );
      case 'hotel':
        return (
          <View style={[styles.docIconBox, { backgroundColor: '#dcfce7' }]}>
            <Hotel size={22} color="#16a34a" strokeWidth={2.4} />
          </View>
        );
      case 'insurance':
        return (
          <View style={[styles.docIconBox, { backgroundColor: '#fee2e2' }]}>
            <Shield size={22} color="#dc2626" strokeWidth={2.4} />
          </View>
        );
      case 'visa':
      default:
        return (
          <View style={[styles.docIconBox, { backgroundColor: '#f3e8ff' }]}>
            <FileText size={22} color="#9333ea" strokeWidth={2.4} />
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
              'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
          }}
          style={styles.heroBackground}
          resizeMode="cover">
          {/* Top Floating Navigation: Back button on left, Share & More on right */}
          <View style={styles.heroNav}>
            <TouchableOpacity onPress={onBack} style={styles.circleActionBtn}>
              <ChevronLeft size={22} color="#ffffff" strokeWidth={2.6} />
            </TouchableOpacity>

            <View style={styles.heroNavRight}>
              <TouchableOpacity onPress={handleShareTrip} style={styles.circleActionBtn}>
                <Share2 size={18} color="#ffffff" strokeWidth={2.4} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleMoreOptions} style={styles.circleActionBtn}>
                <MoreVertical size={20} color="#ffffff" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Bottom Row: Destination Title & Dates on Left, Cursive Tagline on Right */}
          <View style={styles.heroBottomRow}>
            {/* Left: Destination Title & Meta */}
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>{trip.name}</Text>

              <View style={styles.heroMetaItem}>
                <Calendar size={13} color="#ffffff" strokeWidth={2.2} />
                <Text style={styles.heroMetaText}>{trip.days} Days</Text>
              </View>

              <View style={styles.heroMetaItem}>
                <Calendar size={13} color="#ffffff" strokeWidth={2.2} />
                <Text style={styles.heroMetaText}>{trip.dateRange}</Text>
              </View>
            </View>

            {/* Right: Cursive "Memories Last Forever" Tagline with Underline */}
            <View style={styles.memoriesWrapper}>
              <Text style={styles.memoriesText}>Memories</Text>
              <Text style={styles.memoriesText}>Last Forever</Text>
              <View style={styles.memoriesUnderline} />
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
                <View style={styles.docSectionIconBadge}>
                  <FileText size={18} color="#ffffff" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Information and documents</Text>
                  <Text style={styles.sectionSubtitle}>
                    All important information for your trip in one place.
                  </Text>
                </View>
              </View>
              {isDocsExpanded ? (
                <ChevronUp size={22} color="#0f172a" strokeWidth={2.6} />
              ) : (
                <ChevronDown size={22} color="#0f172a" strokeWidth={2.6} />
              )}
            </TouchableOpacity>

            {/* 5 Distinct Rounded Document Cards */}
            {isDocsExpanded && (
              <View style={styles.docsContent}>
                {documents.map((doc, idx) => (
                  <TouchableOpacity
                    key={doc.id || idx}
                    activeOpacity={0.75}
                    onPress={() => handleOpenDoc(doc)}
                    style={styles.docCard}>
                    {renderDocIcon(doc)}
                    <View style={styles.docTextContainer}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      <Text style={styles.docDesc}>{doc.description}</Text>
                      <Text style={styles.docMeta}>
                        {doc.fileName}  •  {doc.fileSize}
                      </Text>
                    </View>
                    <TouchableOpacity
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      onPress={() => handleDocOptions(doc)}
                      style={styles.docMoreBtn}>
                      <MoreVertical size={18} color="#64748b" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Section 2: Itinerary (Collapsed by default in mockup) */}
          <View style={[styles.sectionCard, styles.itinerarySectionCard]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsItineraryExpanded(!isItineraryExpanded)}
              style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.itineraryIconBadge}>
                  <Map size={19} color="#2563eb" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Itinerary</Text>
                  <Text style={styles.sectionSubtitle}>
                    Your day-by-day plan. Expand each event for more details.
                  </Text>
                </View>
              </View>
              {isItineraryExpanded ? (
                <ChevronUp size={22} color="#0f172a" strokeWidth={2.6} />
              ) : (
                <ChevronDown size={22} color="#0f172a" strokeWidth={2.6} />
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

      {/* Interactive Document Preview Modal */}
      {selectedDoc && (
        <Modal
          visible={!!selectedDoc}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedDoc(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  {renderDocIcon(selectedDoc)}
                  <View>
                    <Text style={styles.modalDocTitle}>{selectedDoc.title}</Text>
                    <Text style={styles.modalDocSubtitle}>
                      {selectedDoc.fileName} • {selectedDoc.fileSize}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedDoc(null)}
                  style={styles.modalCloseBtn}>
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Document Certificate / Preview Box */}
              <View style={styles.docPreviewSheet}>
                <View style={styles.docPreviewBadgeRow}>
                  <View style={styles.verifiedPill}>
                    <CheckCircle2 size={13} color="#16a34a" />
                    <Text style={styles.verifiedPillText}>Verified by Travel Agent</Text>
                  </View>
                  <Text style={styles.docCodeText}>TC-{trip.tripCode || 'OFFICIAL'}</Text>
                </View>

                <Text style={styles.previewHeading}>{selectedDoc.title}</Text>
                <Text style={styles.previewDescription}>{selectedDoc.description}</Text>

                <View style={styles.previewMetaGrid}>
                  <View style={styles.previewMetaCol}>
                    <Text style={styles.previewLabel}>Associated Trip</Text>
                    <Text style={styles.previewValue}>{trip.name}</Text>
                  </View>
                  <View style={styles.previewMetaCol}>
                    <Text style={styles.previewLabel}>Validity / Dates</Text>
                    <Text style={styles.previewValue}>{trip.dateRange}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  onPress={() => handleDownloadDoc(selectedDoc)}
                  style={styles.downloadDocBtn}>
                  <Download size={16} color="#2563eb" strokeWidth={2.4} />
                  <Text style={styles.downloadDocBtnText}>Download PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleShareDoc(selectedDoc)}
                  style={styles.shareDocBtn}>
                  <Share2 size={16} color="#ffffff" strokeWidth={2.4} />
                  <Text style={styles.shareDocBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  heroBackground: {
    width: '100%',
    height: 290,
    position: 'relative',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  heroNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily:
      Platform.OS === 'ios'
        ? 'Georgia'
        : Platform.OS === 'android'
        ? 'serif'
        : 'Georgia, serif',
    letterSpacing: -0.5,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  heroMetaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  memoriesWrapper: {
    alignItems: 'flex-end',
    paddingBottom: 6,
    transform: [{ rotate: '-6deg' }],
  },
  memoriesText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  memoriesUnderline: {
    width: 90,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    marginTop: 3,
    transform: [{ rotate: '-3deg' }],
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 36,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 4,
    marginBottom: 8,
  },
  itinerarySectionCard: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  docSectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  itineraryIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1.5,
  },
  docsContent: {
    marginTop: 6,
    gap: 10,
  },
  docCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  docIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  passportEmblem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTextContainer: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  docDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2.5,
    lineHeight: 16.5,
  },
  docMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 3.5,
    fontWeight: '500',
  },
  docMoreBtn: {
    padding: 8,
  },
  itineraryContent: {
    marginTop: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalDocTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalDocSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docPreviewSheet: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  docPreviewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  verifiedPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  docCodeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  previewHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  previewMetaGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    gap: 12,
  },
  previewMetaCol: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  previewValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  downloadDocBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    paddingVertical: 12,
    borderRadius: 12,
  },
  downloadDocBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2563eb',
  },
  shareDocBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shareDocBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
