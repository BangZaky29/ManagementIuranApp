
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Switch, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './ManageNewsStyles';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { fetchNews, createNews, updateNews, deleteNews, NewsItem, uploadNewsImage } from '../../../services/newsService';
import { useAuth } from '../../../contexts/AuthContext';

export default function ManageNewsScreen() {
    const router = useRouter();
    const { session, profile } = useAuth();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

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
        if (params.action === 'edit' && params.id) {
            const newsId = Number(params.id);
            const itemToEdit = news.find(n => n.id === newsId);
            if (itemToEdit) {
                openEdit(itemToEdit);
                // Clear params? Hard to do without pushing again. 
                // Just opening the modal is enough.
            } else {
                // If news list not loaded yet, we might need to fetch it or fetch specific item
                // For now, assume list loads fast or we rely on loadNews
                // Actually, if list isn't loaded, news is empty.
                // We should add a dependency on news.
            }
        }
    }, [params, news]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
            Alert.alert('Error', 'Gagal memuat berita');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !content) {
            Alert.alert('Peringatan', 'Judul dan Konten wajib diisi');
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
                Alert.alert('Sukses', 'Berita berhasil diperbarui');
            } else {
                await createNews({
                    title,
                    content,
                    category,
                    is_published: isPublished,
                    author_id: session?.user?.id || null,
                    image_url: imageUrl
                });
                Alert.alert('Sukses', 'Berita berhasil dibuat');
            }
            setShowModal(false);
            resetForm();
            loadNews();
        } catch (error: any) {
            console.error('Error saving news:', error);
            Alert.alert('Gagal', error.message || 'Gagal menyimpan berita');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Konfirmasi Hapus',
            'Apakah anda yakin ingin menghapus berita ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteNews(id);
                            loadNews();
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus berita');
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
                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
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
            <CustomHeader title="Kelola Berita" showBack={false} />

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
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                style={styles.formContainer}
                            >
                                <View style={styles.formHeader}>
                                    <Text style={styles.formTitle}>{isEditing ? 'Edit Berita' : 'Buat Berita Baru'}</Text>
                                    <TouchableOpacity onPress={() => setShowModal(false)}>
                                        <Ionicons name="close" size={24} color={Colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <Text style={styles.inputLabel}>Gambar Berita (Opsional)</Text>
                                    <TouchableOpacity onPress={pickImage} style={{
                                        height: 150,
                                        backgroundColor: '#F5F7FA',
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: '#E0E0E0',
                                        borderStyle: 'dashed',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 16,
                                        overflow: 'hidden'
                                    }}>
                                        {image ? (
                                            <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                                        ) : (
                                            <View style={{ alignItems: 'center' }}>
                                                <Ionicons name="image-outline" size={40} color={Colors.textSecondary} />
                                                <Text style={{ marginTop: 8, color: Colors.textSecondary }}>Ketuk untuk pilih gambar</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    <Text style={styles.inputLabel}>Judul</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Judul Berita"
                                        value={title}
                                        onChangeText={setTitle}
                                    />

                                    <Text style={styles.inputLabel}>Kategori</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Kategori (misal: PENGUMUMAN)"
                                        value={category}
                                        onChangeText={setCategory}
                                    />

                                    <Text style={styles.inputLabel}>Konten</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Isi Berita..."
                                        value={content}
                                        onChangeText={setContent}
                                        multiline
                                        numberOfLines={4}
                                    />

                                    <View style={styles.checkboxContainer}>
                                        <Switch
                                            value={isPublished}
                                            onValueChange={setIsPublished}
                                            trackColor={{ false: '#767577', true: Colors.primary }}
                                            thumbColor={isPublished ? '#f4f3f4' : '#f4f3f4'}
                                        />
                                        <Text style={styles.checkboxLabel}>Publikasikan Langsung</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSave}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Simpan</Text>
                                        )}
                                    </TouchableOpacity>
                                    <View style={{ height: 20 }} />
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
