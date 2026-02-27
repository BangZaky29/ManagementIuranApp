import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, StatusBar, ScrollView, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useHistoryViewModel } from './HistoryViewModel';
import { FilterCalendar } from '../../../components/FilterCalendar';

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
        isDownloadingId,
        isLoading,
        refresh
    } = useHistoryViewModel();

    const renderItem = ({ item: group }: { item: any }) => (
        <View style={s.periodCard}>
            <TouchableOpacity
                style={s.periodHeader}
                onPress={() => toggleExpand(group.id)}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1 }}>
                    <Text style={s.periodMonth}>{group.periodName}</Text>
                    <Text style={[s.periodStatus, { color: '#4CAF50' }]}>Terbayar {group.items.length} iuran</Text>
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
                                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={{ marginRight: 10 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.itemName}>{item.feeName}</Text>
                                        <Text style={s.historyItemSub}>{item.date} • {item.methodName}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={s.itemAmountText}>{item.amountFormatted}</Text>
                                        <TouchableOpacity 
                                            onPress={() => handleDownloadReceipt(item, group.periodName)}
                                            disabled={isDownloadingId === item.id}
                                            style={{ marginTop: 4 }}
                                        >
                                            {isDownloadingId === item.id ? (
                                                <ActivityIndicator size="small" color="#1B5E20" />
                                            ) : (
                                                <Text style={{ color: '#1B5E20', fontSize: 11, fontWeight: 'bold' }}>Kuitansi</Text>
                                            )}
                                        </TouchableOpacity>
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
                            {selectedDate ? selectedDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'Pilih Periode'}
                        </Text>
                    </TouchableOpacity>

                    <View style={[s.filterRow, { marginTop: 0 }]}>
                        {/* Status Filter Row */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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
        borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
        borderWidth: 1, borderColor: '#A5D6A7'
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1B5E20' },
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
