
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { ReportLocationViewer } from '../../../components/ReportLocationViewer';
import { fetchReportById, Report } from '../../../services/laporanService';
import { supabase } from '../../../lib/supabaseConfig';
import { styles } from './LaporanListStyles'; // Reusing styles or creating new ones

export default function AdminReportDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [data, setData] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadDetail();
    }, [id]);

    const loadDetail = async () => {
        if (typeof id === 'string') {
            setLoading(true);
            try {
                // We need to fetch user info as well
                const { data: report, error } = await supabase
                    .from('reports')
                    .select(`
                        *,
                        user:profiles(full_name, avatar_url)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setData(report as any); // Cast because of joined data
            } catch (error) {
                console.error("Error fetching detail:", error);
                Alert.alert("Error", "Gagal memuat detail laporan");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!data) return;
        setProcessingId(newStatus);
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: newStatus, updated_at: new Date() })
                .eq('id', data.id);

            if (error) throw error;

            setData({ ...data, status: newStatus as any });
            Alert.alert('Sukses', `Status laporan diubah menjadi ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Gagal memperbarui status');
        } finally {
            setProcessingId(null);
        }
    };

    const handleOpenLocation = () => {
        if (data?.location) {
            import('react-native').then(({ Linking }) => {
                Linking.openURL(data.location!).catch(err => {
                    console.error("Failed to open map", err);
                    Alert.alert('Gagal', 'Tidak dapat membuka peta.');
                });
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Menunggu': return Colors.warning;
            case 'Diproses': return Colors.primary;
            case 'Selesai': return Colors.success;
            case 'Ditolak': return Colors.danger;
            default: return Colors.textSecondary;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Laporan tidak ditemukan</Text>
                </View>
            </SafeAreaView>
        );
    }

    const formattedDate = new Date(data.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <StatusBar barStyle="dark-content" />
            <CustomHeader title="Detail Laporan" showBack={true} />

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

                {/* Image Section */}
                {data.image_url && (
                    <Image
                        source={{ uri: data.image_url }}
                        style={{ width: '100%', height: 250, borderRadius: 12, marginBottom: 16 }}
                        resizeMode="cover"
                    />
                )}

                {/* Main Content */}
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 16, elevation: 2 }}>

                    {/* User Info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        {(data as any).user?.avatar_url ? (
                            <Image
                                source={{ uri: (data as any).user.avatar_url }}
                                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee' }}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.green1, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                <Ionicons name="person" size={20} color={Colors.primary} />
                            </View>
                        )}
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: Colors.textPrimary }}>
                                {(data as any).user?.full_name || 'Warga'}
                            </Text>
                            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>{formattedDate}</Text>
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <View style={{
                            backgroundColor: getStatusColor(data.status) + '20',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6
                        }}>
                            <Text style={{ color: getStatusColor(data.status), fontWeight: 'bold', fontSize: 13 }}>
                                {data.status}
                            </Text>
                        </View>
                        <View style={{ marginLeft: 8, backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                            <Text style={{ color: Colors.textSecondary, fontWeight: '500', fontSize: 13 }}>{data.category}</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 8 }}>{data.title}</Text>
                    <Text style={{ fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 20 }}>{data.description}</Text>

                    <ReportLocationViewer
                        locationUrl={data.location}
                        onOpenLocation={handleOpenLocation}
                    />
                </View>

                {/* Admin Actions */}
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 }}>Ubah Status Laporan</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 40 }}>
                    {data.status !== 'Diproses' && data.status !== 'Selesai' && (
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: Colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' }}
                            onPress={() => handleUpdateStatus('Diproses')}
                            disabled={!!processingId}
                        >
                            {processingId === 'Diproses' ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Proses</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {data.status === 'Diproses' && (
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: Colors.success, padding: 14, borderRadius: 10, alignItems: 'center' }}
                            onPress={() => handleUpdateStatus('Selesai')}
                            disabled={!!processingId}
                        >
                            {processingId === 'Selesai' ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Selesai</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {data.status !== 'Selesai' && data.status !== 'Ditolak' && (
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: Colors.danger, padding: 14, borderRadius: 10, alignItems: 'center' }}
                            onPress={() => handleUpdateStatus('Ditolak')}
                            disabled={!!processingId}
                        >
                            {processingId === 'Ditolak' ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Tolak</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
