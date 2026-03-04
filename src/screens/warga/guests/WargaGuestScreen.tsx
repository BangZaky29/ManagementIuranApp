import React from 'react';
import {
    View, Text, TouchableOpacity, FlatList,
    StatusBar, Modal, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWargaGuestViewModel } from './WargaGuestViewModel';
import { formatDateSafe } from '../../../utils/dateUtils';
import { createStyles } from './WargaGuestStyles';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { useTheme } from '../../../contexts/ThemeContext';

const VISITOR_TYPES = ['tamu', 'gojek', 'kurir', 'pekerja', 'lainnya'] as const;

export default function WargaGuestScreen() {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const vm = useWargaGuestViewModel();
    const router = useRouter();

    if (vm.isLoading && vm.myVisitors.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => vm.setAddModalVisible(true)}>
                        <Ionicons name="add" size={20} color={colors.textWhite} />
                        <Text style={styles.addButtonText}>Undang Tamu</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>Buku Tamu Saya</Text>
                <Text style={styles.subtitle}>Kelola tamu dan kurir yang akan datang ke rumah Anda</Text>
            </View>

            {/* List My Visitors */}
            <FlatList
                data={vm.myVisitors}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshing={vm.isLoading}
                onRefresh={vm.loadData}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="mail-open-outline" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyTitle}>Belum Ada Tamu</Text>
                        <Text style={styles.emptySubtitle}>
                            Buat undangan masuk untuk tamu Anda agar proses di gerbang lebih cepat.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.guestName}>{item.visitor_name}</Text>
                                <View style={[
                                    styles.guestTypeBadge,
                                    { backgroundColor: item.status === 'pending' ? colors.status.menunggu.bg : colors.status.selesai.bg }
                                ]}>
                                    <Text style={[
                                        styles.guestTypeText,
                                        { color: item.status === 'pending' ? colors.status.menunggu.text : colors.status.selesai.text }
                                    ]}>
                                        {item.status === 'pending' ? 'Menunggu Kedatangan' : (item.status === 'active' ? 'Sudah Masuk' : 'Selesai')}
                                    </Text>
                                </View>
                            </View>
                            {item.status === 'pending' && item.pin_code && (
                                <View style={styles.pinContainer}>
                                    <Text style={styles.pinLabel}>KODE PIN</Text>
                                    <Text style={styles.pinValue}>{item.pin_code}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.detailsRow}>
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>Tipe Kunjungan</Text>
                                <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>
                                    {item.visitor_type}
                                </Text>
                            </View>
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>Keperluan</Text>
                                <Text style={styles.detailValue} numberOfLines={1}>
                                    {item.purpose || '-'}
                                </Text>
                            </View>
                        </View>

                        {/* Status timeline */}
                        <View style={styles.timelineRow}>
                            <View style={styles.timelineItem}>
                                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                <Text style={styles.timelineText}>Dibuat: {formatDateSafe(item.created_at)}</Text>
                            </View>
                            {item.check_in_time && (
                                <View style={styles.timelineItem}>
                                    <Ionicons name="log-in-outline" size={14} color={colors.status.selesai.text} />
                                    <Text style={styles.timelineText}>Masuk: {new Date(item.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            />

            {/* Add Pre-register Guest Modal */}
            <Modal
                visible={vm.addModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => vm.setAddModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Buat Undangan Tamu</Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Nama Tamu / Layanan <Text style={{ color: colors.danger }}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contoh: Budi (Keluarga) atau Gojek"
                                        placeholderTextColor={colors.textSecondary}
                                        value={vm.formName}
                                        onChangeText={vm.setFormName}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Jenis Kunjungan <Text style={{ color: colors.danger }}>*</Text></Text>
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
                                    <Text style={styles.inputLabel}>Keperluan <Text style={{ color: colors.danger }}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contoh: Silaturahmi Keluarga"
                                        placeholderTextColor={colors.textSecondary}
                                        value={vm.formPurpose}
                                        onChangeText={vm.setFormPurpose}
                                    />
                                </View>
                            </ScrollView>

                            <TouchableOpacity
                                style={[styles.submitBtn, vm.isSubmitting && { opacity: 0.7 }]}
                                onPress={vm.handlePreRegisterGuest}
                                disabled={vm.isSubmitting}
                            >
                                {vm.isSubmitting ? (
                                    <ActivityIndicator color={colors.textWhite} />
                                ) : (
                                    <Text style={styles.submitBtnText}>Buat PIN Undangan</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => vm.setAddModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Batal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <CustomAlertModal
                visible={vm.alertVisible} title={vm.alertConfig.title} message={vm.alertConfig.message}
                type={vm.alertConfig.type} buttons={vm.alertConfig.buttons} onClose={vm.hideAlert}
            />
        </SafeAreaView>
    );
}
