
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Switch, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createStyles } from './ManageNewsStyles';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { formatDateSafe } from '../../../utils/dateUtils';
import { fetchNews, createNews, updateNews, deleteNews, NewsItem, uploadNewsImage } from '../../../services/news';
import { useAuth } from '../../../contexts/AuthContext';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ManageNewsScreen() {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const router = useRouter();
    const { session, profile } = useAuth();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Alert Modal State
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

    const showAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', buttons?: any[]) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            buttons: buttons || [{ text: 'OK', onPress: hideAlert }]
        });
    };

    const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('PENGUMUMAN');
    const [isPublished, setIsPublished] = useState(true);
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        loadNews();
    }, []);

    const params = useLocalSearchParams();

    useEffect(() => {
        if (!showModal && params.action === 'edit' && params.id) {
            const newsId = Number(params.id);
            const itemToEdit = news.find(n => n.id === newsId);
            if (itemToEdit) {
                openEdit(itemToEdit);
                // Clear action=edit from params to prevent re-opening or infinite loop
                router.setParams({ action: undefined, id: undefined });
            }
        }
    }, [params, news, showModal]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const loadNews = async () => {
        setIsLoading(true);
        try {
            const data = await fetchNews(true); // isAdmin = true
            setNews(data);
        } catch (error) {
            console.error('Error fetching news:', error);
            showAlert('Error', 'Gagal memuat berita', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !content) {
            showAlert('Peringatan', 'Judul dan Konten wajib diisi', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            let imageUrl = image;
            if (image && !image.startsWith('http')) {
                // It's a local URI, upload it
                const uploadedUrl = await uploadNewsImage(image);
                if (uploadedUrl) imageUrl = uploadedUrl;
            }

            if (isEditing && editId) {
                await updateNews(editId, {
                    title,
                    content,
                    category,
                    is_published: isPublished,
                    image_url: imageUrl
                });
                showAlert('Sukses', 'Berita berhasil diperbarui', 'success');
            } else {
                await createNews({
                    title,
                    content,
                    category,
                    is_published: isPublished,
                    author_id: session?.user?.id || null,
                    image_url: imageUrl,
                    housing_complex_id: profile?.housing_complex_id || null // Auto-link to admin's housing
                });
                showAlert('Sukses', 'Berita berhasil dibuat', 'success');
            }
            setShowModal(false);
            resetForm();
            loadNews();
        } catch (error: any) {
            console.error('Error saving news:', error);
            showAlert('Gagal', error.message || 'Gagal menyimpan berita', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        showAlert(
            'Konfirmasi Hapus',
            'Apakah anda yakin ingin menghapus berita ini?',
            'warning',
            [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        hideAlert();
                        try {
                            await deleteNews(id);
                            loadNews();
                        } catch (error) {
                            showAlert('Error', 'Gagal menghapus berita', 'error');
                        }
                    }
                }
            ]
        );
    };

    const openEdit = (item: NewsItem) => {
        setTitle(item.title);
        setContent(item.content);
        setCategory(item.category);
        setIsPublished(item.is_published);
        setImage(item.image_url || null);
        setEditId(item.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setCategory('PENGUMUMAN');
        setIsPublished(true);
        setImage(null);
        setIsEditing(false);
        setEditId(null);
    };

    const renderItem = ({ item }: { item: NewsItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/admin/news-management/[id]', params: { id: item.id } })}
            activeOpacity={0.7}
        >
            <View style={{ flexDirection: 'row', padding: 12 }}>
                {item.image_url ? (
                    <Image
                        source={{ uri: item.image_url }}
                        style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' }}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="newspaper-outline" size={32} color={Colors.textSecondary} />
                    </View>
                )}

                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={[styles.categoryText, { fontSize: 10, color: Colors.primary }]}>{item.category}</Text>
                            <Text style={[styles.dateText, { fontSize: 10 }]}>
                                {formatDateSafe(item.created_at)}
                            </Text>
                        </View>
                        <Text style={[styles.title, { fontSize: 14, lineHeight: 20 }]} numberOfLines={2}>{item.title}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.statusDot, { backgroundColor: item.is_published ? Colors.success : Colors.textSecondary, width: 6, height: 6 }]} />
                        <Text style={{ fontSize: 10, color: Colors.textSecondary, marginLeft: 4 }}>
                            {item.is_published ? 'Published' : 'Draft'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <CustomHeader
                title="Kelola Berita"
                showBack={true}
                onBack={() => router.replace('/admin')}
            />

            <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1 }}>
                {isLoading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={news}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="newspaper-outline" size={48} color={Colors.textSecondary} />
                                <Text style={styles.emptyText}>Belum ada berita.</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => { resetForm(); setShowModal(true); }}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => { setShowModal(false); resetForm(); }}
            >
                <TouchableWithoutFeedback onPress={() => { setShowModal(false); resetForm(); }}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                style={styles.formContainer}
                            >
                                <View style={styles.formHeader}>
                                    <Text style={styles.formTitle}>{isEditing ? 'Edit Berita' : 'Buat Berita Baru'}</Text>
                                    <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                                        <Ionicons name="close" size={24} color={Colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <Text style={styles.inputLabel}>Gambar Berita (Opsional)</Text>
                                    <View style={styles.imagePickerContainer}>
                                        {image ? (
                                            <>
                                                <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                <View style={styles.imageActionOverlay}>
                                                    <TouchableOpacity
                                                        style={[styles.imageActionButton, styles.replaceImageButton]}
                                                        onPress={pickImage}
                                                    >
                                                        <Ionicons name="camera" size={16} color={Colors.primary} />
                                                        <Text style={[styles.imageActionText, { color: Colors.primary }]}>Ganti</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[styles.imageActionButton, styles.removeImageButton]}
                                                        onPress={() => setImage(null)}
                                                    >
                                                        <Ionicons name="trash" size={16} color="#FFF" />
                                                        <Text style={[styles.imageActionText, { color: '#FFF' }]}>Hapus</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        ) : (
                                            <TouchableOpacity onPress={pickImage} style={styles.imagePickerContent}>
                                                <View style={{ backgroundColor: '#E3F2FD', padding: 15, borderRadius: 30, marginBottom: 10 }}>
                                                    <Ionicons name="image" size={32} color={Colors.primary} />
                                                </View>
                                                <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '500' }}>Ketuk untuk pilih gambar</Text>
                                                <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Rekomendasi 16:9 atau Square</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <Text style={styles.inputLabel}>Judul Berita</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tulis judul pengumuman..."
                                        value={title}
                                        onChangeText={setTitle}
                                    />

                                    <Text style={styles.inputLabel}>Kategori</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Misal: PENGUMUMAN, KEGIATAN, KEUANGAN"
                                        value={category}
                                        onChangeText={setCategory}
                                    />

                                    <Text style={styles.inputLabel}>Isi Berita</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Berikan detail informasi selengkapnya..."
                                        value={content}
                                        onChangeText={setContent}
                                        multiline
                                        numberOfLines={6}
                                    />

                                    <View style={styles.checkboxContainer}>
                                        <Switch
                                            value={isPublished}
                                            onValueChange={setIsPublished}
                                            trackColor={{ false: '#CBD5E1', true: Colors.primary }}
                                            thumbColor="#FFF"
                                        />
                                        <Text style={[styles.checkboxLabel, { fontSize: 14, color: '#475569' }]}>Publikasikan sekarang</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSave}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>{isEditing ? 'Simpan Perubahan' : 'Terbitkan Berita'}</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.saveButton, { backgroundColor: '#F1F5F9', marginTop: 12 }]}
                                        onPress={() => { setShowModal(false); resetForm(); }}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={[styles.saveButtonText, { color: '#64748B' }]}>Batal</Text>
                                    </TouchableOpacity>

                                    <View style={{ height: 30 }} />
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

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
