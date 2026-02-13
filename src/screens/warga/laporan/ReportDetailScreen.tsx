import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Image } from 'react-native';
import { ReportDetailStyles as styles } from './ReportDetailStyles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

// Mock Data - In real app, fetch by ID
const MOCK_DETAIL = {
    id: '1',
    title: 'Lampu Jalan Mati',
    status: 'Selesai',
    date: '08 Feb 2026',
    category: 'Fasilitas',
    description: 'Lampu jalan di depan blok A5 sudah mati selama 3 hari. Mohon segera diperbaiki karena gelap dan rawan.',
    timeline: [
        { date: '08 Feb 2026 09:00', title: 'Laporan Diterima', description: 'Laporan anda telah diterima oleh admin.' },
        { date: '09 Feb 2026 10:30', title: 'Sedang Diproses', description: 'Tim teknisi sedang menuju lokasi.' },
        { date: '09 Feb 2026 14:00', title: 'Selesai', description: 'Lampu telah diganti dan berfungsi normal.' },
    ],
    image: 'https://placehold.co/400x300/E8F5E9/043F2E?text=Bukti+Foto'
};

export default function ReportDetailScreen() {
    const { id } = useLocalSearchParams();
    // In real app: const data = useFetchReport(id);
    const data = MOCK_DETAIL;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return Colors.success;
            case 'Diproses': return Colors.warning;
            default: return Colors.textSecondary;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'Selesai': return '#E8F5E9';
            case 'Diproses': return '#FFF3E0';
            default: return '#F5F5F5';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
            <CustomHeader title="Detail Laporan" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Card */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(data.status) }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>{data.status}</Text>
                        </View>
                        <Text style={styles.dateText}>{data.date}</Text>
                    </View>
                    <Text style={styles.title}>{data.title}</Text>
                    <Text style={styles.category}>{data.category}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.description}>{data.description}</Text>

                    {data.image && (
                        <Image source={{ uri: data.image }} style={styles.image} resizeMode="cover" />
                    )}
                </View>

                {/* Timeline */}
                <Text style={styles.sectionTitle}>Status Laporan</Text>
                <View style={styles.timelineContainer}>
                    {data.timeline.map((item, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.dot, { backgroundColor: index === data.timeline.length - 1 ? Colors.green5 : Colors.green3 }]} />
                                {index !== data.timeline.length - 1 && <View style={styles.line} />}
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>{item.title}</Text>
                                <Text style={styles.timelineDate}>{item.date}</Text>
                                <Text style={styles.timelineDesc}>{item.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

