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

export interface MobileTrip {
  id: string;
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
}

export const INITIAL_MOBILE_TRIPS: MobileTrip[] = [
  {
    id: '1',
    name: 'Japan',
    status: 'upcoming',
    startDate: '2025-04-10',
    endDate: '2025-04-19',
    dateRange: 'Apr 10, 2025  →  Apr 19, 2025',
    days: 10,
    locations: 'Tokyo, Kyoto, Osaka',
    description:
      'A journey through vibrant cities, serene temples, and breathtaking landscapes.',
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    isSaved: true,
  },
  {
    id: '2',
    name: 'Italy',
    status: 'upcoming',
    startDate: '2025-06-05',
    endDate: '2025-06-15',
    dateRange: 'Jun 5, 2025  →  Jun 15, 2025',
    days: 11,
    locations: 'Rome, Florence, Amalfi',
    description:
      'From historic ruins to picturesque coastlines, experience the best of Italy.',
    image:
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
    isSaved: false,
  },
  {
    id: '3',
    name: 'New Zealand',
    status: 'completed',
    startDate: '2025-01-12',
    endDate: '2025-01-22',
    dateRange: 'Jan 12, 2025  →  Jan 22, 2025',
    days: 11,
    locations: 'Auckland, Queenstown, Rotorua',
    description:
      'Stunning landscapes, thrilling adventures, and unforgettable memories.',
    image:
      'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
    isSaved: true,
  },
  {
    id: '4',
    name: 'Bali',
    status: 'completed',
    startDate: '2024-11-03',
    endDate: '2024-11-10',
    dateRange: 'Nov 3, 2024  →  Nov 10, 2024',
    days: 8,
    locations: 'Ubud, Seminyak, Nusa Dua',
    description:
      'Tropical beaches, rich culture, and relaxation in paradise.',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    isSaved: false,
  },
  {
    id: '5',
    name: 'Santorini',
    status: 'completed',
    startDate: '2024-09-14',
    endDate: '2024-09-21',
    dateRange: 'Sep 14, 2024  →  Sep 21, 2024',
    days: 8,
    locations: 'Fira, Oia, Kamari',
    description:
      'Whitewashed villages, crystal blue waters, and breathtaking sunsets.',
    image:
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    isSaved: true,
  },
];
