import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { createStyles } from './CreateReportStyles';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { CustomButton } from '../../../components/common/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { LocationPickerModal } from '../../../components/laporan/LocationPickerModal';
import { useCreateReportViewModel } from './CreateReportViewModel';

export default function CreateReportScreen() {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

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
        handleLaunchCamera,
        handleGetCurrentLocation,
        handleSelectLocation,
        handleSubmit
    } = useCreateReportViewModel();

    const categories = ['Fasilitas', 'Kebersihan', 'Keamanan', 'Lainnya'];

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
            <CustomHeader title={isEditMode ? "Edit Laporan" : "Buat Laporan Baru"} showBack={true} />

            <KeyboardAwareScrollView
                contentContainerStyle={styles.content}
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === 'ios' ? 20 : 40}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.formCard}>
                    {/* Title Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Judul Laporan <Text style={{ color: colors.danger }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Lampu Taman Mati"
                            placeholderTextColor={colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Category Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kategori <Text style={{ color: colors.danger }}>*</Text></Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            disabled={isLoading}
                        >
                            <Text style={{ color: category ? colors.textPrimary : colors.textSecondary }}>
                                {category || "Pilih Kategori..."}
                            </Text>
                            <Ionicons name={showCategoryDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
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
                                        {category === cat && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Description Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Deskripsi <Text style={{ color: colors.danger }}>*</Text></Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Jelaskan detail laporan anda..."
                            placeholderTextColor={colors.textSecondary}
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
                        <View style={[styles.input, { backgroundColor: colors.surfaceSubtle, marginBottom: 12 }]}>
                            <Text numberOfLines={1} style={{ color: locationLink ? colors.textPrimary : colors.textSecondary }}>
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
                                    backgroundColor: colors.primarySubtle,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: colors.primary,
                                    marginRight: 5
                                }}
                                onPress={() => {
                                    handleGetCurrentLocation();
                                }}
                                disabled={locationStatus === 'fetching'}
                            >
                                {locationStatus === 'fetching' ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Ionicons name="navigate" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                                )}
                                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
                                    {locationStatus === 'fetching' ? 'Ambil...' : 'Lokasi Saya'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: colors.surface,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    marginLeft: 5
                                }}
                                onPress={() => {
                                    setShowMapPicker(true);
                                }}
                            >
                                <Ionicons name="map-outline" size={18} color={colors.textPrimary} style={{ marginRight: 6 }} />
                                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>Pilih di Peta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Photo Upload Section */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Lampirkan Foto (Opsional)</Text>

                        {!image ? (
                            <View style={styles.photoActionRow}>
                                <TouchableOpacity
                                    style={[styles.photoButton, styles.galleryButton]}
                                    onPress={handlePickImage}
                                    disabled={isLoading}
                                >
                                    <Ionicons name="images-outline" size={20} color={colors.primary} />
                                    <Text style={styles.photoButtonText}>Pilih Foto</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.photoButton, styles.cameraButton]}
                                    onPress={handleLaunchCamera}
                                    disabled={isLoading}
                                >
                                    <Ionicons name="camera-outline" size={20} color={colors.primary} />
                                    <Text style={styles.photoButtonText}>Buka Kamera</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.imagePreviewContainer}>
                                <Image
                                    source={{ uri: image }}
                                    style={{ width: '100%', aspectRatio: imageAspectRatio }}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    style={styles.removeImageBtn}
                                    onPress={() => setImage(null)}
                                    disabled={isLoading}
                                >
                                    <Ionicons name="close" size={20} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </View>

                <CustomButton
                    title={isLoading ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Kirim Laporan")}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    icon={!isLoading ? <Ionicons name="send" size={18} color={colors.textWhite} style={{ marginRight: 8 }} /> : undefined}
                />
            </KeyboardAwareScrollView>

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
