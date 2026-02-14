import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://ezffgnsyakuforkycqrx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmZnbnN5YWt1Zm9ya3ljcXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzkyNjQsImV4cCI6MjA4NjExNTI2NH0.puncA8mrI-a1bXNw5K0ZfvRic_OLIGYEMUBRtAiVVeA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // PERBAIKAN: Hanya gunakan AsyncStorage jika kita sedang di lingkungan Client (Mobile/Browser)
        // Jika sedang di Node.js (Server Rendering), berikan null agar tidak crash
        storage: typeof window !== 'undefined' ? AsyncStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web', // Aktifkan hanya di Web
    },
});