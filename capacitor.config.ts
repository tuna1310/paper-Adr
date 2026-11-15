import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paperclone.game',
  appName: 'Paper Territory',
  webDir: 'dist',
  backgroundColor: '#1580EA',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#1580EA',
    zoomEnabled: false,
    initialFocus: true
  },
  plugins: {
    CapacitorCookies: {
      enabled: true
    },
    SystemBars: {
      hidden: true,
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'DARK'
    }
  }
};

export default config;

