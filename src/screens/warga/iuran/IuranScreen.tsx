import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, RefreshControl, Platform, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../contexts/ThemeContext';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIuranViewModel, GroupedHistory, HistoryItem } from './IuranViewModel';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function IuranScreen() {
    const router = useRouter();
    const {
        currentMonth,
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
        toggleExpand,
        alertVisible,
        alertConfig,
        hideAlert,
        handleDownloadReceipt,
        isDownloadingReceiptId,
        refresh,
    } = useIuranViewModel();
    const { colors } = useTheme();

    const unpaidPeriodCount = billSummary?.periods.filter(p => p.status === 'unpaid' || p.status === 'partial' || p.status === 'overdue').length || 0;
    const paidCount = billSummary?.periods.flatMap(p => p.items.filter(i => i.status === 'paid')).length || 0;
    const pendingCount = billSummary?.periods.flatMap(p => p.items.filter(i => i.status === 'pending')).length || 0;
    const rejectedCount = billSummary?.periods.flatMap(p => p.items.filter(i => i.status === 'rejected')).length || 0;
    const unpaidItemCount = billSummary?.periods.flatMap(p => p.items.filter(i => i.status === 'unpaid' || i.status === 'rejected')).length || 0;

    const allPaid = billSummary?.periods.length && unpaidItemCount === 0 && pendingCount === 0;

    const unpaidPeriods = billSummary?.periods.filter(p => ['unpaid', 'partial', 'overdue', 'pending'].includes(p.status)) || [];
    const displayPeriods = unpaidPeriods;

    // Find oldest and newest paid periods for empty state message
    const paidPeriods = billSummary?.periods.filter(p => p.status === 'paid') || [];
    const sortedPaid = [...paidPeriods].sort((a, b) => a.id.localeCompare(b.id));
    const isAllPaid = unpaidPeriods.length === 0 && sortedPaid.length > 0;
    const paidMessage = isAllPaid
        ? `Iuran sudah lunas semua dari bulan ${sortedPaid[0].monthName} hingga ${sortedPaid[sortedPaid.length - 1].monthName}`
        : 'Admin belum menetapkan iuran untuk bulan ini.';

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[s.container, { backgroundColor: colors.background }]}>
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
                            <Text style={s.summaryMonth}>Status Keuangan Anda</Text>
                            <Text style={s.summaryTotal}>
                                {allPaid ? '✅ Lunas' : formatCurrency(billSummary?.totalUnpaid || 0)}
                            </Text>
                            {!allPaid && (
                                <Text style={s.summaryLabel}>
                                    {unpaidItemCount > 0 && `${unpaidItemCount} iuran belum dibayar`}
                                    {unpaidItemCount > 0 && pendingCount > 0 && ' • '}
                                    {pendingCount > 0 && `${pendingCount} menunggu konfirmasi`}
                                </Text>
                            )}

                            {/* Stats Row */}
                            <View style={s.statsRow}>
                                <View style={s.statItem}>
                                    <View style={[s.statDot, { backgroundColor: colors.status.selesai.text }]} />
                                    <Text style={s.statText}>Lunas {paidCount}</Text>
                                </View>
                                <View style={s.statItem}>
                                    <View style={[s.statDot, { backgroundColor: colors.status.pending.text }]} />
                                    <Text style={s.statText}>Pending {pendingCount}</Text>
                                </View>
                                <View style={s.statItem}>
                                    <View style={[s.statDot, { backgroundColor: '#E0E0E0' }]} />
                                    <Text style={s.statText}>Belum {unpaidItemCount - rejectedCount}</Text>
                                </View>
                                {rejectedCount > 0 && (
                                    <View style={s.statItem}>
                                        <View style={[s.statDot, { backgroundColor: colors.status.ditolak.text }]} />
                                        <Text style={s.statText}>Ditolak {rejectedCount}</Text>
                                    </View>
                                )}
                            </View>

                            {billSummary && billSummary.totalOverdue > 0 && (
                                <View style={s.dueDateRow}>
                                    <Ionicons name="warning" size={14} color="#FF5252" />
                                    <Text style={[s.dueDateText, { color: '#FF5252' }]}>
                                        Tunggakan: {formatCurrency(billSummary.totalOverdue)}
                                    </Text>
                                </View>
                            )}
                        </Animated.View>

                        {/* Fee Periods — Checklist */}
                        {unpaidPeriods.length > 0 && (
                            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                                <View style={s.sectionHeader}>
                                    <Text style={s.sectionTitle}>Timeline Tagihan</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <TouchableOpacity onPress={() => router.push('/iuran/timeline')}>
                                            <Text style={s.selectAllText}>Lihat Semua</Text>
                                        </TouchableOpacity>
                                        {unpaidItemCount > 0 && (
                                            <TouchableOpacity
                                                onPress={selectedCount === unpaidItemCount ? deselectAll : selectAllUnpaid}
                                            >
                                                <Text style={[s.selectAllText, { color: '#FF9800' }]}>
                                                    {selectedCount === unpaidItemCount ? 'Hapus Semua' : 'Pilih Semua'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {displayPeriods.map(period => {
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
                                                    { backgroundColor: colors.surface },
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
                                                        {period.items.map((item, idx: number) => {
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
                            </Animated.View>
                        )}

                        {/* Inline Pay Button — below fee cards */}
                        {unpaidPeriodCount > 0 && (
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

                        {/* Empty state (Lunas atau Kosong) */}
                        {billSummary && unpaidPeriods.length === 0 && (
                            <View style={s.emptyBox}>
                                <Ionicons name={isAllPaid ? "checkmark-circle" : "receipt-outline"} size={48} color={isAllPaid ? colors.status.lunas.text : "#CCC"} />
                                <Text style={s.emptyTitle}>{isAllPaid ? "Semua Kewajiban Lunas!" : "Belum Ada Iuran"}</Text>
                                <Text style={s.emptySubtext}>{paidMessage}</Text>
                                <TouchableOpacity
                                    style={{ marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#E8F5E9', borderRadius: 8 }}
                                    onPress={() => router.push('/iuran/timeline')}
                                >
                                    <Text style={{ color: '#1B5E20', fontWeight: 'bold', fontSize: 13 }}>Lihat Semua Timeline Lengkap</Text>
                                </TouchableOpacity>
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
                                {history.map((group: GroupedHistory) => {
                                    const rejectedHistoryCount = group.items.filter((i: HistoryItem) => i.status === 'Ditolak').length;
                                    const nonRejectedHistoryCount = group.items.length - rejectedHistoryCount;

                                    return (
                                        <View key={group.id} style={s.periodCard}>
                                            <TouchableOpacity
                                                style={s.periodHeader}
                                                onPress={() => toggleExpand(group.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={s.periodMonth}>{group.periodName}</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                                                        {nonRejectedHistoryCount > 0 && (
                                                            <Text style={[s.periodStatus, { color: '#4CAF50', marginTop: 0 }]}>Terbayar {nonRejectedHistoryCount} iuran</Text>
                                                        )}
                                                        {rejectedHistoryCount > 0 && (
                                                            <Text style={[s.periodStatus, { color: '#D32F2F', marginTop: 0, fontWeight: '500' }]}>
                                                                {nonRejectedHistoryCount > 0 ? '• ' : ''}Pembayaran ditolak {rejectedHistoryCount}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                                <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                                                    <Text style={s.periodAmount}>{formatCurrency(group.totalAmount)}</Text>
                                                </View>
                                                <Ionicons
                                                    name={group.isExpanded ? "chevron-up" : "chevron-down"}
                                                    size={20}
                                                    color="#666"
                                                />
                                            </TouchableOpacity>

                                            {group.isExpanded && (
                                                <View style={s.expandedBox}>
                                                    <View style={s.itemsContainer}>
                                                        {group.items.map((item: HistoryItem, idx: number) => (
                                                            <View key={item.id}>
                                                                <View style={s.historyItemRow}>
                                                                    <Ionicons
                                                                        name={item.status === 'Lunas' ? "checkmark-circle" : item.status === 'Ditolak' ? "close-circle" : "time"}
                                                                        size={20}
                                                                        color={item.status === 'Lunas' ? colors.status.lunas.text : item.status === 'Ditolak' ? colors.status.ditolak.text : colors.status.pending.text}
                                                                        style={{ marginRight: 10 }}
                                                                    />
                                                                    <View style={{ flex: 1 }}>
                                                                        <Text style={s.itemName}>{item.feeName}</Text>
                                                                        <Text style={s.historyItemSub}>{item.status === 'Lunas' ? `${item.date} • ${item.methodName}` : item.status === 'Ditolak' ? 'Pembayaran Ditolak Admin' : 'Menunggu konfirmasi'}</Text>

                                                                        {item.status === 'Ditolak' && item.rejectionReason && (
                                                                            <View>
                                                                                <Text style={{ fontSize: 11, color: '#D32F2F', marginTop: 4, fontStyle: 'italic' }}>
                                                                                    "{item.rejectionReason}"
                                                                                </Text>
                                                                                <TouchableOpacity
                                                                                    style={{ alignSelf: 'flex-start', backgroundColor: '#F44336', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 6 }}
                                                                                    onPress={() => {
                                                                                        const mockedPeriod = {
                                                                                            id: group.id,
                                                                                            periodDate: group.periodName,
                                                                                            monthName: group.periodName,
                                                                                            status: 'rejected',
                                                                                            totalAmount: item.amount,
                                                                                            unpaidAmount: item.amount,
                                                                                            isCurrentMonth: false,
                                                                                            isOverdue: false,
                                                                                            items: [{
                                                                                                fee: { id: item.feeId, name: item.feeName, amount: item.amount },
                                                                                                isPaid: false,
                                                                                                status: 'rejected',
                                                                                                amount: item.amount,
                                                                                                rawPaymentId: item.rawPaymentId
                                                                                            }]
                                                                                        };
                                                                                        router.push({
                                                                                            pathname: '/iuran/payment-detail',
                                                                                            params: {
                                                                                                selectedPeriods: JSON.stringify([mockedPeriod]),
                                                                                                totalAmount: item.amount.toString(),
                                                                                                isRepayment: 'true',
                                                                                                paymentIdToUpdate: item.rawPaymentId
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>Bayar Ulang</Text>
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                    <View style={{ alignItems: 'flex-end' }}>
                                                                        <Text style={[s.itemAmountText, item.status !== 'Lunas' && { color: item.status === 'Ditolak' ? '#F44336' : '#FF9800' }]}>{item.amountFormatted}</Text>

                                                                        {item.status === 'Lunas' && (
                                                                            <TouchableOpacity
                                                                                onPress={() => handleDownloadReceipt(item, group.periodName)}
                                                                                disabled={isDownloadingReceiptId === item.id}
                                                                                style={{ marginTop: 4 }}
                                                                            >
                                                                                {isDownloadingReceiptId === item.id ? (
                                                                                    <ActivityIndicator size="small" color="#1B5E20" />
                                                                                ) : (
                                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                                                        <Text style={{ color: '#1B5E20', fontSize: 11, fontWeight: 'bold' }}>Kuitansi</Text>
                                                                                        <Ionicons name="download-outline" size={12} color="#1B5E20" />
                                                                                    </View>
                                                                                )}
                                                                            </TouchableOpacity>
                                                                        )}
                                                                    </View>
                                                                </View>
                                                                {idx < group.items.length - 1 && <View style={s.divider} />}
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
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
    feeDetailList: { fontSize: 11, color: '#888', marginTop: 2, fontStyle: 'italic' },
    feeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
    feeStatus: { fontSize: 11, fontWeight: '500' },
    feeAmount: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20' },

    expandedBox: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8 },
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

    // Period / Monthly Group
    periodCard: {
        backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16,
        borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 }
        })
    },
    periodHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    periodMonth: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    periodStatus: { fontSize: 12, marginTop: 2 },
    periodAmount: { fontSize: 16, fontWeight: 'bold', color: '#1B5E20' },

    // History
    historyCard: {
        borderRadius: 14, padding: 14, marginBottom: 8,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
            android: { elevation: 1 },
        }),
    },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyPeriod: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    historyItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    historyItemSub: { fontSize: 11, color: '#666', marginTop: 2 },
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
