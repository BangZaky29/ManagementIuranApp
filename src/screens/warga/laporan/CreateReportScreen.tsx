import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, Image } from 'react-native';
import { CreateReportStyles as styles } from './CreateReportStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { CustomButton } from '../../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

import { CustomAlertModal } from '../../../components/CustomAlertModal';

export default function CreateReportScreen() {
    const router = useRouter();
    const { imageUri } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [image, setImage] = useState<string | null>(imageUri as string || null);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    // Effect to update image if passed via params (e.g. from Camera Tab)
    React.useEffect(() => {
        if (imageUri) {
            setImage(imageUri as string);
        }
    }, [imageUri]);

    const categories = ['Fasilitas', 'Kebersihan', 'Keamanan', 'Lainnya'];

    const handlePickImage = async () => {
        setAlertConfig({
            title: 'Info',
            message: 'Gunakan tombol kamera di menu bawah untuk mengambil foto baru.',
            type: 'info',
            buttons: [{ text: 'OK', onPress: hideAlert }]
        });
        setAlertVisible(true);
    };

    const handleSubmit = () => {
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
                        />
                    </View>

                    {/* Category Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kategori <Text style={{ color: Colors.danger }}>*</Text></Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
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
                        />
                    </View>

                    {/* Photo Upload Placeholder */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Lampirkan Foto (Opsional)</Text>
                        <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage} disabled={!!image}>
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
                            <TouchableOpacity onPress={() => setImage(null)} style={{ marginTop: 8, alignSelf: 'center' }}>
                                <Text style={{ color: Colors.danger, fontSize: 13 }}>Hapus Foto</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>

                <CustomButton
                    title="Kirim Laporan"
                    onPress={handleSubmit}
                    icon={<Ionicons name="send" size={18} color={Colors.white} style={{ marginRight: 8 }} />}
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

