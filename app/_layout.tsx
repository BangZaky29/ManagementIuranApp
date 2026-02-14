import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

// Penting: Kosongkan ini atau arahkan ke rute login agar tidak memaksa ke (tabs)
export const unstable_settings = {
  initialRouteName: 'login',
};

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, profile, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const role = user?.user_metadata?.role || profile?.role || 'warga';
  const inAuthGroup = segments[0] === 'login' ||
    segments[0] === 'login-warga' ||
    segments[0] === 'register' ||
    segments[0] === 'register-admin' ||
    segments[0] === 'forgot-password';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        // Gunakan replace untuk membersihkan history stack
        router.replace('/login');
      }
    } else {
      if (inAuthGroup) {
        if (role === 'admin') router.replace('/admin');
        else if (role === 'security') router.replace('/security');
        else router.replace('/(tabs)');
      } else {
        const inAdmin = segments[0] === 'admin';
        const inSecurity = segments[0] === 'security';
        const inWarga = segments[0] === '(tabs)';
        const inProfile = segments[0] === 'profile'; // Add this

        if (inProfile) return; // Allow profile access for all authenticated roles

        if (role === 'admin' && !inAdmin) router.replace('/admin');
        else if (role === 'security' && !inSecurity) router.replace('/security');
        else if (role === 'warga' && !inWarga) router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, role]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF2E3' }}>
        <ActivityIndicator size="large" color="#78C51C" />
      </View>
    );
  }

  // LOGIKA PENGUNCI (ANTI-FLICKER):
  // Jika sudah login, cek apakah layar yang sekarang dirender cocok dengan role.
  // Jika tidak cocok, TAMPILKAN LOADING, jangan render children (Stack).
  if (isAuthenticated) {
    const isAtAdmin = segments[0] === 'admin';
    const isAtSecurity = segments[0] === 'security';
    const isAtWarga = segments[0] === '(tabs)';
    const isAtProfile = segments[0] === 'profile'; // Add this

    const isCorrectRoute = (role === 'admin' && (isAtAdmin || isAtProfile)) ||
      (role === 'security' && (isAtSecurity || isAtProfile)) ||
      (role === 'warga' && (isAtWarga || isAtProfile));

    // Jika sedang di halaman login/auth atau rute salah, tampilkan loading screen
    if (!isCorrectRoute || inAuthGroup) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF2E3' }}>
          <ActivityIndicator size="large" color="#78C51C" />
          <Text style={{ marginTop: 10, color: '#78C51C', fontWeight: '500' }}>Menyiapkan Dashboard...</Text>
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
        <Stack screenOptions={{ headerShown: false }}>
          {/* Urutan Screen: Pindahkan Login ke paling atas untuk default rute */}
          <Stack.Screen name="login" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="(tabs)" />

          <Stack.Screen name="login-warga" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="register-admin" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="security/index" />
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

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </AuthProvider>
  );
}