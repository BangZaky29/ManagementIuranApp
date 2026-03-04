import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { useIuranViewModel } from './IuranViewModel';
import { useTheme } from '../../../contexts/ThemeContext';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function TimelineScreen() {
    const router = useRouter();
    const {
        billSummary,
        history,
        isLoading,
        expandedPeriodIds,
        selectedItemKeys,
        selectedTotal,
        selectedCount,
        toggleExpandPeriod,
        togglePeriodSelection,
        toggleItemSelection,
        selectAllUnpaid,
        deselectAll,
        handlePay,
    } = useIuranViewModel();
    const { colors } = useTheme();

    const unpaidItemCount = billSummary?.periods.flatMap(p => p.items.filter(i => i.status === 'unpaid')).length || 0;
    const allPaid = billSummary?.periods.length && unpaidItemCount === 0;

    const [timelineFilter, setTimelineFilter] = useState<'Semua' | 'Belum Lunas' | 'Lunas'>('Semua');
    const filters = ['Semua', 'Belum Lunas', 'Lunas'];

    const filteredPeriods = billSummary?.periods.filter(period => {
        if (timelineFilter === 'Semua') return true;
        if (timelineFilter === 'Belum Lunas') return period.status !== 'paid'; // which means unpaid, partial, overdue, pending, rejected
        if (timelineFilter === 'Lunas') return period.status === 'paid';
        return true;
    }) || [];

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[s.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.green1} />
            <CustomHeader title="Timeline Tagihan Lengkap" showBack={true} />

            {isLoading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color="#1B5E20" />
                    <Text style={s.loadingText}>Memuat timeline...</Text>
                </View>
            ) : (
                <>
                    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                        {billSummary && billSummary.periods.length > 0 ? (
                            <View>
                                <View style={s.sectionHeader}>
                                    <Text style={s.sectionTitle}>Semua Tagihan</Text>
                                    {unpaidItemCount > 0 && timelineFilter !== 'Lunas' && (
                                        <TouchableOpacity
                                            onPress={selectedCount === unpaidItemCount ? deselectAll : selectAllUnpaid}
                                        >
                                            <Text style={[s.selectAllText, { color: '#FF9800' }]}>
                                                {selectedCount === unpaidItemCount ? 'Hapus Semua' : 'Pilih Semua'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={s.filterRow}>
                                    {filters.map(f => (
                                        <TouchableOpacity
                                            key={f}
                                            style={[s.filterChip, timelineFilter === f && s.filterChipActive]}
                                            onPress={() => setTimelineFilter(f as any)}
                                        >
                                            <Text style={[s.filterText, timelineFilter === f && s.filterTextActive]}>{f}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {filteredPeriods.length === 0 ? (
                                    <View style={s.emptyBox}>
                                        <Ionicons name="documents-outline" size={48} color="#CCC" />
                                        <Text style={s.emptyTitle}>Tidak ada tagihan {timelineFilter}</Text>
                                    </View>
                                ) : filteredPeriods.map(period => {
                                    const isPayable = period.status === 'unpaid' || period.status === 'partial' || period.status === 'overdue';
                                    const isExpanded = expandedPeriodIds.has(period.id);

                                    const unpaidItemsInPeriod = period.items.filter(i => i.status === 'unpaid');
                                    const allSelectedInPeriod = unpaidItemsInPeriod.length > 0 && unpaidItemsInPeriod.every(i => selectedItemKeys.has(`${period.id}|${i.fee.id}`));
                                    const someSelectedInPeriod = unpaidItemsInPeriod.length > 0 && unpaidItemsInPeriod.some(i => selectedItemKeys.has(`${period.id}|${i.fee.id}`));

                                    let statusColor = '#4CAF50';
                                    let statusLabel = 'Lunas';
                                    let statusIcon = 'checkmark-circle';

                                    if (period.status === 'overdue') {
                                        statusColor = colors.status.terlambat.text; statusLabel = 'Tunggakan'; statusIcon = 'alert-circle';
                                    } else if (period.status === 'pending') {
                                        statusColor = colors.status.pending.text; statusLabel = 'Menunggu Konfirmasi'; statusIcon = 'time';
                                    } else if (period.status === 'unpaid') {
                                        statusColor = period.isCurrentMonth ? colors.status.pending.text : '#888';
                                        statusLabel = period.isCurrentMonth ? 'Bulan Ini' : 'Belum Dibayar';
                                        statusIcon = 'ellipse-outline';
                                    } else if (period.status === 'partial') {
                                        statusColor = colors.status.pending.text; statusLabel = 'Dibayar Sebagian'; statusIcon = 'pie-chart';
                                    } else if (period.status === 'rejected') {
                                        statusColor = colors.status.ditolak.text; statusLabel = 'Ditolak'; statusIcon = 'close-circle';
                                    } else if (period.status === 'paid') {
                                        statusColor = colors.status.lunas.text; statusLabel = 'Lunas'; statusIcon = 'checkmark-circle';
                                    }

                                    const periodRejectedCount = period.items.filter(i => i.status === 'rejected').length;

                                    return (
                                        <View key={period.id} style={{ marginBottom: 8 }}>
                                            <TouchableOpacity
                                                style={[
                                                    s.feeCard,
                                                    { marginBottom: 0 },
                                                    (allSelectedInPeriod || someSelectedInPeriod) && s.feeCardSelected,
                                                    period.status === 'paid' && s.feeCardPaid,
                                                    { backgroundColor: colors.backgroundCard },
                                                ]}
                                                onPress={() => toggleExpandPeriod(period.id)}
                                                activeOpacity={0.7}
                                            >
                                                {/* Checkbox for whole month */}
                                                {isPayable ? (
                                                    <TouchableOpacity
                                                        style={[s.checkbox, allSelectedInPeriod && s.checkboxChecked]}
                                                        onPress={() => togglePeriodSelection(period.id)}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                    >
                                                        {allSelectedInPeriod && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                                        {!allSelectedInPeriod && someSelectedInPeriod && <Ionicons name="remove" size={14} color="#1B5E20" />}
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Ionicons name={statusIcon as any} size={22} color={statusColor} />
                                                )}

                                                <View style={s.feeInfo}>
                                                    <Text style={s.feeName}>{period.monthName}</Text>
                                                    <View style={[s.feeMetaRow, { flexWrap: 'wrap' }]}>
                                                        {period.status !== 'rejected' && (
                                                            <>
                                                                <Ionicons name={statusIcon as any} size={12} color={statusColor} />
                                                                <Text style={[s.feeStatus, { color: statusColor, marginRight: 6 }]}>{statusLabel}</Text>
                                                            </>
                                                        )}
                                                        {periodRejectedCount > 0 && (
                                                            <Text style={[s.feeStatus, { color: '#D32F2F', fontWeight: '500' }]}>
                                                                {period.status !== 'rejected' ? '• ' : ''}Pembayaran ditolak {periodRejectedCount}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>

                                                <Text style={[s.feeAmount, period.status === 'paid' && { color: '#999' }]}>
                                                    {formatCurrency(period.totalAmount)}
                                                </Text>
                                                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#888" style={{ marginLeft: 8 }} />
                                            </TouchableOpacity>

                                            {/* EXPANDED ITEMS LIST */}
                                            {isExpanded && (
                                                <View style={s.expandedBox}>
                                                    <View style={s.itemsContainer}>
                                                        {period.items.map((item: any, idx: number) => {
                                                            const isItemPayable = item.status === 'unpaid' || item.status === 'rejected';
                                                            const isItemSelected = selectedItemKeys.has(`${period.id}|${item.fee.id}`);
                                                            return (
                                                                <View key={item.fee.id}>
                                                                    <View style={s.itemRow}>
                                                                        {isItemPayable ? (
                                                                            <TouchableOpacity
                                                                                style={[s.checkbox, s.itemCheckbox, isItemSelected && s.checkboxChecked]}
                                                                                onPress={() => toggleItemSelection(period.id, item.fee.id)}
                                                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                                            >
                                                                                {isItemSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                                                                            </TouchableOpacity>
                                                                        ) : (
                                                                            <Ionicons name="checkmark-circle" size={20} color={item.status === 'paid' ? '#4CAF50' : '#FF9800'} style={{ marginRight: 10 }} />
                                                                        )}
                                                                        <View style={{ flex: 1 }}>
                                                                            <Text style={[s.itemName, (!isItemPayable && item.status !== 'rejected') && { color: '#888' }]}>{item.fee.name}</Text>
                                                                            <Text style={[
                                                                                s.itemStatusLabel,
                                                                                { color: item.status === 'paid' ? colors.status.lunas.text : item.status === 'pending' ? colors.status.pending.text : item.status === 'rejected' ? colors.status.ditolak.text : '#888' }
                                                                            ]}>
                                                                                {item.status === 'paid' ? 'Lunas' : item.status === 'pending' ? 'Menunggu Konfirmasi' : item.status === 'rejected' ? 'Ditolak' : 'Belum Dibayar'}
                                                                            </Text>

                                                                            {item.status === 'rejected' && item.rejectionReason && (
                                                                                <Text style={{ fontSize: 11, color: '#D32F2F', marginTop: 4, fontStyle: 'italic' }}>
                                                                                    "{item.rejectionReason}"
                                                                                </Text>
                                                                            )}
                                                                        </View>
                                                                        <Text style={[s.itemAmountText, (!isItemPayable && item.status !== 'rejected') && { color: '#888' }]}>{formatCurrency(item.amount)}</Text>
                                                                    </View>
                                                                    {idx < period.items.length - 1 && <View style={s.divider} />}
                                                                </View>
                                                            )
                                                        })}
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={s.emptyBox}>
                                <Ionicons name="calendar-clear-outline" size={48} color="#CCC" />
                                <Text style={s.emptyTitle}>Belum ada tagihan.</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Pay Button Inline Bottom */}
                    {selectedCount > 0 && (
                        <View style={s.payContainer}>
                            <View style={s.payInfo}>
                                <Text style={s.payInfoLabel}>{selectedCount} Iuran Dipilih</Text>
                                <Text style={s.payInfoAmount}>{formatCurrency(selectedTotal)}</Text>
                            </View>
                            <TouchableOpacity style={s.payBtn} onPress={handlePay}>
                                <Text style={s.payBtnText}>Bayar</Text>
                                <Ionicons name="chevron-forward" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
    content: { padding: 16, paddingBottom: 40 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    selectAllText: { fontSize: 13, fontWeight: '600' },

    feeCard: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8,
        borderWidth: 1, borderColor: '#E0E0E0',
    },
    feeCardSelected: { borderColor: '#4CAF50', backgroundColor: '#F1F8E9' },
    feeCardPaid: { borderColor: '#EEE', opacity: 0.8 },

    checkbox: {
        width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#1B5E20',
        justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: '#FFF',
    },
    checkboxChecked: { backgroundColor: '#1B5E20' },

    feeInfo: { flex: 1, marginLeft: 12 },
    feeName: { fontSize: 14, fontWeight: '600', color: '#333' },
    feeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
    feeStatus: { fontSize: 11, fontWeight: '500' },
    feeAmount: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20' },

    expandedBox: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FAFAFA', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    itemCheckbox: { width: 18, height: 18, marginRight: 10, borderRadius: 4 },
    itemName: { flex: 1, fontSize: 13, color: '#333' },
    itemAmountText: { fontSize: 13, fontWeight: 'bold', color: '#1B5E20' },
    itemsContainer: {
        backgroundColor: '#F9F9F9', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12,
        marginTop: 4, borderWidth: 1, borderColor: '#EEE'
    },
    itemStatusLabel: { fontSize: 11, marginTop: 2, fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 8 },

    payContainer: {
        flexDirection: 'row', alignItems: 'center', padding: 16, margin: 16,
        backgroundColor: '#FFF', borderRadius: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    payInfo: { flex: 1 },
    payInfoLabel: { fontSize: 12, color: '#888' },
    payInfoAmount: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },
    payBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1B5E20', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
    payBtnText: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
    emptyBox: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 12 },

    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: 'transparent' },
    filterChipActive: { backgroundColor: '#1B5E20' },
    filterText: { fontSize: 13, color: '#1B5E20', fontWeight: '600' },
    filterTextActive: { color: '#FFF' },
});
