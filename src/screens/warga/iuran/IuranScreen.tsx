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
import { createStyles } from './IuranStyles';

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
    const s = React.useMemo(() => createStyles(colors), [colors]);

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
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={s.loadingText}>Memuat data iuran...</Text>
                </View>
            ) : (
                <>
                    <ScrollView
                        contentContainerStyle={s.content}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} colors={[colors.primary]} />}
                    >
                        {/* Summary Card */}
                        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.summaryCard}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View>
                                    <Text style={s.summaryMonth}>Status Keuangan</Text>
                                    <Text style={s.summaryTotal}>
                                        {allPaid ? 'Lunas' : formatCurrency(billSummary?.totalUnpaid || 0)}
                                    </Text>
                                </View>
                                <Ionicons name={allPaid ? "checkmark-done-circle" : "receipt"} size={44} color="rgba(255,255,255,0.3)" />
                            </View>

                            {!allPaid && (
                                <Text style={s.summaryLabel}>
                                    {unpaidItemCount > 0 && `${unpaidItemCount} tagihan perlu diselesaikan`}
                                </Text>
                            )}

                            <View style={s.statsRow}>
                                <View style={s.statItem}>
                                    <View style={[s.statDot, { backgroundColor: '#4CAF50' }]} />
                                    <Text style={s.statText}>{paidCount} Lunas</Text>
                                </View>
                                <View style={s.statItem}>
                                    <View style={[s.statDot, { backgroundColor: '#FFCA28' }]} />
                                    <Text style={s.statText}>{pendingCount} Pending</Text>
                                </View>
                                {rejectedCount > 0 && (
                                    <View style={s.statItem}>
                                        <View style={[s.statDot, { backgroundColor: '#FF5252' }]} />
                                        <Text style={s.statText}>{rejectedCount} Ditolak</Text>
                                    </View>
                                )}
                            </View>

                            {billSummary && billSummary.totalOverdue > 0 && (
                                <View style={s.dueDateRow}>
                                    <Ionicons name="alert-circle" size={14} color="#FFEB3B" />
                                    <Text style={[s.dueDateText, { color: '#FFEB3B' }]}>
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
                                                <Text style={[s.selectAllText, { color: colors.warning }]}>
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
                                        statusColor = period.isCurrentMonth ? colors.status.pending.text : colors.textSecondary;
                                        statusLabel = period.isCurrentMonth ? 'Bulan Ini' : 'Belum Dibayar';
                                        statusIcon = 'ellipse-outline';
                                    } else if (period.status === 'partial') {
                                        statusColor = colors.status.pending.text; statusLabel = 'Dibayar Sebagian'; statusIcon = 'pie-chart';
                                    } else if (period.status === 'paid') {
                                        statusColor = colors.status.lunas.text; statusLabel = 'Lunas'; statusIcon = 'checkmark-circle';
                                    }

                                    const periodRejectedCount = period.items.filter(i => i.status === 'rejected').length;

                                    return (
                                        <View key={period.id} style={s.feeCardContainer}>
                                            <TouchableOpacity
                                                style={[
                                                    s.feeCard,
                                                    (allSelectedInPeriod || someSelectedInPeriod) && s.feeCardSelected,
                                                    period.status === 'paid' && s.feeCardPaid,
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
                                                        {!allSelectedInPeriod && someSelectedInPeriod && <Ionicons name="remove" size={14} color={colors.primary} />}
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Ionicons name={statusIcon as any} size={22} color={statusColor} />
                                                )}

                                                <View style={s.feeInfo}>
                                                    <Text style={s.feeName}>{period.monthName}</Text>
                                                    <View style={s.feeMetaRow}>
                                                        {period.status !== 'rejected' && (
                                                            <>
                                                                <Ionicons name={statusIcon as any} size={12} color={statusColor} />
                                                                <Text style={[s.feeStatus, { color: statusColor }]}>{statusLabel}</Text>
                                                            </>
                                                        )}
                                                        {periodRejectedCount > 0 && (
                                                            <Text style={[s.feeStatus, { color: colors.danger, fontWeight: '700' }]}>
                                                                {period.status !== 'rejected' ? ' • ' : ''}Ditolak {periodRejectedCount}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>

                                                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                                    <Text style={[s.feeAmount, period.status === 'paid' && { color: colors.textSecondary }]}>
                                                        {formatCurrency(period.totalAmount)}
                                                    </Text>
                                                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
                                                </View>
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
                                                                        <View style={{ flex: 1, marginLeft: isItemPayable ? 14 : 0 }}>
                                                                            <Text style={[s.itemName, (!isItemPayable && item.status !== 'rejected') && { color: colors.textSecondary, fontWeight: '400' }]}>{item.fee.name}</Text>
                                                                            <Text style={[
                                                                                s.itemStatusLabel,
                                                                                { color: item.status === 'paid' ? colors.status.lunas.text : item.status === 'pending' ? colors.status.pending.text : item.status === 'rejected' ? colors.status.ditolak.text : colors.textSecondary }
                                                                            ]}>
                                                                                {item.status === 'paid' ? 'Terbayar' : item.status === 'pending' ? 'Diproses' : item.status === 'rejected' ? 'Ditolak' : 'Belum Bayar'}
                                                                            </Text>
                                                                        </View>
                                                                        <Text style={[s.itemAmountText, (!isItemPayable && item.status !== 'rejected') && { color: colors.textSecondary }]}>{formatCurrency(item.amount)}</Text>
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

                        {/* Empty state (Lunas atau Kosong) */}
                        {billSummary && unpaidPeriods.length === 0 && (
                            <View style={s.emptyBox}>
                                <Ionicons name={isAllPaid ? "checkmark-done-circle" : "receipt"} size={64} color={isAllPaid ? '#4CAF50' : colors.border} />
                                <View style={{ alignItems: 'center', marginTop: 12 }}>
                                    <Text style={s.emptyTitle}>{isAllPaid ? "Kewajiban Selesai!" : "Belum Ada Tagihan"}</Text>
                                    <Text style={s.emptySubtext}>
                                        {isAllPaid
                                            ? "Terima kasih! Semua tagihan iuran Anda untuk periode ini telah diselesaikan dengan baik."
                                            : "Saat ini Anda tidak memiliki tagihan aktif. Tetap pantau informasi terbaru di sini."}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* History Section */}
                        <View style={[s.sectionHeader, { marginTop: 8 }]}>
                            <Text style={s.sectionTitle}>Riwayat Pembayaran</Text>
                            <TouchableOpacity onPress={() => router.push('/iuran/history')}>
                                <Text style={s.selectAllText}>Lihat Semua</Text>
                            </TouchableOpacity>
                        </View>

                        {history.length === 0 ? (
                            <View style={[s.emptyBox, { paddingVertical: 24 }]}>
                                <Ionicons name="document-text-outline" size={32} color={colors.border} />
                                <Text style={[s.emptySubtext, { marginTop: 4 }]}>Belum ada riwayat transaksi</Text>
                            </View>
                        ) : (
                            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                                {history.slice(0, 3).map((group: GroupedHistory) => {
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
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                                        {nonRejectedHistoryCount > 0 && (
                                                            <Text style={[s.periodStatus, { color: colors.success }]}>Terbayar {nonRejectedHistoryCount} iuran</Text>
                                                        )}
                                                        {rejectedHistoryCount > 0 && (
                                                            <Text style={[s.periodStatus, { color: colors.danger, fontWeight: '700' }]}>
                                                                {nonRejectedHistoryCount > 0 ? ' • ' : ''}Ditolak {rejectedHistoryCount}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                                <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                                                    <Text style={s.periodAmount}>{formatCurrency(group.totalAmount)}</Text>
                                                    <Ionicons
                                                        name={group.isExpanded ? "chevron-up" : "chevron-down"}
                                                        size={14}
                                                        color={colors.textSecondary}
                                                        style={{ marginTop: 4 }}
                                                    />
                                                </View>
                                            </TouchableOpacity>

                                            {group.isExpanded && (
                                                <View style={s.expandedBox}>
                                                    <View style={s.itemsContainer}>
                                                        {group.items.map((item: HistoryItem, idx: number) => (
                                                            <View key={item.id}>
                                                                <View style={s.historyItemRow}>
                                                                    <Ionicons
                                                                        name={item.status === 'Lunas' ? "checkmark-circle" : item.status === 'Ditolak' ? "close-circle" : "time"}
                                                                        size={22}
                                                                        color={item.status === 'Lunas' ? '#4CAF50' : item.status === 'Ditolak' ? '#EF5350' : '#FFB74D'}
                                                                        style={{ marginRight: 12 }}
                                                                    />
                                                                    <View style={{ flex: 1 }}>
                                                                        <Text style={s.itemName}>{item.feeName}</Text>
                                                                        <Text style={s.historyItemSub}>{item.status === 'Lunas' ? `${item.date} • ${item.methodName}` : item.status === 'Ditolak' ? 'Ditolak Admin' : 'Sedang Diproses'}</Text>
                                                                    </View>
                                                                    <View style={{ alignItems: 'flex-end' }}>
                                                                        <Text style={[s.itemAmountText, item.status !== 'Lunas' && { color: item.status === 'Ditolak' ? colors.danger : colors.warning }]}>{item.amountFormatted}</Text>
                                                                        {item.status === 'Lunas' && (
                                                                            <TouchableOpacity
                                                                                onPress={() => handleDownloadReceipt(item, group.periodName)}
                                                                                style={{ marginTop: 4 }}
                                                                            >
                                                                                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>Kuitansi</Text>
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

                        <View style={{ height: 120 }} />
                    </ScrollView>

                    {/* Floating Pay Button — bottom fixed */}
                    {unpaidPeriodCount > 0 && selectedCount > 0 && (
                        <Animated.View entering={FadeInDown.springify()} style={s.payContainer}>
                            <View style={s.payInfo}>
                                <Text style={s.payInfoLabel}>{selectedCount} Iuran dipilih</Text>
                                <Text style={s.payInfoAmount}>{formatCurrency(selectedTotal)}</Text>
                            </View>
                            <TouchableOpacity
                                style={s.payBtn}
                                onPress={handlePay}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="wallet-outline" size={20} color="#FFF" />
                                <Text style={s.payBtnText}>Bayar</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </>
            )}

            <CustomAlertModal visible={alertVisible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} buttons={alertConfig.buttons} onClose={hideAlert} />
        </SafeAreaView>
    );
}
