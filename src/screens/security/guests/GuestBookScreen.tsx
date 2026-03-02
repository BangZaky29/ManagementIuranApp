import React from 'react';
import {
    View, Text, TouchableOpacity, FlatList,
    StatusBar, Modal, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGuestBookViewModel } from './GuestBookViewModel';
import { formatDateTimeSafe } from '../../../utils/dateUtils';
import { styles } from './GuestBookStyles';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { CustomHeader } from '../../../components/CustomHeader';

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
            <CustomHeader title="Buku Tamu" showBack={true} />

            {/* Filter Tabs */}
            <View style={styles.tabBar}>
                {(['Aktif', 'Riwayat'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.filterChip, vm.activeTab === tab && styles.filterChipActive]}
                        onPress={() => vm.setActiveTab(tab)}
                    >
                        <Text style={[styles.filterText, vm.activeTab === tab && styles.filterTextActive]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Summary Card */}
            {vm.activeTab === 'Aktif' && (() => {
                const activeCount = vm.activeGuests.filter(g => g.status === 'active').length;
                const pendingCount = vm.activeGuests.filter(g => g.status === 'pending').length;
                const totalCount = vm.activeGuests.length;

                return (
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { color: '#0D47A1' }]}>{activeCount}</Text>
                            <Text style={styles.summaryLabel}>Aktif / Masuk</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { color: '#FF9800' }]}>{pendingCount}</Text>
                            <Text style={styles.summaryLabel}>Undangan</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{totalCount}</Text>
                            <Text style={styles.summaryLabel}>Total Semua</Text>
                        </View>
                    </View>
                );
            })()}

            {/* List Visitors */}
            <FlatList
                data={(vm.activeTab === 'Aktif' ? vm.activeGuests : vm.guestHistory).slice(0, vm.visibleHistoryCount)}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshing={vm.refreshing}
                onRefresh={() => vm.loadData(true)}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#B0BEC5" />
                        <Text style={styles.emptyTitle}>
                            {vm.activeTab === 'Aktif' ? 'Tidak Ada Tamu Aktif' : 'Riwayat Kosong'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {vm.activeTab === 'Aktif'
                                ? 'Gunakan tombol "+" di pojok kanan bawah jika ada tamu atau kurir yang datang.'
                                : 'Belum ada catatan tamu yang keluar atau selesai.'
                            }
                        </Text>
                    </View>
                }
                ListFooterComponent={() => {
                    const currentData = vm.activeTab === 'Aktif' ? vm.activeGuests : vm.guestHistory;
                    if (currentData.length <= 3) return null;

                    return (
                        <View style={{ marginTop: 8, gap: 8 }}>
                            {currentData.length > vm.visibleHistoryCount && (
                                <TouchableOpacity style={styles.showMoreBtn} onPress={vm.handleLoadMoreHistory}>
                                    <Text style={styles.showMoreText}>
                                        Lihat Lebih Banyak (+{Math.min(3, currentData.length - vm.visibleHistoryCount)})
                                    </Text>
                                    <Ionicons name="chevron-down" size={16} color="#0D47A1" />
                                </TouchableOpacity>
                            )}

                            {vm.visibleHistoryCount > 3 && (
                                <TouchableOpacity
                                    style={[styles.showMoreBtn, { borderColor: '#E57373', backgroundColor: '#FFEBEE' }]}
                                    onPress={vm.handleCollapseHistory}
                                >
                                    <Text style={[styles.showMoreText, { color: '#D32F2F' }]}>
                                        Lihat Lebih Sedikit
                                    </Text>
                                    <Ionicons name="chevron-up" size={16} color="#D32F2F" />
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                }}
                renderItem={({ item }) => (
                    <View style={[
                        styles.card,
                        item.status === 'pending' && { borderLeftColor: '#FF9800' },
                        item.status === 'completed' && { borderLeftColor: '#4CAF50' },
                        item.status === 'rejected' && { borderLeftColor: '#F44336' }
                    ]}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.guestName}>{item.visitor_name}</Text>
                                <View style={[
                                    styles.guestTypeBadge,
                                    {
                                        backgroundColor:
                                            item.status === 'pending' ? '#FF9800' :
                                                (item.status === 'completed' ? '#4CAF50' : '#0D47A1')
                                    }
                                ]}>
                                    <Text style={styles.guestTypeText}>
                                        {item.status === 'pending' ? 'Undangan (Menunggu)' :
                                            (item.status === 'completed' ? 'Selesai / Keluar' : item.visitor_type)}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.timeText}>
                                    {item.status === 'pending' ? 'Dibuat Pada' : (item.status === 'completed' ? 'Keluar Pukul' : 'Masuk Pukul')}
                                </Text>
                                <Text style={[styles.timeText, { fontWeight: 'bold', color: '#333' }]}>
                                    {item.status === 'pending'
                                        ? formatDateTimeSafe(item.created_at)
                                        : (item.status === 'completed'
                                            ? (item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-')
                                            : (item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'))}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailsRow}>
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>Tujuan (Warga)</Text>
                                <Text style={styles.detailValue} numberOfLines={1}>
                                    {item.profiles?.full_name || 'Tidak diketahui'}
                                </Text>
                                <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }} numberOfLines={1}>
                                    {item.profiles ? `Blok ${item.profiles.rt_rw || '?'}` : ''}
                                </Text>
                            </View>
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>Keperluan</Text>
                                <Text style={styles.detailValue} numberOfLines={1}>
                                    {item.purpose || '-'}
                                </Text>
                            </View>
                        </View>

                        {vm.activeTab === 'Aktif' && (
                            item.status === 'pending' ? (
                                <TouchableOpacity
                                    style={[styles.checkoutBtn, { backgroundColor: '#E8F5E9' }]}
                                    onPress={() => vm.handleCheckInWithPin(item)}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={18} color="#2E7D32" />
                                    <Text style={[styles.checkoutBtnText, { color: '#2E7D32' }]}>Verifikasi & Izinkan Masuk</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.checkoutBtn} onPress={() => vm.handleCheckOut(item)}>
                                    <Ionicons name="exit-outline" size={18} color="#C62828" />
                                    <Text style={styles.checkoutBtnText}>Checkout Keluar</Text>
                                </TouchableOpacity>
                            )
                        )}

                        {item.status === 'completed' && item.check_in_time && (
                            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="time-outline" size={12} color="#888" />
                                <Text style={{ fontSize: 12, color: '#888' }}>
                                    Masuk: {new Date(item.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} •
                                    Keluar: {new Date(item.check_out_time!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        )}
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

            {/* PIN Verification Modal */}
            <Modal
                visible={vm.pinModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => vm.setPinModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.headerRow}>
                            <Text style={styles.modalTitle}>Verifikasi PIN Tamu</Text>
                            <TouchableOpacity onPress={() => vm.setPinModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.pinInfoText}>
                            Masukkan 6-digit kode PIN yang ditunjukkan oleh {vm.selectedGuest?.visitor_name}
                        </Text>

                        <View style={styles.pinInputContainer}>
                            {[...Array(6)].map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.pinDigitBox,
                                        vm.pinInput.length === i && styles.pinDigitBoxActive
                                    ]}
                                >
                                    <Text style={styles.pinDigitText}>{vm.pinInput[i] || ''}</Text>
                                </View>
                            ))}
                            <TextInput
                                style={styles.hiddenPinInput}
                                value={vm.pinInput}
                                onChangeText={vm.setPinInput}
                                keyboardType="number-pad"
                                maxLength={6}
                                autoFocus={true}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                (vm.pinInput.length < 6 || vm.isLoading) && { opacity: 0.5 }
                            ]}
                            onPress={vm.handleVerifyPin}
                            disabled={vm.pinInput.length < 6 || vm.isLoading}
                        >
                            {vm.isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>Verifikasi & Izinkan Masuk</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => vm.setPinModalVisible(false)}
                        >
                            <Text style={styles.cancelBtnText}>Batal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
                                        style={[styles.residentListItem, !item.is_claimed && { opacity: 0.5 }]}
                                        disabled={!item.is_claimed}
                                        onPress={() => {
                                            if (!item.is_claimed) {
                                                vm.setAlertConfig({
                                                    title: 'Warga Belum Aktif',
                                                    message: 'Warga ini belum melakukan registrasi / login ke aplikasi.',
                                                    type: 'warning',
                                                    buttons: [{ text: 'OK', onPress: vm.hideAlert }]
                                                });
                                                vm.setAlertVisible(true);
                                                return;
                                            }
                                            vm.setFormDestination(item.id);
                                            vm.setResidentModalVisible(false);
                                            vm.setSearchQuery('');
                                        }}
                                    >
                                        {item.avatar_url ? (
                                            <Image source={{ uri: item.avatar_url }} style={styles.residentAvatarImg} />
                                        ) : (
                                            <View style={styles.residentAvatar}>
                                                <Ionicons name="person" size={20} color="#FFF" />
                                            </View>
                                        )}
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
