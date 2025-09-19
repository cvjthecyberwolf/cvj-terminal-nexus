import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1e8f4ab4324a4f53b26e1b3e6d8dc80d',
  appName: 'cvj-terminal-nexus',
  webDir: 'dist',
  server: {
    // Remove URL for production builds - uncomment the line below for development
    // url: 'https://1e8f4ab4-324a-4f53-b26e-1b3e6d8dc80d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    NativeShell: {
      requestPermissions: true,
      enableRootAccess: true
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;