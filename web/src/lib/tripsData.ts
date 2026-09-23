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
  mapCoords?: { lat: number; lng: number };
}

export interface TripDocument {
  id: string;
  type: "passport" | "flight" | "hotel" | "insurance" | "visa" | "other";
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  colorScheme: "blue" | "sky" | "green" | "red" | "purple";
  eventId?: string; // Optional assigned itinerary event ID
}

export interface TripData {
  id: string;
  name: string;
  tagline: string;
  status: "upcoming" | "completed";
  startDate: string;
  endDate: string;
  days: number;
  heroImage: string;
  image?: string;
  description: string;
  events: EventItem[];
  documents?: TripDocument[];
}

export const INITIAL_TRIPS: TripData[] = [
  {
    id: "1",
    name: "Japan",
    tagline: "EXPLORE · DISCOVER · EXPERIENCE",
    status: "upcoming",
    startDate: "2025-04-10",
    endDate: "2025-04-19",
    days: 10,
    heroImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000&q=85",
    description:
      "A journey through vibrant cities, serene temples, and breathtaking landscapes.",
    events: [
      {
        id: "e1",
        dayNumber: 1,
        title: "Day 1 – Arrival in Tokyo",
        date: "Apr 10, 2025",
        duration: "~ 5 hrs",
        location: "Narita International Airport, Tokyo",
        coverImage:
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
        description:
          "Touch down in Tokyo, navigate through customs, pick up pocket Wi-Fi and the JR Rail Pass, then take the Narita Express to the hotel in Shinjuku for check-in and an evening stroll.",
        photos: [
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80",
        ],
        notes: [
          "Exchange currency or withdraw Yen at 7-Bank ATM in airport.",
          "Check in at Shinjuku hotel before 9:00 PM.",
          "Light dinner near Omoide Yokocho.",
        ],
      },
      {
        id: "e2",
        dayNumber: 2,
        title: "Day 2 – Explore Asakusa",
        date: "Apr 11, 2025",
        duration: "~ 8 hrs",
        location: "Asakusa, Tokyo",
        coverImage:
          "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80",
        description:
          "Immerse in historic Tokyo at Sensō-ji, the city's oldest Buddhist temple. Wander through Nakamise-dori shopping street tasting traditional snacks, followed by a Sumida river cruise.",
        photos: [
          "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
        ],
        notes: [
          "Arrive early around 8:30 AM to beat the big crowds at Sensō-ji.",
          "Try freshly made Ningyo-yaki and matcha soft cream.",
        ],
      },
      {
        id: "e3",
        dayNumber: 3,
        title: "Day 3 – Mt. Fuji Day Trip",
        date: "Apr 12, 2025",
        duration: "~ 10 hrs",
        location: "Fuji Five Lakes, Yamanashi",
        coverImage:
          "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=600&q=80",
        description:
          "Take a scenic day trip to Mt. Fuji and the surrounding Fuji Five Lakes region. Enjoy stunning views, visit local shrines, and experience the natural beauty of Japan's most iconic mountain.",
        photos: [
          "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=600&q=80",
        ],
        notes: [
          "Wear comfortable shoes (lots of walking).",
          "Check the weather forecast (visibility of Mt. Fuji can vary).",
          "Bring a light jacket (it can be chilly).",
          "Consider trying local food (Hōtō noodles!).",
        ],
      },
      {
        id: "e4",
        dayNumber: 4,
        title: "Day 4 – Kyoto: Temples and Tradition",
        date: "Apr 13, 2025",
        duration: "~ 8 hrs",
        location: "Kyoto",
        coverImage:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
        description:
          "Morning bullet train (Shinkansen) from Tokyo to Kyoto. Walk through the thousands of vermilion Torii gates at Fushimi Inari Taisha, followed by Kiyomizu-dera and Gion district in the twilight.",
        photos: [
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
        ],
        notes: [
          "Fushimi Inari hike is about 2-3 hours for complete summit loop.",
          "Keep quiet and be respectful of geiko and maiko in Gion alleys.",
        ],
      },
      {
        id: "e5",
        dayNumber: 5,
        title: "Day 5 – Nara Day Trip",
        date: "Apr 14, 2025",
        duration: "~ 7 hrs",
        location: "Nara",
        coverImage:
          "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80",
        description:
          "A short local train excursion to Nara Park to interact with the famous free-roaming sacred deer, and marvel at the colossal bronze Buddha at Tōdai-ji Temple.",
        photos: [
          "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80",
        ],
        notes: [
          "Buy deer crackers (shika-senbei) from authorized street vendors.",
          "Bows before feeding, but watch out for sneaky nibbles on bags!",
        ],
      },
    ],
    documents: [
      {
        id: "doc-1",
        type: "passport",
        title: "Passport",
        description: "A valid passport with at least 6 months validity from your travel dates.",
        fileName: "passport.pdf",
        fileSize: "2.4 MB",
        colorScheme: "blue",
      },
      {
        id: "doc-2",
        type: "flight",
        title: "Flight Itinerary",
        description: "Your confirmed flight details (arrival and departure).",
        fileName: "flight-itinerary.pdf",
        fileSize: "1.1 MB",
        colorScheme: "sky",
        eventId: "e1",
      },
      {
        id: "doc-3",
        type: "hotel",
        title: "Hotel Bookings",
        description: "Confirmation vouchers for all accommodations in Japan.",
        fileName: "hotel-bookings.pdf",
        fileSize: "3.2 MB",
        colorScheme: "green",
      },
      {
        id: "doc-4",
        type: "insurance",
        title: "Travel Insurance",
        description: "Your travel insurance policy details.",
        fileName: "travel-insurance.pdf",
        fileSize: "1.8 MB",
        colorScheme: "red",
      },
      {
        id: "doc-5",
        type: "visa",
        title: "Visa (if required)",
        description: "Copy of your Japan visa approval (if required).",
        fileName: "visa.pdf",
        fileSize: "900 KB",
        colorScheme: "purple",
      },
    ],
  },
  {
    id: "2",
    name: "Italy",
    tagline: "EXPLORE · DISCOVER · EXPERIENCE",
    status: "upcoming",
    startDate: "2025-06-05",
    endDate: "2025-06-15",
    days: 11,
    heroImage:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=2000&q=85",
    description:
      "From historic ruins to picturesque coastlines, experience the best of Italy.",
    events: [
      {
        id: "e-it1",
        dayNumber: 1,
        title: "Day 1 – Rome: Arrival & Ancient Colosseum",
        date: "Jun 05, 2025",
        duration: "~ 6 hrs",
        location: "Colosseum, Rome",
        coverImage:
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
        description:
          "Land in Rome Fiumicino, check in near Monti district, and embark on a sunset walking tour of the Colosseum and Roman Forum.",
        photos: [
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
        ],
        notes: [
          "Pre-book skip-the-line Colosseum underground tickets.",
          "Grab authentic gelato at Gelateria del Teatro.",
        ],
      },
    ],
  },
  {
    id: "3",
    name: "New Zealand",
    tagline: "EXPLORE · DISCOVER · EXPERIENCE",
    status: "completed",
    startDate: "2025-01-12",
    endDate: "2025-01-22",
    days: 11,
    heroImage:
      "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=2000&q=85",
    description:
      "Stunning landscapes, thrilling adventures, and unforgettable memories.",
    events: [
      {
        id: "e-nz1",
        dayNumber: 1,
        title: "Day 1 – Queenstown Arrival",
        date: "Jan 12, 2025",
        duration: "~ 5 hrs",
        location: "Queenstown, South Island",
        coverImage:
          "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80",
        description:
          "Pick up 4WD rental car at Queenstown airport, take Skyline Gondola for panoramic lake Wakatipu sunset views.",
        photos: [
          "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80",
        ],
        notes: ["Famous Fergburger for dinner."],
      },
    ],
  },
  {
    id: "4",
    name: "Bali",
    tagline: "EXPLORE · DISCOVER · EXPERIENCE",
    status: "completed",
    startDate: "2024-11-03",
    endDate: "2024-11-10",
    days: 8,
    heroImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2000&q=85",
    description: "Tropical beaches, rich culture, and relaxation in paradise.",
    events: [
      {
        id: "e-b1",
        dayNumber: 1,
        title: "Day 1 – Ubud Arrival & Rice Terraces",
        date: "Nov 03, 2024",
        duration: "~ 6 hrs",
        location: "Tegallalang Rice Terrace, Ubud",
        coverImage:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
        description:
          "Check into private jungle villa in Ubud, hike through the lush stepped Tegallalang rice terraces, and visit Sacred Monkey Forest.",
        photos: [
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
        ],
        notes: ["Watch out for monkeys grabbing sunglasses and phones."],
      },
    ],
  },
  {
    id: "5",
    name: "Santorini",
    tagline: "EXPLORE · DISCOVER · EXPERIENCE",
    status: "completed",
    startDate: "2024-09-14",
    endDate: "2024-09-21",
    days: 8,
    heroImage:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2000&q=85",
    description:
      "Whitewashed villages, crystal blue waters, and breathtaking sunsets.",
    events: [
      {
        id: "e-s1",
        dayNumber: 1,
        title: "Day 1 – Oia Sunset & Caldera Walk",
        date: "Sep 14, 2024",
        duration: "~ 5 hrs",
        location: "Oia, Santorini",
        coverImage:
          "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
        description:
          "Stroll the cliffside paths of Oia past blue-domed churches and witness the world-renowned Aegean sunset.",
        photos: [
          "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
        ],
        notes: ["Secure a caldera view terrace table early."],
      },
    ],
  },
];

const STORAGE_KEY = "travchad_trips_data_v2";

export function getStoredTrips(): TripData[] {
  if (typeof window === "undefined") return INITIAL_TRIPS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRIPS));
      return INITIAL_TRIPS;
    }
    const parsed: TripData[] = JSON.parse(raw);
    return parsed.map((t) => {
      const matchInit = INITIAL_TRIPS.find((i) => i.id === t.id);
      return {
        ...t,
        documents: t.documents && t.documents.length > 0 ? t.documents : (matchInit?.documents || []),
      };
    });
  } catch {
    return INITIAL_TRIPS;
  }
}

export function saveStoredTrips(trips: TripData[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (err: unknown) {
    console.error("Failed to save trips", err);
    const isQuota =
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" ||
        err.code === 22 ||
        err.code === 1014 ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED");
    if (isQuota) {
      console.warn("LocalStorage quota exceeded. Please use image URLs or compress images.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("travchad_storage_quota_warning", {
            detail: { message: "Storage quota reached. Consider using image URLs for very large galleries." },
          })
        );
      }
    }
  }
}
