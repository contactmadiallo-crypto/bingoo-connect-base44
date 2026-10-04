import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bingooconnect.app',
  appName: 'Bingoo Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    // targetSdk 36 forces edge-to-edge on Android 15+, so the WebView is drawn UNDER the
    // status bar and StatusBar.setOverlaysWebView({ overlay: false }) is ignored.
    // 'auto' makes Capacitor inset the WebView by the system bars (status/nav bar, cutout)
    // so the mobile header is never hidden behind the notification bar.
    adjustMarginsForEdgeToEdge: 'auto',
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
    LocalNotifications: {
      smallIcon: 'ic_stat_bingoo',
      iconColor: '#ff7617',
    },
  },
};

export default config;
