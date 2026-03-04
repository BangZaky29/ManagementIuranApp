import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, StatusBar, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useHistoryViewModel } from './HistoryViewModel';
import { FilterCalendar } from '../../../components/payment/FilterCalendar';
import { formatDateSafe } from '../../../utils/dateUtils';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function PaymentHistoryScreen() {
    const router = useRouter();
    const {
        searchQuery,
        setSearchQuery,
        selectedDate,
        filteredHistory,
        statuses,
        selectedStatus,
        setSelectedStatus,
        handleDateSelect,
        isCalendarVisible,
        setCalendarVisible,
        setSelectedDate,
        resetFilters,
        toggleExpand,
        isExpanded,
        handleDownloadReceipt,
        handleDownloadPeriodReceipt,
        handleDownloadAllReceipts,
        isDownloadingId,
        refresh
    } = useHistoryViewModel();
    const { colors } = useTheme();

    const renderItem = ({ item: group }: { item: any }) => {
        const rejectedHistoryCount = group.items.filter((i: any) => i.status === 'Ditolak').length;
        const nonRejectedHistoryCount = group.items.length - rejectedHistoryCount;

        return (
            <View style={s.periodCard}>
                <TouchableOpacity
                    style={s.periodHeader}
                    onPress={() => toggleExpand(group.id)}
                    activeOpacity={0.7}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={s.periodMonth}>{group.periodName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                            {nonRejectedHistoryCount > 0 && (
                                <Text style={[s.periodStatus, { color: colors.status.lunas.text, marginTop: 0 }]}>Terbayar {nonRejectedHistoryCount} iuran</Text>
                            )}
                            {rejectedHistoryCount > 0 && (
                                <Text style={[s.periodStatus, { color: colors.status.ditolak.text, marginTop: 0, fontWeight: '500' }]}>
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
                            {group.items.map((item: any, idx: number) => (
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
                                            <Text style={s.historyItemSub}>
                                                {item.status === 'Lunas' ? `${item.date} • ${item.methodName}` : item.status === 'Ditolak' ? 'Pembayaran Ditolak Admin' : 'Menunggu konfirmasi'}
                                            </Text>

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
                                                                periodDate: group.periodName, // usually YYYY-MM-01, but UI doesn't strictly need it to be exact for single repay
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
                                            <Text style={[s.itemAmountText, item.status !== 'Lunas' && { color: item.status === 'Ditolak' ? colors.status.ditolak.text : colors.status.pending.text }]}>{item.amountFormatted}</Text>

                                            {item.status === 'Lunas' && (
                                                <TouchableOpacity
                                                    onPress={() => handleDownloadReceipt(item, group.periodName)}
                                                    disabled={isDownloadingId === item.id}
                                                    style={{ marginTop: 4 }}
                                                >
                                                    {isDownloadingId === item.id ? (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 }}>
                                                            <ActivityIndicator size="small" color="#1B5E20" />
                                                        </View>
                                                    ) : (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 }}>
                                                            <Text style={{ color: '#1B5E20', fontSize: 11, fontWeight: 'bold' }}>Kuitansi</Text>
                                                            <Ionicons name="download-outline" size={14} color="#1B5E20" />
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                    {idx < group.items.length - 1 && <View style={s.divider} />}
                                </View>
                            ))}

                            {/* Download Period Button */}
                            {group.items.some((i: any) => i.status === 'Lunas') && (
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: '#E8F5E9', paddingVertical: 10, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: '#C8E6C9'
                                    }}
                                    onPress={() => handleDownloadPeriodReceipt(group)}
                                    disabled={isDownloadingId === group.id}
                                >
                                    {isDownloadingId === group.id ? (
                                        <ActivityIndicator size="small" color="#1B5E20" />
                                    ) : (
                                        <>
                                            <Ionicons name="download-outline" size={16} color="#1B5E20" style={{ marginRight: 6 }} />
                                            <Text style={{ color: '#1B5E20', fontSize: 13, fontWeight: 'bold' }}>Unduh Kuitansi Bulan Ini</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={s.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1B5E20" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Riwayat Pembayaran</Text>
            </View>

            {/* Filters */}
            <View style={s.filterContainer}>
                {/* Search and Reset */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={[s.searchContainer, { flex: 1 }]}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            style={s.searchInput}
                            placeholder="Cari bulan..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#888"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#888" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#FFF',
                            borderRadius: 12,
                            width: 44,
                            height: 44,
                            borderWidth: 1,
                            borderColor: '#A5D6A7'
                        }}
                        onPress={resetFilters}
                    >
                        <Ionicons name="refresh" size={20} color="#1B5E20" />
                    </TouchableOpacity>
                </View>

                <View style={s.filterRow}>
                    {/* Calendar Filter Button */}
                    <TouchableOpacity
                        style={[
                            s.filterButton,
                            { flexDirection: 'row', alignItems: 'center' },
                            selectedDate && s.filterButtonActive
                        ]}
                        onPress={handleDateSelect}
                    >
                        <Ionicons name="calendar-outline" size={16} color={selectedDate ? "#FFF" : "#1B5E20"} style={{ marginRight: 6 }} />
                        <Text style={[s.filterText, selectedDate && s.filterTextActive]}>
                            {selectedDate ? formatDateSafe(selectedDate) : 'Pilih Periode'}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1, overflow: 'hidden' }}>
                        {/* Status Filter Row */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 40 }}>
                            {statuses.map(status => (
                                <TouchableOpacity
                                    key={status}
                                    style={[s.filterButton, selectedStatus === status && s.filterButtonActive]}
                                    onPress={() => setSelectedStatus(status as any)}
                                >
                                    <Text style={[s.filterText, selectedStatus === status && s.filterTextActive]}>
                                        {status === 'All' ? 'Semua' : status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={filteredHistory}
                ListHeaderComponent={
                    filteredHistory.length > 0 && filteredHistory.some((g: any) => g.items.some((i: any) => i.status === 'Lunas')) ? (
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#1B5E20', paddingVertical: 14, borderRadius: 12, marginBottom: 16, marginHorizontal: 20
                            }}
                            onPress={handleDownloadAllReceipts}
                            disabled={isDownloadingId === 'all'}
                        >
                            {isDownloadingId === 'all' ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="download" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>Unduh Semua Kuitansi Riwayat</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : null
                }
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={s.listContainer}
                ListEmptyComponent={
                    <View style={s.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color="#CCC" />
                        <Text style={s.emptyText}>Tidak ada riwayat ditemukan</Text>
                    </View>
                }
            />

            {/* Calendar Modal */}
            <FilterCalendar
                visible={isCalendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDate={(date) => {
                    setSelectedDate(date);
                    // Optional: setCalendarVisible(false) is handled inside FilterCalendar's onSelect logic usually, 
                    // but here we might want to ensure it closes.
                    // The component calls onSelectDate then onClose.
                }}
                selectedDate={selectedDate}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7F5' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
        paddingTop: 50, paddingBottom: 15, backgroundColor: '#E8F5E9'
    },
    backButton: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20' },
    filterContainer: { paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#E8F5E9' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
        borderRadius: 12, paddingHorizontal: 12, height: 44,
        borderWidth: 1, borderColor: '#A5D6A7'
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1B5E20', height: '100%' },
    filterRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    filterButton: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#A5D6A7', backgroundColor: '#FFF'
    },
    filterButtonActive: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
    filterText: { fontSize: 12, color: '#1B5E20', fontWeight: '600' },
    filterTextActive: { color: '#FFF' },
    listContainer: { padding: 16, paddingBottom: 100 },
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#888', marginTop: 10 },

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
    expandedBox: { padding: 12, paddingTop: 0 },
    itemsContainer: {
        backgroundColor: '#F9F9F9', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12,
        marginTop: 4, borderWidth: 1, borderColor: '#EEE'
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    historyItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    historyItemSub: { fontSize: 11, color: '#666', marginTop: 2 },
    itemName: { flex: 1, fontSize: 13, color: '#333' },
    itemAmountText: { fontSize: 13, fontWeight: 'bold', color: '#1B5E20' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 4 },
});
