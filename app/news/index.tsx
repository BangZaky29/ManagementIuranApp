import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchNews, NewsItem } from '../../src/services/news';
import { useTheme } from '../../src/contexts/ThemeContext';
import { CustomHeader } from '../../src/components/CustomHeader';

export default function AllNewsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        setIsLoading(true);
        try {
            const news = await fetchNews(false); // Fetch all news (not just dashboard ones if the flag implies that)
            setNewsItems(news);
        } catch (error) {
            console.error('Failed to load news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const handleNewsClick = (id: number) => {
        router.push(`/news/${id}` as any);
    };

    const renderItem = ({ item }: { item: NewsItem }) => (
        <TouchableOpacity
            style={[styles.newsCard, { backgroundColor: colors.backgroundCard }]}
            onPress={() => handleNewsClick(item.id)}
            activeOpacity={0.7}
        >
            {item.image_url ? (
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.newsImage}
                />
            ) : (
                <View style={[styles.newsImagePlaceholder, { backgroundColor: colors.green2 }]}>
                    <Ionicons name="newspaper-outline" size={32} color={colors.green4} />
                </View>
            )}

            <View style={styles.newsContent}>
                <View style={[styles.newsBadge, { backgroundColor: colors.green1 }]}>
                    <Text style={[styles.newsBadgeText, { color: colors.green5 }]}>{item.category || 'PENGUMUMAN'}</Text>
                </View>
                <Text style={[styles.newsTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={[styles.newsDate, { color: colors.green4 }]}>
                    <Ionicons name="calendar-outline" size={12} color={colors.green4} /> {formatDate(item.created_at)}
                </Text>
                <Text style={[styles.newsDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.content}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.green1} />
            <CustomHeader title="Semua Informasi" showBack={true} />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.green5} />
                    <Text style={[styles.loadingText, { color: colors.green5 }]}>Memuat informasi...</Text>
                </View>
            ) : (
                <FlatList
                    data={newsItems}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="newspaper-outline" size={48} color={colors.green3} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada informasi terbaru.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    newsCard: {
        flexDirection: 'row',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    newsImage: {
        width: 100,
        height: '100%',
    },
    newsImagePlaceholder: {
        width: 100,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    newsContent: {
        flex: 1,
        padding: 12,
    },
    newsBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 8,
    },
    newsBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    newsTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 6,
        lineHeight: 20,
    },
    newsDate: {
        fontSize: 11,
        marginBottom: 8,
    },
    newsDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
    },
});
