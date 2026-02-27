import React, { useEffect } from 'react';
import {
    View, Text, SafeAreaView, FlatList, TouchableOpacity,
    Image, RefreshControl, StatusBar, ActivityIndicator, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSecurityReportsViewModel } from './SecurityReportsViewModel';
import { styles } from './SecurityReportsStyles';
import { formatDateSafe } from '../../utils/dateUtils';
import { CustomHeader } from '../../components/CustomHeader';

const STATUS_FILTERS = ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'];

export default function SecurityReportsScreen() {
    const vm = useSecurityReportsViewModel();

    useEffect(() => {
        vm.loadReports();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Selesai': return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'Diproses': return { bg: '#E3F2FD', text: '#1976D2' };
            case 'Ditolak': return { bg: '#FFEBEE', text: '#C62828' };
            default: return { bg: '#FFF3E0', text: '#E65100' };
        }
    };

    const openLocation = (url: string | null) => {
        if (url && url.startsWith('http')) {
            Linking.openURL(url);
        }
    };

    const renderReportItem = ({ item }: { item: any }) => {
        const { bg, text } = getStatusStyle(item.status);
        const hasLocation = item.location && item.location.startsWith('http');

        return (
            <View style={styles.reportCard}>
                <View style={styles.cardHeader}>
                    {item.profiles?.avatar_url ? (
                        <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={20} color="#0D47A1" />
                        </View>
                    )}
                    <View style={styles.headerInfo}>
                        <Text style={styles.userName}>{item.profiles?.full_name || 'Warga'}</Text>
                        <Text style={styles.dateText}>{formatDateSafe(item.created_at)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                        <Text style={[styles.statusText, { color: text }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.reportTitle}>{item.title}</Text>
                    <Text style={styles.reportDesc}>{item.description}</Text>
                    
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>

                    {item.image_url && (
                        <Image source={{ uri: item.image_url }} style={styles.imagePreview} resizeMode="cover" />
                    )}

                    {item.location && (
                        <TouchableOpacity 
                            style={styles.locationRow} 
                            onPress={() => openLocation(item.location)}
                            disabled={!hasLocation}
                        >
                            <Ionicons name="location" size={14} color="#0D47A1" />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {hasLocation ? 'Lihat Lokasi di Maps' : item.location}
                            </Text>
                            {hasLocation && <Ionicons name="open-outline" size={12} color="#0D47A1" />}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Security Actions */}
                {item.status !== 'Selesai' && item.status !== 'Ditolak' && (
                    <View style={styles.actionRow}>
                        {item.status === 'Menunggu' ? (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.btnBlue]}
                                onPress={() => vm.handleUpdateStatus(item.id, 'Diproses')}
                            >
                                <Ionicons name="play-circle-outline" size={18} color="#FFF" />
                                <Text style={styles.btnText}>Proses</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.btnGreen]}
                                onPress={() => vm.handleUpdateStatus(item.id, 'Selesai')}
                            >
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                                <Text style={styles.btnText}>Selesaikan</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: '#F5F5F5' }]}
                            onPress={() => vm.handleUpdateStatus(item.id, 'Ditolak')}
                        >
                            <Ionicons name="close-circle-outline" size={18} color="#666" />
                            <Text style={[styles.btnText, { color: '#666' }]}>Tolak</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <CustomHeader title="Laporan Warga" showBack={true} />

            {/* Filter Chips */}
            <View>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={STATUS_FILTERS}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                vm.filterStatus === item && styles.filterChipActive
                            ]}
                            onPress={() => vm.setFilterStatus(item)}
                        >
                            <Text style={[
                                styles.filterText,
                                vm.filterStatus === item && styles.filterTextActive
                            ]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {vm.isLoading && !vm.refreshing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0D47A1" />
                </View>
            ) : (
                <FlatList
                    data={vm.reports}
                    renderItem={renderReportItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl 
                            refreshing={vm.refreshing} 
                            onRefresh={() => vm.loadReports(true)} 
                            colors={['#0D47A1']} 
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>Tidak ada laporan</Text>
                            <Text style={styles.emptySubtext}>Semua laporan warga sudah tertangani.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
