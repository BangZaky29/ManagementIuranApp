import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, ActivityIndicator } from 'react-native';
import { CreateReportStyles as styles } from './CreateReportStyles';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { CustomButton } from '../../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { LocationPickerModal } from '../../../components/LocationPickerModal';
import { useCreateReportViewModel } from './CreateReportViewModel';

export default function CreateReportScreen() {
    const {
        title, setTitle,
        description, setDescription,
        category, setCategory,
        image, setImage,
        imageAspectRatio,
        locationLink,

        isLoading,
        isEditMode, // Now we know if we are editing
        showCategoryDropdown, setShowCategoryDropdown,
        locationStatus,
        showMapPicker, setShowMapPicker,

        alertVisible,
        alertConfig,
        hideAlert,

        handlePickImage,
        handleGetCurrentLocation,
        handleSelectLocation,
        handleSubmit
    } = useCreateReportViewModel();

    const categories = ['Fasilitas', 'Kebersihan', 'Keamanan', 'Lainnya'];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
            <CustomHeader title={isEditMode ? "Edit Laporan" : "Buat Laporan Baru"} showBack={true} />

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

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
                                    borderColor: Colors.green4,
                                    marginRight: 5
                                }}
                                onPress={() => {
                                    console.log("Tombol Lokasi Saya ditekan");
                                    handleGetCurrentLocation();
                                }}
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
                                    borderColor: '#E5E7EB',
                                    marginLeft: 5
                                }}
                                onPress={() => {
                                    console.log("Tombol Pilih di Peta ditekan");
                                    setShowMapPicker(true);
                                }}
                            >
                                <Ionicons name="map-outline" size={18} color={Colors.textPrimary} style={{ marginRight: 6 }} />
                                <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 13 }}>Pilih di Peta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Photo Upload Placeholder */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Lampirkan Foto (Opsional)</Text>
                        <TouchableOpacity
                            style={[
                                styles.uploadArea,
                                image ? { height: undefined, aspectRatio: imageAspectRatio, padding: 0, borderWidth: 0 } : {}
                            ]}
                            onPress={handlePickImage}
                            disabled={isLoading}
                        >
                            {image ? (
                                <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="contain" />
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
                    title={isLoading ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Kirim Laporan")}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    icon={!isLoading ? <Ionicons name="send" size={18} color={Colors.white} style={{ marginRight: 8 }} /> : undefined}
                />
            </ScrollView>

            <LocationPickerModal
                visible={showMapPicker}
                onClose={() => setShowMapPicker(false)}
                onSelectLocation={handleSelectLocation}
            />

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
