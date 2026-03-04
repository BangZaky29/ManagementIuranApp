import { useTheme } from '../../../contexts/ThemeContext';
import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Modal, Pressable,
    ActivityIndicator, RefreshControl, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBackupManagementViewModel, BACKUP_SCHEDULE_OPTIONS } from './BackupManagementViewModel';
import { createStyles } from './BackupManagementStyles';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    'Lunas': { bg: '#E8F5E9', text: '#2E7D32' },
    'Menunggu': { bg: '#FFF8E1', text: '#F57F17' },
    'Ditolak': { bg: '#FFEBEE', text: '#C62828' },
    'Terlambat': { bg: '#FFF3E0', text: '#E65100' },
};

const STATUS_FILTERS = [
    { key: 'all', label: 'Semua' },
    { key: 'paid', label: 'Lunas' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'rejected', label: 'Ditolak' },
    { key: 'overdue', label: 'Terlambat' },
] as const;

const BACKUP_STATUS_ICON: Record<string, { color: string; name: string }> = {
    success: { color: '#2E7D32', name: 'checkmark-circle' },
    failed: { color: '#C62828', name: 'close-circle' },
    pending: { color: '#F57F17', name: 'time' },
};

export default function BackupManagementScreen() {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const router = useRouter();
    const vm = useBackupManagementViewModel();
    const formatCurrency = (amount: number) => 'Rp ' + amount.toLocaleString('id-ID');

    const currentScheduleLabel = BACKUP_SCHEDULE_OPTIONS.find(o => o.key === vm.selectedSchedule)?.label || '-';

    return (
        <View style={styles.container}>
            {/* ── Header with Back Button ── */}
            <CustomHeader title="Kelola Data" showBack onBack={() => router.back()} />

            <ScrollView refreshControl={<RefreshControl refreshing={vm.isLoading} onRefresh={vm.refresh} />}>

                {/* ── Summary ── */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>📊 Rekap Iuran — {vm.complexName}</Text>
                    <View style={styles.summaryRow}>
                        {[
                            { value: vm.summary.lunas, label: 'Lunas', color: '#2E7D32' },
                            { value: vm.summary.pending, label: 'Menunggu', color: '#F57F17' },
                            { value: vm.summary.ditolak, label: 'Ditolak', color: '#C62828' },
                            { value: vm.summary.overdue, label: 'Terlambat', color: '#E65100' },
                        ].map(item => (
                            <View key={item.label} style={styles.summaryCard}>
                                <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
                                <Text style={styles.summaryLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.summaryTotal}>
                        <Text style={styles.summaryTotalLabel}>Total Nominal</Text>
                        <Text style={styles.summaryTotalValue}>{formatCurrency(vm.summary.totalNominal)}</Text>
                    </View>
                </View>

                {/* ── Period Filter ── */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Periode</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterRow}>
                            <TouchableOpacity
                                style={[styles.filterChip, !vm.selectedPeriod && styles.filterChipActive]}
                                onPress={() => vm.setSelectedPeriod('')}
                            >
                                <Text style={[styles.filterChipText, !vm.selectedPeriod && styles.filterChipTextActive]}>Semua</Text>
                            </TouchableOpacity>
                            {vm.availablePeriods.map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.filterChip, vm.selectedPeriod === p && styles.filterChipActive]}
                                    onPress={() => vm.setSelectedPeriod(p)}
                                >
                                    <Text style={[styles.filterChipText, vm.selectedPeriod === p && styles.filterChipTextActive]}>
                                        {vm.formatPeriodLabel(p)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* ── Status Filter ── */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterRow}>
                            {STATUS_FILTERS.map(s => (
                                <TouchableOpacity
                                    key={s.key}
                                    style={[styles.filterChip, vm.selectedStatus === s.key && styles.filterChipActive]}
                                    onPress={() => vm.setSelectedStatus(s.key)}
                                >
                                    <Text style={[styles.filterChipText, vm.selectedStatus === s.key && styles.filterChipTextActive]}>
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* ── Download Buttons ── */}
                <View style={styles.downloadSection}>
                    <Text style={styles.sectionTitle}>💾 Download Laporan</Text>
                    <View style={styles.downloadRow}>
                        <TouchableOpacity
                            style={[styles.downloadBtn, styles.pdfBtn]}
                            onPress={vm.handleDownloadPdf}
                            disabled={vm.isGenerating}
                        >
                            {vm.isGenerating ? <ActivityIndicator size="small" color="#FFF" /> : (
                                <>
                                    <Ionicons name="document-text" size={20} color="#FFF" />
                                    <Text style={styles.downloadBtnText}>PDF</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.downloadBtn, styles.excelBtn]}
                            onPress={vm.handleDownloadExcel}
                            disabled={vm.isGenerating}
                        >
                            {vm.isGenerating ? <ActivityIndicator size="small" color="#FFF" /> : (
                                <>
                                    <Ionicons name="grid" size={20} color="#FFF" />
                                    <Text style={styles.downloadBtnText}>Excel</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Google Drive Backup ── */}
                <View style={styles.backupSection}>
                    <Text style={styles.backupTitle}>☁️ Backup ke Google Drive</Text>

                    {/* Connection Status */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{
                            width: 8, height: 8, borderRadius: 4, marginRight: 8,
                            backgroundColor: vm.isDriveConnected ? '#2E7D32' : '#CCC',
                        }} />
                        <Text style={{ fontSize: 12, color: vm.isDriveConnected ? '#2E7D32' : '#999', flex: 1 }}>
                            {vm.isDriveConnected
                                ? `✅ Terhubung: ${vm.googleEmail}`
                                : '❌ Belum terhubung ke akun Google'}
                        </Text>
                    </View>

                    {/* Backup Button */}
                    <TouchableOpacity
                        style={[
                            styles.backupBtn,
                            !vm.isDriveConnected && { backgroundColor: '#5F6368' },
                            (vm.isBackingUp || vm.isLinkingGoogle) && styles.backupBtnDisabled,
                        ]}
                        onPress={() => vm.handleBackupToDrive()}
                        disabled={vm.isBackingUp || vm.isLinkingGoogle}
                    >
                        {vm.isBackingUp ? <ActivityIndicator size="small" color="#FFF" /> : (
                            <>
                                <Ionicons
                                    name={vm.isDriveConnected ? 'logo-google' : 'link-outline'}
                                    size={20} color="#FFF"
                                />
                                <Text style={styles.backupBtnText}>
                                    {vm.isDriveConnected ? 'Backup ke Google Drive' : 'Hubungkan & Backup'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* If not connected — Link Google button */}
                    {!vm.isDriveConnected && (
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                marginTop: 10, paddingVertical: 10, borderRadius: 10,
                                borderWidth: 1, borderColor: '#4285F4', gap: 8,
                            }}
                            onPress={() => vm.handleLinkGoogle()}
                            disabled={vm.isLinkingGoogle}
                        >
                            {vm.isLinkingGoogle
                                ? <ActivityIndicator size="small" color="#4285F4" />
                                : <Ionicons name="logo-google" size={18} color="#4285F4" />
                            }
                            <Text style={{ color: '#4285F4', fontSize: 14, fontWeight: '600' }}>
                                {vm.isLinkingGoogle ? 'Menghubungkan...' : 'Hubungkan Akun Google'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Auto Backup Row */}
                    {vm.isAutoBackupEnabled && (
                        <View style={[styles.autoBackupRow, { marginTop: 16 }]}>
                            <View>
                                <Text style={styles.autoBackupLabel}>🔄 Backup Otomatis</Text>
                                <Text style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                                    Jadwal: {currentScheduleLabel}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={{
                                    paddingHorizontal: 14, paddingVertical: 6,
                                    backgroundColor: '#E8F5E9', borderRadius: 20,
                                    borderWidth: 1, borderColor: '#A5D6A7',
                                }}
                                onPress={() => vm.setShowSchedulePicker(true)}
                            >
                                <Text style={{ color: '#2E7D32', fontWeight: '700', fontSize: 12 }}>Atur Jadwal</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* ── Backup History ── */}
                {vm.backupHistory.length > 0 && (
                    <View style={styles.previewSection}>
                        <Text style={styles.sectionTitle}>📋 Riwayat Backup</Text>
                        {vm.backupHistory.map(log => {
                            const icon = BACKUP_STATUS_ICON[log.status] || BACKUP_STATUS_ICON.pending;
                            return (
                                <View key={log.id} style={styles.previewCard}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name={icon.name as any} size={18} color={icon.color} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.previewName}>{log.file_name || 'Backup'}</Text>
                                            <Text style={styles.previewDetail}>
                                                {vm.formatDateTime(log.created_at)} • {log.records_count || 0} data
                                            </Text>
                                        </View>
                                        {log.drive_link && (
                                            <TouchableOpacity onPress={() => Linking.openURL(log.drive_link!)}>
                                                <Ionicons name="open-outline" size={18} color="#4285F4" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {log.error_message && (
                                        <Text style={{ fontSize: 11, color: '#C62828', marginTop: 4 }}>
                                            {log.error_message}
                                        </Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* ── Data Preview ── */}
                <View style={styles.previewSection}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.sectionTitle}>Preview Data</Text>
                        <Text style={styles.previewCount}>{vm.summary.totalTransaksi} transaksi</Text>
                    </View>

                    {vm.isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                    ) : vm.rows.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="file-tray-outline" size={48} color="#CCC" />
                            <Text style={styles.emptyText}>Tidak ada data untuk filter ini</Text>
                        </View>
                    ) : (
                        vm.rows.slice(0, 20).map((row, idx) => {
                            const sc = STATUS_COLORS[row.status] || { bg: '#F0F0F0', text: '#666' };
                            return (
                                <View key={idx} style={styles.previewCard}>
                                    <Text style={styles.previewName}>{row.nama_warga}</Text>
                                    <Text style={styles.previewDetail}>{row.nama_iuran} • {row.periode}</Text>
                                    <View style={styles.previewRow}>
                                        <Text style={styles.previewAmount}>{formatCurrency(row.jumlah)}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                                            <Text style={[styles.statusText, { color: sc.text }]}>{row.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}

                    {vm.rows.length > 20 && (
                        <Text style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 8, marginBottom: 40 }}>
                            Menampilkan 20 dari {vm.rows.length} data. Download untuk melihat semua.
                        </Text>
                    )}
                    <View style={{ height: 60 }} />
                </View>
            </ScrollView>

            {/* ── Auto Backup Schedule Picker Modal ── */}
            <Modal
                visible={vm.showSchedulePicker}
                transparent
                animationType="slide"
                onRequestClose={() => vm.setShowSchedulePicker(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
                    onPress={() => vm.setShowSchedulePicker(false)}
                >
                    <Pressable style={{
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingTop: 12,
                        paddingBottom: 32,
                        paddingHorizontal: 20,
                    }}>
                        {/* Handle */}
                        <View style={{
                            width: 40, height: 4, borderRadius: 2,
                            backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 20,
                        }} />
                        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 6 }}>
                            🔄 Jadwal Backup Otomatis
                        </Text>
                        <Text style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
                            Pilih seberapa sering backup dilakukan secara otomatis
                        </Text>
                        {BACKUP_SCHEDULE_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.key}
                                style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    paddingVertical: 14, paddingHorizontal: 16,
                                    borderRadius: 12, marginBottom: 10,
                                    backgroundColor: vm.selectedSchedule === opt.key ? '#E8F5E9' : '#F8F8F8',
                                    borderWidth: 1.5,
                                    borderColor: vm.selectedSchedule === opt.key ? '#2E7D32' : '#EEE',
                                }}
                                onPress={() => vm.handleScheduleSelect(opt.key)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 15, fontWeight: '600',
                                        color: vm.selectedSchedule === opt.key ? colors.primary : '#333',
                                    }}>{opt.label}</Text>
                                    <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{opt.desc}</Text>
                                </View>
                                {vm.selectedSchedule === opt.key && (
                                    <Ionicons name="checkmark-circle" size={22} color="#2E7D32" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ── Custom Alert Modal ── */}
            <CustomAlertModal
                visible={vm.alertVisible}
                title={vm.alertConfig.title}
                message={vm.alertConfig.message}
                type={vm.alertConfig.type}
                buttons={vm.alertConfig.buttons}
                onClose={vm.hideAlert}
            />
        </View>
    );
}
