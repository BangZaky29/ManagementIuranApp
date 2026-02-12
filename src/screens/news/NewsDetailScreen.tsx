import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { NEWS_ITEMS } from '../../data/NewsData';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.green1,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 100,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.green2,
        borderRadius: 20,
        marginBottom: 16,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 12,
        lineHeight: 32,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    date: {
        fontSize: 14,
        color: Colors.green4,
        marginLeft: 6,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.green2,
        marginBottom: 24,
        opacity: 0.5,
    },
    content: {
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 26,
    },
});
