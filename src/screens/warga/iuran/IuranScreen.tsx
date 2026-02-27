import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, SafeAreaView,
    StatusBar, ActivityIndicator, RefreshControl, Platform, StyleSheet
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../contexts/ThemeContext';
import { CustomHeader } from '../../../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIuranViewModel } from './IuranViewModel';
import { CustomAlertModal } from '../../../components/CustomAlertModal';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function IuranScreen() {
    const router = useRouter();
    const {
        currentMonth,
        billSummary,
        history,
        isLoading,
        selectedFeeIds,
        selectedTotal,
        selectedCount,
        toggleFee,
        selectAllUnpaid,
        deselectAll,
        handlePay,
        toggleExpand,
        alertVisible,
        alertConfig,
        hideAlert,
        handleDownloadReceipt,
        isDownloadingReceiptId,
        refresh,
    } = useIuranViewModel();
    const { colors } = useTheme();

    const unpaidCount = billSummary?.items.filter(i => i.status === 'unpaid').length || 0;
    const paidCount = billSummary?.items.filter(i => i.status === 'paid').length || 0;
    const pendingCount = billSummary?.pendingCount || 0;

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.green1} />
            <CustomHeader title="Manajemen Iuran" showBack={false} />

            {isLoading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color="#1B5E20" />
                    <Text style={s.loadingText}>Memuat data iuran...</Text>
                </View>
            ) : (
                <>
                    <ScrollView
                        contentContainerStyle={s.content}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} colors={['#1B5E20']} />}
                    >
                        {/* Summary Card */}
                        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.summaryCard}>
                            <Text style={s.summaryMonth}>{currentMonth}</Text>
                            <Text style={s.summaryTotal}>
                                {billSummary?.allPaid ? '✅ Lunas' : formatCurrency(billSummary?.totalUnpaid || 0)}
                            </Text>
                            {!billSummary?.allPaid && (
                                <Text style={s.summaryLabel}>Total tagihan belum dibayar</Text>
                            )}

                            {/* Stats Row */}
                            <View style={s.statsRow}>
                                <View style={s.statItem}>
                                    <View style={[s.statDot, { backgroundColor: '#4CAF50' }]} />
                                    <Text style={s.statText}>Lunas {paidCount}</Text>
                                </View>
                                <View style={s.statItem}>
                                    <View style={[s.statDot, { backgroundColor: '#FF9800' }]} />
                                    <Text style={s.statText}>Pending {pendingCount}</Text>
                                </View>
                                <View style={s.statItem}>
                                    <View style={[s.statDot, { backgroundColor: '#E0E0E0' }]} />
                                    <Text style={s.statText}>Belum {unpaidCount}</Text>
                                </View>
                            </View>

                            {billSummary && !billSummary.allPaid && billSummary.dueDate !== '-' && (
                                <View style={s.dueDateRow}>
                                    <Ionicons name="alarm-outline" size={14} color="#E65100" />
                                    <Text style={s.dueDateText}>Jatuh tempo: {billSummary.dueDate}</Text>
                                </View>
                            )}
                        </Animated.View>

                        {/* Fee Items — Checklist */}
                        {billSummary && billSummary.items.length > 0 && (
                            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                                <View style={s.sectionHeader}>
                                    <Text style={s.sectionTitle}>Rincian Iuran</Text>
                                    {unpaidCount > 0 && (
                                        <TouchableOpacity
                                            onPress={selectedCount === unpaidCount ? deselectAll : selectAllUnpaid}
                                        >
                                            <Text style={s.selectAllText}>
                                                {selectedCount === unpaidCount ? 'Hapus Semua' : 'Pilih Semua'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {billSummary.items.map(item => {
                                    const isUnpaid = item.status === 'unpaid';
                                    const isSelected = selectedFeeIds.has(item.fee.id);
                                    const statusColor = item.status === 'paid' ? '#4CAF50'
                                        : item.status === 'pending' ? '#FF9800' : '#C62828';
                                    const statusLabel = item.status === 'paid' ? 'Lunas'
                                        : item.status === 'pending' ? 'Menunggu Konfirmasi' : 'Belum Dibayar';
                                    const statusIcon = item.status === 'paid' ? 'checkmark-circle'
                                        : item.status === 'pending' ? 'time' : 'close-circle';

                                    return (
                                        <TouchableOpacity
                                            key={item.fee.id}
                                            style={[
                                                s.feeCard,
                                                isSelected && s.feeCardSelected,
                                                item.status === 'paid' && s.feeCardPaid,
                                                { backgroundColor: colors.backgroundCard },
                                            ]}
                                            onPress={() => isUnpaid && toggleFee(item.fee.id)}
                                            activeOpacity={isUnpaid ? 0.7 : 1}
                                            disabled={!isUnpaid}
                                        >
                                            {/* Checkbox or status icon */}
                                            {isUnpaid ? (
                                                <View style={[s.checkbox, isSelected && s.checkboxChecked]}>
                                                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                                </View>
                                            ) : (
                                                <Ionicons name={statusIcon as any} size={22} color={statusColor} />
                                            )}

                                            {/* Fee info */}
                                            <View style={s.feeInfo}>
                                                <Text style={s.feeName}>{item.fee.name}</Text>
                                                <View style={s.feeMetaRow}>
                                                    <Ionicons name={statusIcon as any} size={12} color={statusColor} />
                                                    <Text style={[s.feeStatus, { color: statusColor }]}>{statusLabel}</Text>
                                                </View>
                                            </View>

                                            {/* Amount */}
                                            <Text style={[s.feeAmount, item.status === 'paid' && { color: '#999' }]}>
                                                {formatCurrency(item.amount)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </Animated.View>
                        )}

                        {/* Inline Pay Button — below fee cards */}
                        {unpaidCount > 0 && (
                            <View style={s.payContainer}>
                                <View style={s.payInfo}>
                                    <Text style={s.payInfoLabel}>
                                        {selectedCount > 0 ? `${selectedCount} iuran dipilih` : 'Pilih iuran di atas'}
                                    </Text>
                                    <Text style={s.payInfoAmount}>
                                        {selectedCount > 0 ? formatCurrency(selectedTotal) : '-'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[s.payBtn, selectedCount === 0 && s.payBtnDisabled]}
                                    onPress={handlePay}
                                    disabled={selectedCount === 0}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="wallet-outline" size={18} color="#FFF" />
                                    <Text style={s.payBtnText}>Bayar Sekarang</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Empty state */}
                        {billSummary && billSummary.items.length === 0 && (
                            <View style={s.emptyBox}>
                                <Ionicons name="receipt-outline" size={48} color="#CCC" />
                                <Text style={s.emptyTitle}>Belum Ada Iuran</Text>
                                <Text style={s.emptySubtext}>Admin belum menetapkan iuran untuk bulan ini.</Text>
                            </View>
                        )}

                        {/* History */}
                        <View style={s.sectionHeader}>
                            <Text style={s.sectionTitle}>Riwayat Pembayaran</Text>
                            <TouchableOpacity onPress={() => router.push('/iuran/history')}>
                                <Text style={s.selectAllText}>Lihat Semua</Text>
                            </TouchableOpacity>
                        </View>

                        {history.length === 0 ? (
                            <View style={s.emptyBox}>
                                <Ionicons name="document-text-outline" size={36} color="#CCC" />
                                <Text style={s.emptySubtext}>Belum ada riwayat pembayaran</Text>
                            </View>
                        ) : (
                            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                                {history.map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[s.historyCard, { backgroundColor: colors.backgroundCard }]}
                                        onPress={() => toggleExpand(item.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={s.historyRow}>
                                            <View>
                                                <Text style={s.historyPeriod}>{item.period}</Text>
                                                <Text style={s.historyDate}>{item.date}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={s.historyAmount}>{item.amount}</Text>
                                                <Text style={[s.historyStatus, {
                                                    color: item.status === 'Lunas' ? '#4CAF50' : item.status === 'Terlambat' ? '#C62828' : '#FF9800'
                                                }]}>{item.status}</Text>
                                            </View>
                                        </View>
                                        {item.isExpanded && (
                                            <View style={s.expandedRow}>
                                                <View style={s.detailLine}>
                                                    <Text style={s.detailLabel}>Metode</Text>
                                                    <Text style={s.detailValue}>{item.methodName}</Text>
                                                </View>
                                                {/* Download Kuitansi Button */}
                                                {(item.status === 'Lunas' || item.status === 'Terlambat') && (
                                                    <TouchableOpacity
                                                        style={s.downloadBtn}
                                                        onPress={() => handleDownloadReceipt(item)}
                                                        disabled={isDownloadingReceiptId === item.id}
                                                    >
                                                        {isDownloadingReceiptId === item.id ? (
                                                            <ActivityIndicator size="small" color="#FFF" />
                                                        ) : (
                                                            <>
                                                                <Ionicons name="download-outline" size={16} color="#FFF" />
                                                                <Text style={s.downloadBtnText}>Unduh Kuitansi</Text>
                                                            </>
                                                        )}
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </Animated.View>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </>
            )}

            <CustomAlertModal visible={alertVisible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} buttons={alertConfig.buttons} onClose={hideAlert} />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7F5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 14, color: '#888', marginTop: 12 },
    content: { padding: 16 },

    // Summary
    summaryCard: {
        backgroundColor: '#1B5E20', borderRadius: 20, padding: 20, marginBottom: 20,
    },
    summaryMonth: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
    summaryTotal: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginTop: 4 },
    summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    statsRow: { flexDirection: 'row', marginTop: 16, gap: 16 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    statDot: { width: 8, height: 8, borderRadius: 4 },
    statText: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    dueDateRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
        paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)',
    },
    dueDateText: { fontSize: 12, color: '#FFB74D', fontWeight: '500' },

    // Section
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
    selectAllText: { fontSize: 13, fontWeight: '600', color: '#1B5E20' },

    // Fee Card
    feeCard: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14,
        marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
            android: { elevation: 1 },
        }),
    },
    feeCardSelected: { borderColor: '#1B5E20', backgroundColor: '#F1F8E9' },
    feeCardPaid: { opacity: 0.65 },
    checkbox: {
        width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CCC',
        alignItems: 'center', justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
    feeInfo: { flex: 1, marginLeft: 12 },
    feeName: { fontSize: 14, fontWeight: '600', color: '#333' },
    feeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
    feeStatus: { fontSize: 11, fontWeight: '500' },
    feeAmount: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20' },

    // Pay Container (inline)
    payContainer: {
        flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 4, marginBottom: 16,
        backgroundColor: '#FFF', borderRadius: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    payInfo: { flex: 1 },
    payInfoLabel: { fontSize: 12, color: '#888' },
    payInfoAmount: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },

    // Empty
    emptyBox: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16 },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 12 },
    emptySubtext: { fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center' },

    // History
    historyCard: {
        borderRadius: 14, padding: 14, marginBottom: 8,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
            android: { elevation: 1 },
        }),
    },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyPeriod: { fontSize: 14, fontWeight: '600', color: '#333' },
    historyDate: { fontSize: 11, color: '#888', marginTop: 2 },
    historyAmount: { fontSize: 14, fontWeight: 'bold', color: '#1B5E20', textAlign: 'right' },
    historyStatus: { fontSize: 13, fontWeight: '700' },
    expandedRow: {
        marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEE',
    },
    detailLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    detailLabel: { fontSize: 13, color: '#888' },
    detailValue: { fontSize: 13, fontWeight: '500', color: '#333' },

    // Receipt Download Button
    downloadBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#1B5E20', paddingVertical: 10, borderRadius: 10, marginTop: 12,
    },
    downloadBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
    // Pay Button
    payBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#1B5E20', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
    },
    payBtnDisabled: { backgroundColor: '#CCC' },
    payBtnText: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
});
