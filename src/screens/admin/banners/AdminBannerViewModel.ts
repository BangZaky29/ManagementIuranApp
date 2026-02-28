import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { fetchAllBanners, toggleBannerStatus, createBanner, updateBanner, deleteBanner, uploadBannerImage, Banner } from '../../../services/bannerService';

export const useAdminBannerViewModel = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form and Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newTargetUrl, setNewTargetUrl] = useState('');
    const [selectedImage, setSelectedImage] = useState<{ uri: string, base64: string, name: string } | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    // Scheduling states
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    const loadBanners = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllBanners();
            setBanners(data);
        } catch (error: any) {
            setAlertConfig({
                title: 'Error',
                message: error.message || 'Gagal memuat data iklan.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const handleToggleStatus = async (banner: Banner) => {
        try {
            await toggleBannerStatus(banner.id, banner.is_active);
            setBanners(prev => prev.map(b =>
                b.id === banner.id ? { ...b, is_active: !b.is_active } : b
            ));
        } catch (error: any) {
            setAlertConfig({
                title: 'Gagal',
                message: error.message,
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        }
    };

    const pickImage = async (useCamera: boolean = false) => {
        const { status } = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            setAlertConfig({
                title: 'Izin Ditolak',
                message: `Aplikasi membutuhkan izin ${useCamera ? 'kamera' : 'galeri'} untuk mengunggah gambar.`,
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
            base64: true,
        };

        const result = useCamera
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);

        if (!result.canceled && result.assets && result.assets[0]) {
            const asset = result.assets[0];
            setSelectedImage({
                uri: asset.uri,
                base64: asset.base64 || '',
                name: asset.fileName || `banner_${Date.now()}.jpg`
            });
            setExistingImageUrl(null); // Reset existing image if new one picked
        }
    };

    const handleEditPress = (banner: Banner) => {
        setIsEditing(true);
        setEditingBannerId(banner.id);
        setNewTitle(banner.title);
        setNewDescription(banner.description || '');
        setNewTargetUrl(banner.target_url || '');
        setExistingImageUrl(banner.image_url);
        setStartDate(banner.start_date ? new Date(banner.start_date) : new Date());
        setEndDate(banner.end_date ? new Date(banner.end_date) : null);
        setSelectedImage(null);
        setModalVisible(true);
    };

    const handleAddNewPress = () => {
        setIsEditing(false);
        setEditingBannerId(null);
        setNewTitle('');
        setNewDescription('');
        setNewTargetUrl('');
        setSelectedImage(null);
        setExistingImageUrl(null);
        setStartDate(new Date());
        setEndDate(null);
        setModalVisible(true);
    };

    const handleSubmitBanner = async () => {
        if (!newTitle || (!selectedImage && !existingImageUrl)) {
            setAlertConfig({
                title: 'Input Tidak Lengkap',
                message: 'Judul dan Gambar iklan wajib diisi.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        if (!isEditing && banners.filter(b => b.is_active).length >= 5) {
            setAlertConfig({
                title: 'Batas Maksimal',
                message: 'Maksimal 5 iklan aktif yang dapat ditampilkan. Silakan nonaktifkan iklan lain terlebih dahulu.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        setIsSubmitting(true);
        try {
            let finalImageUrl = existingImageUrl || '';

            // 1. Upload image if a new one was selected
            if (selectedImage) {
                finalImageUrl = await uploadBannerImage(
                    selectedImage.uri,
                    selectedImage.base64,
                    selectedImage.name
                );
            }

            // 2. Save record to DB (Update or Create)
            const startDateStr = startDate.toISOString();
            const endDateStr = endDate?.toISOString();

            if (isEditing && editingBannerId) {
                await updateBanner(
                    editingBannerId,
                    newTitle,
                    finalImageUrl,
                    newTargetUrl,
                    newDescription,
                    startDateStr,
                    endDateStr
                );

                // 3. If image was updated, try to delete the old one
                if (selectedImage && existingImageUrl && existingImageUrl !== finalImageUrl) {
                    try {
                        const pathParts = existingImageUrl.split('wargaPintar/')[1];
                        if (pathParts) {
                            const filePath = pathParts.split('?')[0];
                            await supabase.storage.from('wargaPintar').remove([filePath]);
                        }
                    } catch (err) {
                        console.warn('Failed to cleanup old image:', err);
                    }
                }
            } else {
                await createBanner(
                    newTitle,
                    finalImageUrl,
                    newTargetUrl,
                    newDescription,
                    startDateStr,
                    endDateStr
                );
            }

            setModalVisible(false);
            loadBanners();
        } catch (error: any) {
            setAlertConfig({
                title: 'Gagal',
                message: error.message,
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (banner: Banner) => {
        setAlertConfig({
            title: 'Hapus Iklan?',
            message: 'Iklan ini akan dihapus permanen dari sistem.',
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        hideAlert();
                        try {
                            await deleteBanner(banner.id, banner.image_url);
                            loadBanners();
                        } catch (error: any) {
                            setAlertConfig({
                                title: 'Gagal', message: error.message, type: 'error',
                                buttons: [{ text: 'OK', onPress: hideAlert }]
                            });
                            setAlertVisible(true);
                        }
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    return {
        banners,
        isLoading,
        isSubmitting,
        modalVisible,
        setModalVisible,
        isEditing,
        newTitle,
        setNewTitle,
        newDescription,
        setNewDescription,
        selectedImage,
        setSelectedImage,
        existingImageUrl,
        pickImage,
        newTargetUrl,
        setNewTargetUrl,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        showStartPicker,
        setShowStartPicker,
        showEndPicker,
        setShowEndPicker,
        alertVisible,
        alertConfig,
        hideAlert,
        handleToggleStatus,
        handleEditPress,
        handleAddNewPress,
        handleSubmitBanner,
        handleDelete,
        refresh: loadBanners
    };
};
