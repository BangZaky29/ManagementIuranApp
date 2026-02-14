import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

// Auth gate — redirect based on auth state & role
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, profile, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // 1. Ambil Role secepat mungkin
  const role = user?.user_metadata?.role || profile?.role || 'warga';

  // 2. Tentukan grup halaman
  const inAuthGroup = segments[0] === 'login' ||
    segments[0] === 'login-warga' ||
    segments[0] === 'register' ||
    segments[0] === 'register-admin' ||
    segments[0] === 'forgot-password';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/login');
    } else {
      // Logika Redirect Role
      if (inAuthGroup) {
        if (role === 'admin') router.replace('/admin');
        else if (role === 'security') router.replace('/security');
        else router.replace('/(tabs)');
      } else {
        // Proteksi Cross-Role
        const inAdmin = segments[0] === 'admin';
        const inSecurity = segments[0] === 'security';
        const inWarga = segments[0] === '(tabs)';

        if (role === 'admin' && !inAdmin) router.replace('/admin');
        if (role === 'security' && !inSecurity) router.replace('/security');
        if (role === 'warga' && !inWarga) router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, role]);

  // KUNCI PERBAIKAN: 
  // Jangan render apapun jika masih loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF2E3' }}>
        <ActivityIndicator size="large" color="#78C51C" />
      </View>
    );
  }

  // CEGAH SPLIT/FLASH: 
  // Jika sudah login tapi segmen saat ini belum sesuai dengan role, 
  // tahan rendering (tampilkan loading saja) sampai router.replace selesai.
  if (isAuthenticated) {
    const isReady = (role === 'admin' && segments[0] === 'admin') ||
      (role === 'security' && segments[0] === 'security') ||
      (role === 'warga' && segments[0] === '(tabs)');

    if (!isReady && !inAuthGroup) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#EEF2E3' }}>
          <ActivityIndicator size="small" color="#78C51C" />
        </View>
      );
    }
  }

  return <>{children}</>;
}

function RootLayoutInner() {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AuthGate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="login-warga" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="register-admin" options={{ headerShown: false }} />

          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="iuran" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="laporan" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="security/index" options={{ headerShown: false }} />
        </Stack>
      </AuthGate>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </AuthProvider>
  );
}
