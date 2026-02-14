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
  // ✅ BENAR: Panggil semua data yang dibutuhkan dari useAuth di sini
  const { isAuthenticated, isLoading, profile, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup =
      segments[0] === 'login' ||
      segments[0] === 'login-warga' ||
      segments[0] === 'register' ||
      segments[0] === 'forgot-password' ||
      segments[0] === 'register-admin';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated) {
      // ✅ SEKARANG AMAN: Gunakan variabel 'user' yang sudah diambil di atas
      const role = profile?.role || user?.user_metadata?.role || 'warga';

      if (inAuthGroup) {
        if (role === 'admin') router.replace('/admin');
        else if (role === 'security') router.replace('/security');
        else router.replace('/(tabs)');
      } else {
        const inAdmin = segments[0] === 'admin';
        const inSecurity = segments[0] === 'security';
        const inWarga = segments[0] === '(tabs)';

        if (role === 'warga' && (inAdmin || inSecurity)) router.replace('/(tabs)');
        if (role === 'admin' && (inWarga || inSecurity)) router.replace('/admin');
        if (role === 'security' && (inWarga || inAdmin)) router.replace('/security');
      }
    }
    // Tambahkan 'user' dan 'router' ke dependency array agar linter senang
  }, [isAuthenticated, isLoading, segments, profile, user, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF2E3' }}>
        <ActivityIndicator size="large" color="#78C51C" />
      </View>
    );
  }

  // Prevent flash of protected content while redirecting
  const inAuthGroup =
    segments[0] === 'login' ||
    segments[0] === 'login-warga' ||
    segments[0] === 'register' ||
    segments[0] === 'forgot-password' ||
    segments[0] === 'register-admin';

  if (!isAuthenticated && !inAuthGroup) {
    // While we are redirecting in useEffect, don't show the protected content (children)
    // Show loading or null instead
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF2E3' }}>
        <ActivityIndicator size="large" color="#78C51C" />
      </View>
    );
  }

  if (isAuthenticated && !inAuthGroup) {
    // Prevent role-mismatch flash
    const role = profile?.role || user?.user_metadata?.role || 'warga';
    const inAdmin = segments[0] === 'admin';
    const inSecurity = segments[0] === 'security';
    // 'undefined' often means root/index which defaults to tabs
    const inWarga = segments[0] === '(tabs)' || segments[0] === undefined;

    const shouldRedirect =
      (role === 'admin' && (inWarga || inSecurity)) ||
      (role === 'warga' && (inAdmin || inSecurity)) ||
      (role === 'security' && (inWarga || inAdmin));

    if (shouldRedirect) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF2E3' }}>
          <ActivityIndicator size="large" color="#78C51C" />
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
