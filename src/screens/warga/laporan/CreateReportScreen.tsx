import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, Image } from 'react-native';
import { CreateReportStyles as styles } from './CreateReportStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { CustomButton } from '../../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

import { createReport } from '../../../services/laporanService';
import * as ImagePicker from 'expo-image-picker';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import * as Location from 'expo-location';
import { LocationPickerModal } from '../../../components/LocationPickerModal';

export default function CreateReportScreen() {
    const router = useRouter();
    const { imageUri } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [image, setImage] = useState<string | null>(imageUri as string || null);
    const [isLoading, setIsLoading] = useState(false);

    // Location State
    const [locationLink, setLocationLink] = useState<string | null>(null);
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

    // Effect to update image if passed via params
    React.useEffect(() => {
        if (imageUri) {
            setImage(imageUri as string);
        }
    }, [imageUri]);

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

    const categories = ['Fasilitas', 'Kebersihan', 'Keamanan', 'Lainnya'];

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0].uri) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Gagal memuat galeri foto');
        }
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
                            router.back();
                        }
                    }
                ]
            });
            setAlertVisible(true);
        } catch (error: any) {
            console.error('Submit report error:', error);
            setAlertConfig({
                title: 'Gagal Mengirim',
                message: error.message || 'Terjadi kesalahan saat mengirim laporan.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
            <CustomHeader title="Buat Laporan Baru" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.formCard}>
                    {/* Title Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Judul Laporan <Text style={{ color: Colors.danger }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Lampu Taman Mati"
                            placeholderTextColor={Colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Category Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kategori <Text style={{ color: Colors.danger }}>*</Text></Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            disabled={isLoading}
                        >
                            <Text style={{ color: category ? Colors.green5 : Colors.textSecondary }}>
                                {category || "Pilih Kategori..."}
                            </Text>
                            <Ionicons name={showCategoryDropdown ? "chevron-up" : "chevron-down"} size={20} color={Colors.green4} />
                        </TouchableOpacity>

                        {showCategoryDropdown && (
                            <View style={styles.dropdownList}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setCategory(cat);
                                            setShowCategoryDropdown(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownText}>{cat}</Text>
                                        {category === cat && <Ionicons name="checkmark" size={16} color={Colors.green5} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Description Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Deskripsi <Text style={{ color: Colors.danger }}>*</Text></Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Jelaskan detail laporan anda..."
                            placeholderTextColor={Colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Location Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Lokasi Kejadian</Text>

                        {/* Display Link if exists */}
                        <View style={[styles.input, { backgroundColor: '#F9FAFB', marginBottom: 12 }]}>
                            <Text numberOfLines={1} style={{ color: locationLink ? Colors.textPrimary : Colors.textSecondary }}>
                                {locationLink || "Belum ada lokasi dipilih"}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#E0F2F1',
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: Colors.green4
                                }}
                                onPress={handleGetCurrentLocation}
                                disabled={locationStatus === 'fetching'}
                            >
                                {locationStatus === 'fetching' ? (
                                    <ActivityIndicator size="small" color={Colors.green5} />
                                ) : (
                                    <Ionicons name="navigate" size={18} color={Colors.green5} style={{ marginRight: 6 }} />
                                )}
                                <Text style={{ color: Colors.green5, fontWeight: '600', fontSize: 13 }}>
                                    {locationStatus === 'fetching' ? 'Ambil...' : 'Lokasi Saya'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: Colors.white,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: Colors.border
                                }}
                                onPress={() => setShowMapPicker(true)}
                            >
                                <Ionicons name="map-outline" size={18} color={Colors.textPrimary} style={{ marginRight: 6 }} />
                                <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 13 }}>Pilih di Peta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Photo Upload Placeholder */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Lampirkan Foto (Opsional)</Text>
                        <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage} disabled={isLoading}>
                            {image ? (
                                <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
                            ) : (
                                <>
                                    <Ionicons name="camera-outline" size={32} color={Colors.green3} />
                                    <Text style={styles.uploadText}>Ketuk untuk ambil/pilih foto</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        {image && (
                            <TouchableOpacity onPress={() => setImage(null)} style={{ marginTop: 8, alignSelf: 'center' }} disabled={isLoading}>
                                <Text style={{ color: Colors.danger, fontSize: 13 }}>Hapus Foto</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>

                <CustomButton
                    title={isLoading ? "Mengirim..." : "Kirim Laporan"}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    icon={!isLoading ? <Ionicons name="send" size={18} color={Colors.white} style={{ marginRight: 8 }} /> : undefined}
                />
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
