import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDateSafe } from '../../../utils/dateUtils';
import { Colors } from '../../../constants/Colors';
import { NewsDetailStyles as styles } from './NewsDetailStyles';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNewsDetailViewModel } from './NewsDetailViewModel';

export default function NewsDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();

    const { newsItem, isLoading } = useNewsDetailViewModel(id as string);

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!newsItem) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.green5} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Berita Tidak Ditemukan</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.green1} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.green5} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Detail Informasi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {newsItem.image_url && (
                    <Image
                        source={{ uri: newsItem.image_url }}
                        style={{ width: '100%', height: 250, borderRadius: 12, marginBottom: 16, backgroundColor: '#f0f0f0' }}
                        resizeMode="contain"
                    />
                )}
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.badgeText, { color: colors.green5 }]}>{newsItem.category}</Text>
                </View>

                <Text style={[styles.title, { color: colors.green5 }]}>{newsItem.title}</Text>

                <View style={styles.metaContainer}>
                    <Ionicons name="calendar-outline" size={14} color={colors.green4} />
                    <Text style={[styles.date, { color: colors.green4 }]}>
                        {formatDateSafe(newsItem.created_at)}
                    </Text>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Text style={[styles.content, { color: colors.textSecondary }]}>{newsItem.content}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
