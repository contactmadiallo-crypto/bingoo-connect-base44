import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bingooconnect.app',
  appName: 'Bingoo Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0b2149',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
