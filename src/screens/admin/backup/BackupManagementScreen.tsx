import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBackupManagementViewModel } from './BackupManagementViewModel';
import { styles } from './BackupManagementStyles';
import { CustomHeader } from '../../../components/common/CustomHeader';

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
    const router = useRouter();
    const vm = useBackupManagementViewModel();
    const formatCurrency = (amount: number) => 'Rp ' + amount.toLocaleString('id-ID');

    return (
        <View style={styles.container}>
            <CustomHeader title="Kelola Data" onBack={() => router.back()} />

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
                    <Text style={styles.sectionTitle}>Download Laporan</Text>
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
                        <Text style={{ fontSize: 12, color: vm.isDriveConnected ? '#2E7D32' : '#999' }}>
                            {vm.isDriveConnected
                                ? `Terhubung: ${vm.googleEmail}`
                                : 'Belum terhubung ke akun Google'}
                        </Text>
                    </View>

                    {vm.isDriveConnected ? (
                        <TouchableOpacity
                            style={[styles.backupBtn, vm.isBackingUp && styles.backupBtnDisabled]}
                            onPress={() => vm.handleBackupToDrive()}
                            disabled={vm.isBackingUp}
                        >
                            {vm.isBackingUp ? <ActivityIndicator size="small" color="#FFF" /> : (
                                <>
                                    <Ionicons name="logo-google" size={20} color="#FFF" />
                                    <Text style={styles.backupBtnText}>Backup ke Google Drive</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.backupBtn, { backgroundColor: '#5F6368' }]}
                            onPress={() => vm.handleConnectGoogle()}
                            disabled={vm.isBackingUp}
                        >
                            {vm.isBackingUp ? <ActivityIndicator size="small" color="#FFF" /> : (
                                <>
                                    <Ionicons name="link-outline" size={20} color="#FFF" />
                                    <Text style={styles.backupBtnText}>Hubungkan Akun Google</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Auto Backup Row */}
                    {vm.isAutoBackupEnabled && (
                        <View style={styles.autoBackupRow}>
                            <Text style={styles.autoBackupLabel}>Backup Otomatis</Text>
                            <View style={[styles.autoBackupBadge, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={[styles.autoBackupBadgeText, { color: '#2E7D32' }]}>Aktif</Text>
                            </View>
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
                                            <Text style={styles.previewName}>
                                                {log.file_name || 'Backup'}
                                            </Text>
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
                        <ActivityIndicator size="large" color="#1B5E20" style={{ marginTop: 20 }} />
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
        </View>
    );
}
