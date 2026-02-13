import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Image } from 'react-native';
import { ReportDetailStyles as styles } from './ReportDetailStyles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

import { fetchReportById, deleteReport, Report } from '../../../services/laporanService';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { Alert, TouchableOpacity } from 'react-native';

export default function ReportDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [data, setData] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    React.useEffect(() => {
        const loadDetail = async () => {
            if (typeof id === 'string') {
                setLoading(true);
                const report = await fetchReportById(id);
                setData(report);
                setLoading(false);
            }
        };
        loadDetail();
    }, [id]);

    const handleOpenLocation = () => {
        if (data?.location) {
            import('react-native').then(({ Linking }) => {
                Linking.openURL(data.location!).catch(err => {
                    Alert.alert('Gagal Membuka Peta', 'Tidak dapat membuka aplikasi peta.');
                });
            });
        }
    };

    const handleDelete = () => {
        setAlertConfig({
            title: 'Hapus Laporan?',
            message: 'Apakah anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            buttons: [
                {
                    text: 'Batal',
                    style: 'cancel',
                    onPress: hideAlert
                },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        hideAlert();
                        await confirmDelete();
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    const confirmDelete = async () => {
        if (!data) return;
        setLoading(true);
        try {
            await deleteReport(data.id);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(tabs)/laporan');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            setLoading(false); // Only stop loading on error, otherwise we navigate away
            // Show error alert
            setTimeout(() => {
                setAlertConfig({
                    title: 'Gagal Menghapus',
                    message: error.message || 'Terjadi kesalahan saat menghapus laporan.',
                    type: 'error',
                    buttons: [{ text: 'OK', onPress: hideAlert }]
                });
                setAlertVisible(true);
            }, 500);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return Colors.success;
            case 'Diproses': return Colors.warning;
            case 'Ditolak': return Colors.danger;
            default: return Colors.textSecondary;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'Selesai': return '#E8F5E9';
            case 'Diproses': return '#FFF3E0';
            case 'Ditolak': return '#FFEBEE';
            default: return '#F5F5F5';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Memuat...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Laporan tidak ditemukan.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const formattedDate = new Date(data.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

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

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.dateText, { marginRight: 10 }]}>{formattedDate}</Text>
                            {/* Delete Button (Only if status is Menunggu or user owns it - usually we check ownership, but for now assuming user sees their own) */}
                            <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
                                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.title}>{data.title}</Text>
                    <Text style={styles.category}>{data.category}</Text>

                    {data.location && (
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 16,
                                backgroundColor: '#E0F7FA',
                                padding: 10,
                                borderRadius: 8
                            }}
                            onPress={handleOpenLocation}
                        >
                            <Ionicons name="map" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                            <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Lihat Lokasi di Peta</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.description}>{data.description}</Text>

                    {data.image_url && (
                        <Image source={{ uri: data.image_url }} style={styles.image} resizeMode="cover" />
                    )}
                </View>

                {/* Timeline Placeholder - Logic can be added later if we have a history table */}
                <Text style={styles.sectionTitle}>Status Laporan</Text>
                <View style={styles.timelineContainer}>
                    <View style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                            <View style={[styles.dot, { backgroundColor: Colors.green5 }]} />
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Laporan Dibuat</Text>
                            <Text style={styles.timelineDate}>{formattedDate}</Text>
                            <Text style={styles.timelineDesc}>Laporan anda telah masuk ke sistem.</Text>
                        </View>
                    </View>

                    {data.status !== 'Menunggu' && (
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={styles.line} />
                                <View style={[styles.dot, { backgroundColor: Colors.green5 }]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Status: {data.status}</Text>
                                <Text style={styles.timelineDesc}>Admin memperbarui status laporan.</Text>
                            </View>
                        </View>
                    )}
                </View>

            </ScrollView>

            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />
        </SafeAreaView>
    );
}
