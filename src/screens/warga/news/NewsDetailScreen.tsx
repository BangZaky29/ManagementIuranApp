import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDateSafe } from '../../../utils/dateUtils';
import { createStyles } from './NewsDetailStyles';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNewsDetailViewModel } from './NewsDetailViewModel';

export default function NewsDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const { newsItem, isLoading } = useNewsDetailViewModel(id as string);

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!newsItem) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Berita Tidak Ditemukan</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Informasi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {newsItem.image_url && (
                    <Image
                        source={{ uri: newsItem.image_url }}
                        style={{ width: '100%', height: 250, borderRadius: 12, marginBottom: 16, backgroundColor: colors.surfaceSubtle }}
                        resizeMode="contain"
                    />
                )}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{newsItem.category}</Text>
                </View>

                <Text style={styles.title}>{newsItem.title}</Text>

                <View style={styles.metaContainer}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.date}>
                        {formatDateSafe(newsItem.created_at)}
                    </Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                <Text style={styles.content}>{newsItem.content}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
