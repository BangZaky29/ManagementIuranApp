import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../contexts/ThemeContext';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useLaporanViewModel } from './LaporanViewModel';
import { LaporanStyles as styles } from './LaporanStyles';

export default function LaporanScreen() {
    const {
        selectedFilter,
        setSelectedFilter,
        filteredReports,
        handleCreateReport,
        handleReportClick
    } = useLaporanViewModel();
    const { colors } = useTheme();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return colors.status.selesai.text;
            case 'Diproses': return colors.status.diproses.text;
            case 'Menunggu': return colors.status.menunggu.text;
            case 'Ditolak': return colors.status.ditolak.text;
            default: return colors.textSecondary;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'Selesai': return colors.status.selesai.bg;
            case 'Diproses': return colors.status.diproses.bg;
            case 'Menunggu': return colors.status.menunggu.bg;
            case 'Ditolak': return colors.status.ditolak.bg;
            default: return '#F5F5F5';
        }
    };

    const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
        switch (category) {
            case 'Fasilitas': return 'construct-outline';
            case 'Kebersihan': return 'leaf-outline';
            case 'Keamanan': return 'shield-checkmark-outline';
            case 'Infrastruktur': return 'build-outline';
            default: return 'help-circle-outline';
        }
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.green1} />
            <CustomHeader title="Lapor & Keluhan" showBack={false} />

            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Filter Tabs */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.filterScrollView}
                            contentContainerStyle={styles.filterContainer}
                        >
                            {['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'].map((filter) => (
                                <TouchableOpacity
                                    key={filter}
                                    style={[
                                        styles.filterTab,
                                        { backgroundColor: colors.backgroundCard, borderColor: colors.border },
                                        selectedFilter === filter && { backgroundColor: colors.green5, borderColor: colors.green5 }
                                    ]}
                                    onPress={() => setSelectedFilter(filter as any)}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        { color: colors.green5 },
                                        selectedFilter === filter && { color: colors.backgroundCard }
                                    ]}>
                                        {filter}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>

                    {/* Report List */}
                    {filteredReports.length > 0 ? (
                        filteredReports.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.reportItem, { backgroundColor: colors.backgroundCard }]}
                                onPress={() => handleReportClick(item.id)}
                            >
                                <View style={styles.reportIconCard}>
                                    <Ionicons
                                        name={getCategoryIcon(item.category)}
                                        size={24}
                                        color={colors.green5}
                                    />
                                </View>
                                <View style={styles.reportContent}>
                                    <Text style={[styles.reportTitle, { color: colors.green5 }]}>{item.title}</Text>
                                    <Text style={[styles.reportMeta, { color: colors.textSecondary }]}>{item.date} • {item.category}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={48} color={colors.green4} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada laporan</Text>
                        </View>
                    )}

                </ScrollView>

                {/* FAB */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleCreateReport}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={30} color={colors.backgroundCard} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
