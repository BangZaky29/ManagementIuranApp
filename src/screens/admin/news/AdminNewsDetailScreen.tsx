import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDateSafe } from '../../../utils/dateUtils';
import { Colors } from '../../../constants/Colors';
import { deleteNews } from '../../../services/newsService';
import { NewsDetailStyles as styles } from '../../warga/news/NewsDetailStyles'; // Reuse styles
import { useTheme } from '../../../contexts/ThemeContext';
import { useNewsDetailViewModel } from '../../warga/news/NewsDetailViewModel';
import { CustomAlertModal } from '../../../components/CustomAlertModal';

export default function AdminNewsDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();

    const { newsItem, isLoading, setIsLoading } = useNewsDetailViewModel(id as string);
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'info' | 'warning' | 'error';
        buttons: any[];
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        buttons: []
    });

    const handleDelete = () => {
        if (!newsItem) return;

        setAlertConfig({
            visible: true,
            title: 'Konfirmasi Hapus',
            message: 'Apakah anda yakin ingin menghapus berita ini secara permanen? Gambar yang terlampir juga akan dihapus.',
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        hideAlert();
                        setIsLoading(true);
                        try {
                            await deleteNews(newsItem.id);
                            setAlertConfig({
                                visible: true,
                                title: 'Sukses',
                                message: 'Berita berhasil dihapus',
                                type: 'success',
                                buttons: [
                                    { text: 'OK', onPress: () => { hideAlert(); router.back(); } }
                                ]
                            });
                        } catch (error) {
                            setAlertConfig({
                                visible: true,
                                title: 'Error',
                                message: 'Gagal menghapus berita',
                                type: 'error',
                                buttons: [{ text: 'OK', onPress: hideAlert }]
                            });
                            setIsLoading(false);
                        }
                    }
                }
            ]
        });
    };

    const hideAlert = () => setAlertConfig((prev: any) => ({ ...prev, visible: false }));

    const handleEdit = () => {
        if (!newsItem) return;
        router.push({
            pathname: '/admin/news-management' as any,
            params: { action: 'edit', id: newsItem.id }
        });
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <SafeAreaView edges={['top']} style={{ backgroundColor: colors.white }}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Detail Berita</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (!newsItem) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <SafeAreaView edges={['top']} style={{ backgroundColor: colors.white }}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Detail Berita</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Berita tidak ditemukan</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.white }}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Detail Berita</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={handleEdit} style={{ marginRight: 16 }}>
                            <Ionicons name="pencil" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={24} color={Colors.danger} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {newsItem.image_url && (
                        <Image
                            source={{ uri: newsItem.image_url }}
                            style={{ width: '100%', height: 250, borderRadius: 12, marginBottom: 16, backgroundColor: '#f0f0f0' }}
                            resizeMode="contain"
                        />
                    )}

                    <View style={[styles.badge, { backgroundColor: colors.accent, alignSelf: 'flex-start' }]}>
                        <Text style={[styles.badgeText, { color: colors.green5 }]}>{newsItem.category}</Text>
                    </View>

                    <Text style={[styles.title, { color: colors.textPrimary, marginTop: 8 }]}>{newsItem.title}</Text>

                    <View style={styles.metaContainer}>
                        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.date, { color: colors.textSecondary }]}>
                            {formatDateSafe(newsItem.created_at)}
                        </Text>
                        <View style={[styles.statusDot, { backgroundColor: newsItem.is_published ? Colors.success : Colors.textSecondary, marginLeft: 16, width: 8, height: 8, borderRadius: 4 }]} />
                        <Text style={{ marginLeft: 6, fontSize: 12, color: newsItem.is_published ? Colors.success : Colors.textSecondary }}>
                            {newsItem.is_published ? 'Published' : 'Draft'}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Text style={[styles.content, { color: colors.textSecondary }]}>{newsItem.content}</Text>
                </ScrollView>
            </SafeAreaView>

            <CustomAlertModal
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />
        </View>
    );
}
