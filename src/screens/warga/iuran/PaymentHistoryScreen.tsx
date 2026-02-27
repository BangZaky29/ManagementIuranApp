import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, StatusBar, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useHistoryViewModel } from './HistoryViewModel';
import { HistoryStyles as styles } from './HistoryStyles';
import { FilterCalendar } from '../../../components/FilterCalendar';

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

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={() => toggleExpand(item.id)}
            >
                <View>
                    <Text style={styles.itemPeriod}>{item.feeName}</Text>
                    <Text style={[styles.itemDate, { fontSize: 12, color: '#555', marginTop: 1, marginBottom: 2 }]}>{item.period}</Text>
                    <Text style={styles.itemDate}>{item.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemAmount}>{item.amount}</Text>
                    <Text style={[styles.itemStatus, {
                        color: item.status === 'Lunas' ? Colors.success
                            : item.status === 'Pending' ? Colors.warning
                                : Colors.danger
                    }]}>
                        {item.status}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Expanded Details */}
            {isExpanded(item.id) && (
                <View style={styles.expandedContent}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Metode</Text>
                        <Text style={styles.detailValue}>{item.methodName}</Text>
                    </View>

                    {item.status === 'Lunas' && (
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={() => handleDownloadReceipt(item)}
                            disabled={isDownloadingId === item.id}
                        >
                            {isDownloadingId === item.id ? (
                                <ActivityIndicator size="small" color={Colors.green5} />
                            ) : (
                                <>
                                    <Ionicons name="download-outline" size={18} color={Colors.green5} />
                                    <Text style={styles.downloadText}>Unduh Kuitansi</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Riwayat Pembayaran</Text>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                {/* Search and Reset */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={[styles.searchContainer, { flex: 1 }]}>
                        <Ionicons name="search" size={20} color={Colors.green4} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Cari bulan..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={Colors.green4}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={Colors.green4} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: Colors.white,
                            borderRadius: 12,
                            width: 44,
                            height: 44,
                            borderWidth: 1,
                            borderColor: Colors.green2
                        }}
                        onPress={resetFilters}
                    >
                        <Ionicons name="refresh" size={20} color={Colors.green5} />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterRow}>
                    {/* Calendar Filter Button */}
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            { flexDirection: 'row', alignItems: 'center' },
                            selectedDate && styles.filterButtonActive // Apply active style!
                        ]}
                        onPress={handleDateSelect}
                    >
                        <Ionicons name="calendar-outline" size={16} color={selectedDate ? Colors.white : Colors.green5} style={{ marginRight: 6 }} />
                        <Text style={[styles.filterText, selectedDate && styles.filterTextActive]}>
                            {selectedDate ? selectedDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'Pilih Periode'}
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.filterRow, { marginTop: 8 }]}>
                        {/* Status Filter Row */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {statuses.map(status => (
                                <TouchableOpacity
                                    key={status}
                                    style={[styles.filterButton, selectedStatus === status && styles.filterButtonActive]}
                                    onPress={() => setSelectedStatus(status as any)}
                                >
                                    <Text style={[styles.filterText, selectedStatus === status && styles.filterTextActive]}>
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
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color={Colors.green3} />
                        <Text style={styles.emptyText}>Tidak ada riwayat ditemukan</Text>
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
