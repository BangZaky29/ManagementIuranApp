import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme as useAppTheme, useSecurityTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CustomHeader } from '../../components/common/CustomHeader';
import { supabase } from '../../lib/supabaseConfig';
import { createOrGetChatSession } from '../../services/chat/chatService';

export default function NewChatScreen() {
    const router = useRouter();
    const { user, profile } = useAuth();
    const isSecurity = profile?.role === 'security';
    const appTheme = useAppTheme();
    const securityTheme = useSecurityTheme();
    const { colors } = isSecurity ? securityTheme : appTheme;

    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.housing_complex_id && profile?.role) {
            loadContacts();
        }
    }, [profile]);

    const loadContacts = async () => {
        try {
            let allowedRoles: string[] = [];
            if (profile?.role === 'warga') allowedRoles = ['admin', 'security'];
            else if (profile?.role === 'security') allowedRoles = ['admin', 'warga'];
            else if (profile?.role === 'admin') allowedRoles = ['warga', 'security'];

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .eq('housing_complex_id', profile?.housing_complex_id)
                .in('role', allowedRoles)
                .neq('id', user?.id)
                .order('full_name', { ascending: true });

            if (error) throw error;
            setContacts(data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const startChat = async (contactId: string, contactName: string) => {
        if (!user?.id || !profile?.housing_complex_id) return;
        try {
            const session = await createOrGetChatSession(user.id, contactId, profile.housing_complex_id);
            router.replace(`/chat/${session.id}?otherName=${encodeURIComponent(contactName)}&otherId=${contactId}` as any);
        } catch (error) {
            console.error('Error starting chat session:', error);
            alert('Gagal memulai percakapan.');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.contactCard, { borderBottomColor: colors.border }]}
            onPress={() => startChat(item.id, item.full_name)}
        >
            <View style={styles.avatarContainer}>
                {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: colors.surfaceSubtle, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={24} color={colors.textSecondary} />
                    </View>
                )}
            </View>
            <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.textPrimary }]}>{item.full_name}</Text>
                <Text style={[styles.contactRole, { color: colors.textSecondary }]}>
                    {item.role === 'warga' ? 'Warga' : item.role === 'admin' ? 'Admin' : 'Security'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader
                title="Pilih Kontak"
                onBack={() => router.back()}
                showBack={true}
                colors={colors}
            />
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : contacts.length === 0 ? (
                <View style={styles.center}>
                    <Text style={{ color: colors.textSecondary }}>Tidak ada kontak tersedia.</Text>
                </View>
            ) : (
                <FlatList
                    data={contacts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingBottom: 24 },
    contactCard: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
    },
    avatarContainer: { marginRight: 16 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    contactInfo: { flex: 1 },
    contactName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    contactRole: { fontSize: 13, textTransform: 'capitalize' },
});
