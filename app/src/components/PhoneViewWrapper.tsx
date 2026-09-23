import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wifi, BatteryMedium, Signal } from 'lucide-react-native';

interface PhoneViewWrapperProps {
  children: React.ReactNode;
}

export function PhoneViewWrapper({ children }: PhoneViewWrapperProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && windowWidth > 520;

  if (!isWebDesktop) {
    return (
      <SafeAreaView style={styles.nativeContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {children}
      </SafeAreaView>
    );
  }

  // Desktop Phone Frame Simulation
  return (
    <View style={styles.desktopOuter}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.phoneChassis}>
        {/* iPhone Status Bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusTime}>9:41</Text>
          <View style={styles.dynamicIsland} />
          <View style={styles.statusIcons}>
            <Signal size={14} color="#0f172a" strokeWidth={2.5} />
            <Wifi size={14} color="#0f172a" strokeWidth={2.5} />
            <View style={styles.batteryWrapper}>
              <View style={styles.batteryBody}>
                <View style={styles.batteryFill} />
              </View>
              <View style={styles.batteryCap} />
            </View>
          </View>
        </View>

        {/* Phone Content Screen */}
        <View style={styles.phoneScreen}>{children}</View>

        {/* Home Indicator Bar */}
        <View style={styles.homeIndicatorContainer}>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  desktopOuter: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    minHeight: '100%',
  },
  phoneChassis: {
    width: 412,
    height: 870,
    backgroundColor: '#ffffff',
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#1e293b',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 36,
    elevation: 20,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  statusBar: {
    height: 44,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    zIndex: 50,
  },
  statusTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  dynamicIsland: {
    width: 108,
    height: 26,
    backgroundColor: '#0f172a',
    borderRadius: 13,
    position: 'absolute',
    left: '50%',
    marginLeft: -54,
    top: 8,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 22,
    height: 11,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: '#0f172a',
    padding: 1.5,
    justifyContent: 'center',
  },
  batteryFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 1.5,
  },
  batteryCap: {
    width: 1.5,
    height: 4,
    backgroundColor: '#0f172a',
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  homeIndicatorContainer: {
    height: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  homeIndicator: {
    width: 134,
    height: 4.5,
    backgroundColor: '#0f172a',
    borderRadius: 3,
  },
});
