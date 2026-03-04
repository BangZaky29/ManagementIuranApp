import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBackupManagementViewModel } from './BackupManagementViewModel';
import { styles } from './BackupManagementStyles';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { FeatureFlags } from '../../../constants/FeatureFlags';

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

export default function BackupManagementScreen() {
    const router = useRouter();
    const vm = useBackupManagementViewModel();

    const formatCurrency = (amount: number) =>
        'Rp ' + amount.toLocaleString('id-ID');

    return (
        <View style={styles.container}>
            <CustomHeader title="Kelola Data" onBack={() => router.back()} />

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={vm.isLoading} onRefresh={vm.refresh} />
                }
            >
                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>
                        📊 Rekap Iuran — {vm.complexName}
                    </Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>
                                {vm.summary.lunas}
                            </Text>
                            <Text style={styles.summaryLabel}>Lunas</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryValue, { color: '#F57F17' }]}>
                                {vm.summary.pending}
                            </Text>
                            <Text style={styles.summaryLabel}>Menunggu</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryValue, { color: '#C62828' }]}>
                                {vm.summary.ditolak}
                            </Text>
                            <Text style={styles.summaryLabel}>Ditolak</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryValue, { color: '#E65100' }]}>
                                {vm.summary.overdue}
                            </Text>
                            <Text style={styles.summaryLabel}>Terlambat</Text>
                        </View>
                    </View>
                    <View style={styles.summaryTotal}>
                        <Text style={styles.summaryTotalLabel}>Total Nominal</Text>
                        <Text style={styles.summaryTotalValue}>
                            {formatCurrency(vm.summary.totalNominal)}
                        </Text>
                    </View>
                </View>

                {/* Period Filter */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Periode</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterRow}>
                            <TouchableOpacity
                                style={[styles.filterChip, !vm.selectedPeriod && styles.filterChipActive]}
                                onPress={() => vm.setSelectedPeriod('')}
                            >
                                <Text style={[styles.filterChipText, !vm.selectedPeriod && styles.filterChipTextActive]}>
                                    Semua
                                </Text>
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

                {/* Status Filter */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Status</Text>
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
                </View>

                {/* Download Buttons */}
                <View style={styles.downloadSection}>
                    <Text style={styles.sectionTitle}>Download Laporan</Text>
                    <View style={styles.downloadRow}>
                        <TouchableOpacity
                            style={[styles.downloadBtn, styles.pdfBtn]}
                            onPress={vm.handleDownloadPdf}
                            disabled={vm.isGenerating}
                        >
                            {vm.isGenerating ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
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
                            {vm.isGenerating ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="grid" size={20} color="#FFF" />
                                    <Text style={styles.downloadBtnText}>Excel</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Backup Cloud Section (future) */}
                <View style={styles.backupSection}>
                    <Text style={styles.backupTitle}>☁️ Backup ke Cloud</Text>
                    <Text style={styles.backupSubtitle}>
                        Simpan data ke Google Drive akun Anda
                    </Text>
                    <TouchableOpacity
                        style={[styles.backupBtn, styles.backupBtnDisabled]}
                        disabled={true}
                    >
                        <Ionicons name="logo-google" size={20} color="#FFF" />
                        <Text style={styles.backupBtnText}>
                            Backup ke Google Drive
                        </Text>
                    </TouchableOpacity>

                    {/* Auto Backup Toggle */}
                    <View style={styles.autoBackupRow}>
                        <Text style={styles.autoBackupLabel}>Backup Otomatis</Text>
                        {!FeatureFlags.IS_AUTO_BACKUP_ENABLED ? (
                            <View style={styles.autoBackupBadge}>
                                <Text style={styles.autoBackupBadgeText}>Segera Hadir</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Data Preview */}
                <View style={styles.previewSection}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.sectionTitle}>Preview Data</Text>
                        <Text style={styles.previewCount}>
                            {vm.summary.totalTransaksi} transaksi
                        </Text>
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
                            const statusColor = STATUS_COLORS[row.status] || { bg: '#F0F0F0', text: '#666' };
                            return (
                                <View key={idx} style={styles.previewCard}>
                                    <Text style={styles.previewName}>{row.nama_warga}</Text>
                                    <Text style={styles.previewDetail}>
                                        {row.nama_iuran} • {row.periode}
                                    </Text>
                                    <View style={styles.previewRow}>
                                        <Text style={styles.previewAmount}>
                                            {formatCurrency(row.jumlah)}
                                        </Text>
                                        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                                            <Text style={[styles.statusText, { color: statusColor.text }]}>
                                                {row.status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}

                    {vm.rows.length > 20 && (
                        <Text style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 8 }}>
                            Menampilkan 20 dari {vm.rows.length} data. Download untuk melihat semua.
                        </Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
