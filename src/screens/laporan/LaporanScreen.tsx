import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { CustomHeader } from '../../components/CustomHeader';
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

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Fasilitas': return 'bulb-outline';
            case 'Kebersihan': return 'trash-outline';
            case 'Keamanan': return 'shield-checkmark-outline';
            default: return 'document-text-outline';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
            <CustomHeader title="Lapor & Keluhan" showBack={false} />

            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Filter Tabs */}
                    <View style={styles.filterContainer}>
                        {['Semua', 'Diproses', 'Selesai'].map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
                                onPress={() => setSelectedFilter(filter as any)}
                            >
                                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Report List */}
                    {filteredReports.length > 0 ? (
                        filteredReports.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.reportItem}
                                onPress={() => handleReportClick(item.id)}
                            >
                                <View style={styles.reportIconCard}>
                                    <Ionicons
                                        name={getCategoryIcon(item.category)}
                                        size={24}
                                        color={Colors.green5}
                                    />
                                </View>
                                <View style={styles.reportContent}>
                                    <Text style={styles.reportTitle}>{item.title}</Text>
                                    <Text style={styles.reportMeta}>{item.date} • {item.category}</Text>
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
                            <Ionicons name="document-text-outline" size={48} color={Colors.green4} />
                            <Text style={styles.emptyText}>Belum ada laporan</Text>
                        </View>
                    )}

                </ScrollView>

                {/* FAB */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleCreateReport}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={30} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
