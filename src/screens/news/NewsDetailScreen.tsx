import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { NEWS_ITEMS } from '../../data/NewsData';
import { NewsDetailStyles as styles } from './NewsDetailStyles';

export default function NewsDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const newsId = typeof id === 'string' ? parseInt(id, 10) : 0;
    const newsItem = NEWS_ITEMS.find(item => item.id === newsId);

    if (!newsItem) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Berita Tidak Ditemukan</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Informasi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{newsItem.category}</Text>
                </View>

                <Text style={styles.title}>{newsItem.title}</Text>

                <View style={styles.metaContainer}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.green4} />
                    <Text style={styles.date}>{newsItem.date}</Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                <Text style={styles.content}>{newsItem.content}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
