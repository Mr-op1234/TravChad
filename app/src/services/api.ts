import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileTrip } from '@/data/tripsData';

const STORAGE_KEY = 'travchad_mobile_imported_trips';

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
    console.error('[Mobile API] Network error:', err);
    return {
      success: false,
      error: `Could not connect to travel agent backend at ${backendUrl}. Make sure your phone and computer are on the same Wi-Fi.`,
    };
  }
}

export async function loadStoredMobileTrips(): Promise<MobileTrip[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to load stored mobile trips:', err);
  }
  return [];
}

export async function saveStoredMobileTrips(trips: MobileTrip[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to save mobile trips:', err);
  }
}
