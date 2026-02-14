import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createReport, updateReport, fetchReportById } from '../../../services/laporanService';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useCreateReportViewModel = () => {
    const router = useRouter();
    const { id, imageUri } = useLocalSearchParams(); // id present = Edit Mode

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [imageAspectRatio, setImageAspectRatio] = useState<number>(4 / 3);
    const [locationLink, setLocationLink] = useState<string | null>(null);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'fetching' | 'success' | 'error' | 'idle'>('idle');
    const [showMapPicker, setShowMapPicker] = useState(false);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    // Initial Load
    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            loadReportData(id as string);
        } else if (imageUri) {
            setImage(imageUri as string);
        }
    }, [id, imageUri]);

    const loadReportData = async (reportId: string) => {
        setIsLoading(true);
        try {
            const data = await fetchReportById(reportId);
            if (data) {
                setTitle(data.title);
                setDescription(data.description);
                setCategory(data.category);
                setImage(data.image_url);
                setLocationLink(data.location);
            }
        } catch (error) {
            console.error('Failed to load report:', error);
            Alert.alert('Error', 'Gagal memuat data laporan.');
        } finally {
            setIsLoading(false);
        }
    };

    // Actions
    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0].uri) {
                const asset = result.assets[0];
                setImage(asset.uri);
                if (asset.width && asset.height) {
                    setImageAspectRatio(asset.width / asset.height);
                }
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Gagal memuat galeri foto');
        }
    };

    const handleGetCurrentLocation = async () => {
        setLocationStatus('fetching');
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Ditolak', 'Izin lokasi diperlukan.');
                setLocationStatus('error');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const link = `https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`;
            setLocationLink(link);
            setLocationStatus('success');
        } catch (error) {
            console.warn('Location Error:', error);
            Alert.alert('Gagal', 'Tidak dapat mengambil lokasi saat ini.');
            setLocationStatus('error');
        }
    };

    const handleSelectLocation = (coords: { latitude: number; longitude: number }) => {
        const link = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
        setLocationLink(link);
        setLocationStatus('success');
    };

    const handleSubmit = async () => {
        if (!title || !category || !description) {
            setAlertConfig({
                title: 'Mohon Lengkapi',
                message: 'Judul, kategori, dan deskripsi wajib diisi.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        setIsLoading(true);
        try {
            if (isEditMode && id) {
                // Update
                await updateReport(id as string, {
                    title,
                    description,
                    category,
                    imageUri: image?.startsWith('file://') ? image : undefined, // Only upload if it's a local file
                    location: locationLink || undefined
                });

                setAlertConfig({
                    title: 'Laporan Diperbarui',
                    message: 'Perubahan berhasil disimpan.',
                    type: 'success',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => {
                                hideAlert();
                                router.back();
                            }
                        }
                    ]
                });
            } else {
                // Create
                await createReport(title, description, category, image || undefined, locationLink || undefined);
                setAlertConfig({
                    title: 'Laporan Terkirim',
                    message: 'Terima kasih atas laporan anda. Kami akan segera memprosesnya.',
                    type: 'success',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => {
                                hideAlert();
                                router.navigate('/(tabs)/laporan');
                            }
                        }
                    ]
                });
            }
            setAlertVisible(true);

        } catch (error: any) {
            console.error('Submit report error:', error);
            setAlertConfig({
                title: 'Gagal Mengirim',
                message: error.message || 'Terjadi kesalahan saat menyimpan laporan.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // Data
        title, setTitle,
        description, setDescription,
        category, setCategory,
        image, setImage,
        imageAspectRatio,
        locationLink,

        // UI State
        isLoading,
        isEditMode,
        showCategoryDropdown, setShowCategoryDropdown,
        locationStatus,
        showMapPicker, setShowMapPicker,

        // Alert
        alertVisible,
        alertConfig,
        hideAlert,

        // Actions
        handlePickImage,
        handleGetCurrentLocation,
        handleSelectLocation,
        handleSubmit
    };
};
