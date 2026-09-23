import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { MobileTrip } from '@/data/tripsData';

const STORAGE_FILE = 'travchad_mobile_trips.json';
const WEB_STORAGE_KEY = 'travchad_mobile_imported_trips';

// Smart backend URL discovery:
// On web: uses window.location.hostname:8123 or localhost:8123
// On mobile (Expo Go): uses Metro host IP or LAN fallback
export function getBackendUrl(): string {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `http://${window.location.hostname}:8123`;
    }
    return 'http://localhost:8123';
  }

  // Running on physical device or emulator
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8123`;
  }

  // Default LAN IP fallback
  return 'http://192.168.1.16:8123';
}

export interface VerifyTripResponse {
  success: boolean;
  message?: string;
  error?: string;
  trip?: MobileTrip;
}

export async function verifyAndFetchTrip(code: string): Promise<VerifyTripResponse> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'Please enter a trip code.' };
  }

  const backendUrl = getBackendUrl();
  console.log(`[Mobile API] Verifying code "${cleanCode}" at: ${backendUrl}/api/trips/verify`);

  try {
    const response = await fetch(`${backendUrl}/api/trips/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ code: cleanCode }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Trip code "${cleanCode}" not found on the travel agent server.`,
      };
    }

    return {
      success: true,
      message: data.message,
      trip: data.trip,
    };
  } catch (err: unknown) {
    console.warn('[Mobile API] Network error:', err);
    return {
      success: false,
      error: `Could not connect to travel agent backend at ${backendUrl}. Make sure your phone and computer are on the same Wi-Fi.`,
    };
  }
}

// In-memory fallback guaranteeing zero crashes or redboxes
let inMemoryTrips: MobileTrip[] = [];

export async function loadStoredMobileTrips(): Promise<MobileTrip[]> {
  // 1. Web LocalStorage
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(WEB_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            inMemoryTrips = parsed;
            return parsed;
          }
        }
      }
    } catch {}
    return inMemoryTrips;
  }

  // 2. Mobile FileSystem (native to Expo Go, never null)
  try {
    if (FileSystem && FileSystem.documentDirectory) {
      const fileUri = `${FileSystem.documentDirectory}${STORAGE_FILE}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo && fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(fileUri);
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            inMemoryTrips = parsed;
            return parsed;
          }
        }
      }
    }
  } catch {
    // Silent in-memory fallback
  }

  return inMemoryTrips;
}

export async function saveStoredMobileTrips(trips: MobileTrip[]): Promise<void> {
  inMemoryTrips = trips;

  // 1. Web LocalStorage
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(trips));
      }
    } catch {}
    return;
  }

  // 2. Mobile FileSystem (native to Expo Go)
  try {
    if (FileSystem && FileSystem.documentDirectory) {
      const fileUri = `${FileSystem.documentDirectory}${STORAGE_FILE}`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(trips));
    }
  } catch {
    // Silent in-memory fallback
  }
}
