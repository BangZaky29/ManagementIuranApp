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

  useEffect(() => {
    if (isLoading) return;

    // Gunakan metadata role (jalur cepat) atau database role
    const role = user?.user_metadata?.role || profile?.role || 'warga';

    const inAuthGroup =
      segments[0] === 'login' ||
      segments[0] === 'login-warga' ||
      segments[0] === 'register' ||
      segments[0] === 'register-admin' ||
      segments[0] === 'forgot-password';

    if (!isAuthenticated) {
      // Jika tidak login dan tidak di halaman login, buang ke /login
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else {
      // User sudah login
      if (inAuthGroup) {
        // Jika nekat buka halaman login saat sudah login, arahkan ke dashboard yang benar
        if (role === 'admin') router.replace('/admin');
        else if (role === 'security') router.replace('/security');
        else router.replace('/(tabs)');
      } else {
        // Proteksi Cross-Role
        const inAdminGroup = segments[0] === 'admin';
        const inSecurityGroup = segments[0] === 'security';
        const inWargaGroup = segments[0] === '(tabs)';

        if (role === 'admin' && !inAdminGroup) router.replace('/admin');
        else if (role === 'security' && !inSecurityGroup) router.replace('/security');
        else if (role === 'warga' && !inWargaGroup) router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, profile, user]);

  // 1. Tampilkan loading saat cek session
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF2E3' }}>
        <ActivityIndicator size="large" color="#78C51C" />
      </View>
    );
  }

  // 2. CEGAH KEDIPAN (FLASHING):
  // Jika tidak login dan sedang tidak di halaman login, 
  // kembalikan layar kosong/loading selama proses router.replace berjalan.
  const inAuthGroup =
    segments[0] === 'login' ||
    segments[0] === 'login-warga' ||
    segments[0] === 'register' ||
    segments[0] === 'register-admin' ||
    segments[0] === 'forgot-password';

  if (!isAuthenticated && !inAuthGroup) {
    return <View style={{ flex: 1, backgroundColor: '#EEF2E3' }} />;
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
          <Stack.Screen name="news" options={{ headerShown: false }} />
          <Stack.Screen name="laporan" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="admin/index" options={{ headerShown: false }} />
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
