import React from 'react';
import {
    View, Text, SafeAreaView, TouchableOpacity, FlatList,
    StatusBar, Modal, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGuestBookViewModel } from './GuestBookViewModel';
import { styles } from './GuestBookStyles';
import { CustomAlertModal } from '../../../components/CustomAlertModal';

const VISITOR_TYPES = ['tamu', 'gojek', 'kurir', 'pekerja', 'lainnya'] as const;

export default function GuestBookScreen() {
    const vm = useGuestBookViewModel();

    if (vm.isLoading && vm.activeGuests.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0D47A1" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Buku Tamu</Text>
                        <Text style={styles.subtitle}>{vm.activeGuests.length} tamu/kurir sedang di dalam area</Text>
                    </View>
                </View>
            </View>

            {/* List Active Guests */}
            <FlatList
                data={vm.activeGuests}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshing={vm.isLoading}
                onRefresh={vm.loadData}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#B0BEC5" />
                        <Text style={styles.emptyTitle}>Tidak Ada Tamu Aktif</Text>
                        <Text style={styles.emptySubtitle}>
                            Gunakan tombol "+" di pojok kanan bawah jika ada tamu atau kurir yang datang.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.guestName}>{item.visitor_name}</Text>
                                <View style={[styles.guestTypeBadge, { backgroundColor: '#0D47A1' }]}>
                                    <Text style={styles.guestTypeText}>{item.visitor_type}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.timeText}>Masuk Pukul</Text>
                                <Text style={[styles.timeText, { fontWeight: 'bold', color: '#333' }]}>
                                    {item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailsRow}>
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>Tujuan (Warga)</Text>
                                <Text style={styles.detailValue} numberOfLines={1}>
                                    {item.profiles?.full_name || 'Tidak diketahui'}
                                    {item.profiles?.housing_complex_id ? ` (Blok ${item.profiles.housing_complex_id})` : ''}
                                </Text>
                            </View>
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>Keperluan</Text>
                                <Text style={styles.detailValue} numberOfLines={1}>
                                    {item.purpose || '-'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.checkoutBtn} onPress={() => vm.handleCheckOut(item)}>
                            <Ionicons name="exit-outline" size={18} color="#C62828" />
                            <Text style={styles.checkoutBtnText}>Checkout Keluar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Add Walk-in Guest Modal */}
            <Modal
                visible={vm.addModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => vm.setAddModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Catat Tamu Baru</Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Nama Tamu / Kurir <Text style={{ color: 'red' }}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contoh: Anton (JNE)"
                                        value={vm.formName}
                                        onChangeText={vm.setFormName}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Jenis Kunjungan <Text style={{ color: 'red' }}>*</Text></Text>
                                    <View style={styles.typeSelector}>
                                        {VISITOR_TYPES.map(type => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[styles.typeBtn, vm.formType === type && styles.typeBtnActive]}
                                                onPress={() => vm.setFormType(type)}
                                            >
                                                <Text style={[styles.typeText, vm.formType === type && styles.typeTextActive]}>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Tujuan (Pilih Warga) <Text style={{ color: 'red' }}>*</Text></Text>
                                    <TouchableOpacity
                                        style={styles.pickerButton}
                                        onPress={() => vm.setResidentModalVisible(true)}
                                    >
                                        <Text style={[styles.pickerButtonText, !vm.formDestination && { color: '#999' }]}>
                                            {vm.formDestination
                                                ? vm.residents.find(r => r.id === vm.formDestination)?.full_name || 'Pilih Warga...'
                                                : 'Pencet untuk pilih warga tujuan...'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#666" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Keperluan <Text style={{ color: 'red' }}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contoh: Antar Paket Shopee"
                                        value={vm.formPurpose}
                                        onChangeText={vm.setFormPurpose}
                                    />
                                </View>
                            </ScrollView>

                            <TouchableOpacity
                                style={[styles.submitBtn, vm.isSubmitting && { opacity: 0.7 }]}
                                onPress={vm.handleAddWalkin}
                                disabled={vm.isSubmitting}
                            >
                                {vm.isSubmitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Izinkan Masuk</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => vm.setAddModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Batal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Resident Picker Modal */}
            <Modal
                visible={vm.residentModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => vm.setResidentModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { height: '80%' }]}>
                            <View style={styles.headerRow}>
                                <Text style={styles.modalTitle}>Cari Warga</Text>
                                <TouchableOpacity onPress={() => vm.setResidentModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Ketik nama warga atau blok..."
                                    value={vm.searchQuery}
                                    onChangeText={vm.setSearchQuery}
                                    autoFocus
                                />
                            </View>

                            <FlatList
                                data={vm.filteredResidents}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.residentListItem}
                                        onPress={() => {
                                            vm.setFormDestination(item.id);
                                            vm.setResidentModalVisible(false);
                                            vm.setSearchQuery('');
                                        }}
                                    >
                                        <View style={styles.residentAvatar}>
                                            <Ionicons name="person" size={20} color="#FFF" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.residentName}>{item.full_name}</Text>
                                            <Text style={styles.residentBlock}>{item.block || 'Blok tidak diketahui'}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>Warga tidak ditemukan.</Text>
                                }
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <CustomAlertModal
                visible={vm.alertVisible} title={vm.alertConfig.title} message={vm.alertConfig.message}
                type={vm.alertConfig.type} buttons={vm.alertConfig.buttons} onClose={vm.hideAlert}
            />

            {/* Floating Add Button */}
            <TouchableOpacity 
                style={styles.floatingAddBtn} 
                onPress={() => vm.setAddModalVisible(true)}
            >
                <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
