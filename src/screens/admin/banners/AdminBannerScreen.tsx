import React from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    Image, Switch, Modal, TextInput, ActivityIndicator,
    StatusBar, ScrollView, RefreshControl, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAdminBannerViewModel } from './AdminBannerViewModel';
import { styles } from './AdminBannerStyles';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { CustomHeader } from '../../../components/CustomHeader';

export default function AdminBannerScreen() {
    const vm = useAdminBannerViewModel();

    const renderBannerItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image_url }} style={styles.bannerImage} />
            <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                    <Text style={styles.bannerTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={() => vm.handleEditPress(item)}>
                            <Ionicons name="create-outline" size={20} color="#1565C0" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => vm.handleDelete(item)}>
                            <Ionicons name="trash-outline" size={20} color="#F44336" />
                        </TouchableOpacity>
                    </View>
                </View>

                {(item.start_date || item.end_date) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5 }}>
                        <Ionicons name="calendar-outline" size={12} color="#666" />
                        <Text style={{ fontSize: 11, color: '#666' }}>
                            {item.start_date ? new Date(item.start_date).toLocaleDateString('id-ID') : '-'} s/d {item.end_date ? new Date(item.end_date).toLocaleDateString('id-ID') : 'Seterusnya'}
                        </Text>
                    </View>
                )}

                <View style={styles.metaRow}>
                    <View>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.is_active ? '#E8F5E9' : '#F5F5F5' }
                        ]}>
                            <View style={{
                                width: 6, height: 6, borderRadius: 3,
                                backgroundColor: item.is_active ? '#4CAF50' : '#9E9E9E'
                            }} />
                            <Text style={[
                                styles.statusText,
                                { color: item.is_active ? '#2E7D32' : '#666' }
                            ]}>
                                {item.is_active ? 'AKTIF' : 'NON-AKTIF'}
                            </Text>
                        </View>

                        {/* Expired Label */}
                        {item.end_date && new Date(item.end_date) < new Date() && (
                            <View style={styles.expiredBadge}>
                                <Ionicons name="time-outline" size={12} color="#C62828" />
                                <Text style={styles.expiredText}>TELAH KADALUARSA</Text>
                            </View>
                        )}
                    </View>

                    <Switch
                        value={item.is_active}
                        onValueChange={() => vm.handleToggleStatus(item)}
                        trackColor={{ false: '#DDD', true: '#81C784' }}
                        thumbColor={item.is_active ? '#2E7D32' : '#F4F4F4'}
                    />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <CustomHeader title="Kelola Iklan Banner" showBack />

            <FlatList
                data={vm.banners}
                renderItem={renderBannerItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={vm.isLoading} onRefresh={vm.refresh} colors={['#1B5E20']} />
                }
                ListEmptyComponent={
                    !vm.isLoading ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="images-outline" size={64} color="#EEE" />
                            <Text style={styles.emptyTitle}>Belum ada iklan</Text>
                            <Text style={styles.emptySub}>Tambahkan iklan untuk ditampilkan di beranda warga.</Text>
                        </View>
                    ) : null
                }
            />

            {/* Float Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={vm.handleAddNewPress}
            >
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>

            {/* Add Banner Modal */}
            <Modal
                visible={vm.modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => vm.setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {vm.isEditing ? 'Edit Iklan' : 'Tambah Iklan Baru'}
                            </Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Judul Iklan</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contoh: Promo Sembako Pak RT"
                                    value={vm.newTitle}
                                    onChangeText={vm.setNewTitle}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Gambar Iklan (Banner 16:9)</Text>
                                <View style={styles.imagePickerPlaceholder}>
                                    {vm.selectedImage ? (
                                        <Image source={{ uri: vm.selectedImage.uri }} style={styles.pickedImage} />
                                    ) : vm.existingImageUrl ? (
                                        <Image source={{ uri: vm.existingImageUrl }} style={styles.pickedImage} />
                                    ) : (
                                        <>
                                            <Ionicons name="image-outline" size={40} color="#BDBDBD" />
                                            <Text style={[styles.imagePickerLabel, { color: '#9E9E9E' }]}>Belum ada gambar terpilih</Text>
                                        </>
                                    )}
                                </View>

                                <View style={styles.pickerActionRow}>
                                    <TouchableOpacity
                                        style={styles.pickerBtn}
                                        onPress={() => vm.pickImage(false)}
                                    >
                                        <Ionicons name="image" size={20} color="#1B5E20" />
                                        <Text style={styles.pickerBtnText}>Galeri</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.pickerBtn}
                                        onPress={() => vm.pickImage(true)}
                                    >
                                        <Ionicons name="camera" size={20} color="#1B5E20" />
                                        <Text style={styles.pickerBtnText}>Kamera</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Deskripsi Iklan</Text>
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Masukkan deskripsi singkat iklan..."
                                    value={vm.newDescription}
                                    onChangeText={vm.setNewDescription}
                                    multiline
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Link Tujuan (Opsional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="https://wa.me/..."
                                    value={vm.newTargetUrl}
                                    onChangeText={vm.setNewTargetUrl}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Periode Aktif Iklan</Text>
                                <View style={styles.dateInputRow}>
                                    <TouchableOpacity
                                        style={styles.dateInputBtn}
                                        onPress={() => vm.setShowStartPicker(true)}
                                    >
                                        <Ionicons name="calendar" size={18} color="#1B5E20" />
                                        <View>
                                            <Text style={styles.dateInputText}>Mulai</Text>
                                            <Text style={styles.dateValueText}>{vm.startDate.toLocaleDateString('id-ID')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.dateInputBtn}
                                        onPress={() => vm.setShowEndPicker(true)}
                                    >
                                        <Ionicons name="calendar" size={18} color="#1B5E20" />
                                        <View>
                                            <Text style={styles.dateInputText}>Berakhir</Text>
                                            <Text style={styles.dateValueText}>
                                                {vm.endDate ? vm.endDate.toLocaleDateString('id-ID') : 'Seterusnya'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                {vm.endDate && (
                                    <TouchableOpacity
                                        onPress={() => vm.setEndDate(null)}
                                        style={{ marginTop: 8, alignSelf: 'flex-end' }}
                                    >
                                        <Text style={{ fontSize: 12, color: '#F44336', fontWeight: 'bold' }}>Reset Tanggal Berakhir</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {vm.showStartPicker && (
                                <DateTimePicker
                                    value={vm.startDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                                        vm.setShowStartPicker(false);
                                        if (date) vm.setStartDate(date);
                                    }}
                                />
                            )}

                            {vm.showEndPicker && (
                                <DateTimePicker
                                    value={vm.endDate || new Date()}
                                    mode="date"
                                    minimumDate={vm.startDate}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                                        vm.setShowEndPicker(false);
                                        if (date) vm.setEndDate(date);
                                    }}
                                />
                            )}

                            <TouchableOpacity
                                style={[styles.submitBtn, vm.isSubmitting && { opacity: 0.7 }]}
                                onPress={vm.handleSubmitBanner}
                                disabled={vm.isSubmitting}
                            >
                                {vm.isSubmitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitBtnText}>
                                        {vm.isEditing ? 'Simpan Perubahan' : 'Tambah Iklan'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => vm.setModalVisible(false)}
                                disabled={vm.isSubmitting}
                            >
                                <Text style={styles.cancelBtnText}>Batal</Text>
                            </TouchableOpacity>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>


            <CustomAlertModal
                visible={vm.alertVisible}
                title={vm.alertConfig.title}
                message={vm.alertConfig.message}
                type={vm.alertConfig.type}
                buttons={vm.alertConfig.buttons}
                onClose={vm.hideAlert}
            />
        </SafeAreaView>
    );
}
