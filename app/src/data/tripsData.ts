export interface EventItem {
  id: string;
  dayNumber: number;
  title: string;
  date: string;
  duration: string;
  location: string;
  description: string;
  photos: string[];
  notes: string[];
  coverImage: string;
}

export interface TripDocument {
  id: string;
  type: 'passport' | 'flight' | 'hotel' | 'insurance' | 'visa' | 'other';
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  colorScheme: 'blue' | 'sky' | 'green' | 'red' | 'purple';
  eventId?: string;
}

export interface MobileTrip {
  id: string;
  tripCode?: string;
  name: string;
  status: 'upcoming' | 'completed';
  startDate: string;
  endDate: string;
  dateRange: string;
  days: number;
  locations: string;
  description: string;
  image: string;
  isSaved?: boolean;
  events?: EventItem[];
  documents?: TripDocument[];
}

// Mobile app starts empty. Trips are imported by travellers via Trip Code generated in the web app.
export const INITIAL_MOBILE_TRIPS: MobileTrip[] = [];
