import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { fetchNewsDetail, deleteNews, NewsItem } from '../../../services/newsService';
import { NewsDetailStyles as styles } from '../../warga/news/NewsDetailStyles'; // Reuse styles
import { useTheme } from '../../../contexts/ThemeContext';

export default function AdminNewsDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();

    const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadNews();
    }, [id]);

    const loadNews = async () => {
        const newsId = typeof id === 'string' ? parseInt(id, 10) : 0;
        if (!newsId) {
            setIsLoading(false);
            return;
        }

        try {
            const data = await fetchNewsDetail(newsId);
            setNewsItem(data);
        } catch (error) {
            console.error('Failed to load news detail:', error);
            Alert.alert('Error', 'Gagal memuat detail berita');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        if (!newsItem) return;

        Alert.alert(
            'Konfirmasi Hapus',
            'Apakah anda yakin ingin menghapus berita ini secara permanen? Gambar yang terlampir juga akan dihapus.',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await deleteNews(newsItem.id);
                            Alert.alert('Sukses', 'Berita berhasil dihapus', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus berita');
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        if (!newsItem) return;
        router.push({
            pathname: '/admin/news-management' as any,
            params: { action: 'edit', id: newsItem.id }
        });
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!newsItem) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Berita tidak ditemukan</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Detail Berita</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={handleEdit} style={{ marginRight: 16 }}>
                        <Ionicons name="pencil" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={24} color={Colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {newsItem.image_url && (
                    <Image
                        source={{ uri: newsItem.image_url }}
                        style={{ width: '100%', height: 250, borderRadius: 12, marginBottom: 16, backgroundColor: '#f0f0f0' }}
                        resizeMode="contain"
                    />
                )}

                <View style={[styles.badge, { backgroundColor: colors.accent, alignSelf: 'flex-start' }]}>
                    <Text style={[styles.badgeText, { color: colors.green5 }]}>{newsItem.category}</Text>
                </View>

                <Text style={[styles.title, { color: colors.textPrimary, marginTop: 8 }]}>{newsItem.title}</Text>

                <View style={styles.metaContainer}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        {new Date(newsItem.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                    <View style={[styles.statusDot, { backgroundColor: newsItem.is_published ? Colors.success : Colors.textSecondary, marginLeft: 16, width: 8, height: 8, borderRadius: 4 }]} />
                    <Text style={{ marginLeft: 6, fontSize: 12, color: newsItem.is_published ? Colors.success : Colors.textSecondary }}>
                        {newsItem.is_published ? 'Published' : 'Draft'}
                    </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Text style={[styles.content, { color: colors.textSecondary }]}>{newsItem.content}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
