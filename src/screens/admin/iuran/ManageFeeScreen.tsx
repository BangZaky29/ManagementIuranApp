import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, StyleSheet, TextInput, Modal,
    RefreshControl, Platform, Image, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';
import {
    AdminFee,
    FeePaymentStat,
    PayerInfo,
    MonthlyRevenue,
    fetchAdminFees,
    createFee,
    updateFee,
    deleteFee,
    toggleFeeActive,
    fetchFeePaymentStats,
    fetchFeePayerList,
    fetchMonthlyRevenueSummary,
    fetchOverallRevenueSummary,
    OverallRevenue,
} from '../../../services/feeService';

// ====== TYPES ======

interface FormData {
    name: string;
    amount: string;
    due_date_day: string;
    active_from: string;
    active_to: string;
}

type TabKey = 'overview' | 'manage';

const EMPTY_FORM: FormData = { name: '', amount: '', due_date_day: '10', active_from: '', active_to: '' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const getCurrentPeriod = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const formatPeriodLabel = (period: string) => {
    const [y, m] = period.split('-');
    return `${MONTHS[parseInt(m) - 1]} ${y}`;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

// ====== COMPONENT ======

export default function ManageFeeScreen() {
    const router = useRouter();
    const { profile } = useAuth();

    // Tab
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    // Period (month selector)
    const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod());

    // Data
    const [fees, setFees] = useState<AdminFee[]>([]);
    const [feeStats, setFeeStats] = useState<FeePaymentStat[]>([]);
    const [revenue, setRevenue] = useState<MonthlyRevenue | null>(null);
    const [overallRevenue, setOverallRevenue] = useState<OverallRevenue | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Payer modal
    const [payerModalVisible, setPayerModalVisible] = useState(false);
    const [payerFee, setPayerFee] = useState<AdminFee | null>(null);
    const [payerList, setPayerList] = useState<PayerInfo[]>([]);
    const [payerFilter, setPayerFilter] = useState<'all' | 'paid' | 'pending' | 'unpaid'>('all');
    const [payerLoading, setPayerLoading] = useState(false);

    // CRUD
    const [isFormVisible, setFormVisible] = useState(false);
    const [editingFee, setEditingFee] = useState<AdminFee | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    // Date Picker
    const [datePickerVisible, setDatePickerVisible] = useState<'from' | 'to' | 'nav' | null>(null);
    const [pickerTempYear, setPickerTempYear] = useState(new Date().getFullYear());

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[],
    });

    // ====== DATA LOADING ======

    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [feesData, statsData, revenueData, overallData] = await Promise.all([
                fetchAdminFees(),
                fetchFeePaymentStats(currentPeriod),
                fetchMonthlyRevenueSummary(currentPeriod),
                fetchOverallRevenueSummary(),
            ]);
            setFees(feesData);
            setFeeStats(statsData);
            setRevenue(revenueData);
            setOverallRevenue(overallData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPeriod]);

    useEffect(() => { loadAllData(); }, [loadAllData]);

    // ====== MONTH NAVIGATION ======

    const shiftMonth = (dir: number) => {
        if (dir < 0 && !canGoBack) return;
        if (dir > 0 && !canGoForward) return;
        const [y, m] = currentPeriod.split('-').map(Number);
        const d = new Date(y, m - 1 + dir, 1);
        setCurrentPeriod(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
    };

    // ====== PAYER MODAL ======

    const openPayerList = async (fee: AdminFee) => {
        setPayerFee(fee);
        setPayerFilter('all');
        setPayerModalVisible(true);
        setPayerLoading(true);
        try {
            const list = await fetchFeePayerList(fee.id, currentPeriod, 'all');
            setPayerList(list);
        } catch (e) {
            console.error(e);
        } finally {
            setPayerLoading(false);
        }
    };

    const applyPayerFilter = async (filter: 'all' | 'paid' | 'pending' | 'unpaid') => {
        if (!payerFee) return;
        setPayerFilter(filter);
        setPayerLoading(true);
        try {
            const list = await fetchFeePayerList(payerFee.id, currentPeriod, filter);
            setPayerList(list);
        } catch (e) {
            console.error(e);
        } finally {
            setPayerLoading(false);
        }
    };

    // ====== CRUD HANDLERS ======

    const openAddForm = () => { setEditingFee(null); setForm(EMPTY_FORM); setFormVisible(true); };

    const openEditForm = (fee: AdminFee) => {
        setEditingFee(fee);
        setForm({
            name: fee.name,
            amount: fee.amount.toString(),
            due_date_day: fee.due_date_day.toString(),
            active_from: fee.active_from || '',
            active_to: fee.active_to || ''
        });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !Number(form.amount) || Number(form.amount) <= 0) {
            setAlertConfig({ title: 'Perhatian', message: 'Nama dan jumlah iuran wajib diisi.', type: 'warning', buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
            setAlertVisible(true);
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave = {
                name: form.name.trim(),
                amount: Number(form.amount),
                due_date_day: Number(form.due_date_day) || 10,
                active_from: form.active_from ? form.active_from : null,
                active_to: form.active_to ? form.active_to : null,
            };

            if (editingFee) {
                await updateFee(editingFee.id, dataToSave);
            } else {
                await createFee({ ...dataToSave, housing_complex_id: profile?.housing_complex_id! });
            }
            setFormVisible(false);
            loadAllData();
        } catch (error: any) {
            setAlertConfig({ title: 'Gagal', message: error?.userMessage || 'Gagal menyimpan.', type: 'error', buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
            setAlertVisible(true);
        } finally { setIsSaving(false); }
    };

    const handleToggle = async (fee: AdminFee) => { await toggleFeeActive(fee.id, fee.is_active); loadAllData(); };

    // ====== RENDER HELPERS ======

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return '#2E7D32';
            case 'pending': return '#F57F17';
            case 'unpaid': return '#C62828';
            case 'rejected': return '#D32F2F';
            default: return '#999';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Lunas';
            case 'pending': return 'Menunggu';
            case 'unpaid': return 'Belum Bayar';
            case 'rejected': return 'Ditolak';
            default: return status;
        }
    };

    const activeFees = fees.filter(f => f.is_active);
    const inactiveFees = fees.filter(f => !f.is_active);

    // Calculate Boundaries for Month Selector
    let minPeriodStr: string | null = null;
    let maxPeriodStr: string | null = null;

    if (fees.length > 0) {
        // If there's ANY fee without active_from, we can go back infinitely
        if (!fees.some(f => !f.active_from)) {
            // Otherwise, find the earliest active_from
            minPeriodStr = fees.reduce((min, f) => (f.active_from! < min ? f.active_from! : min), fees[0].active_from!);
        }

        // If there's ANY fee without active_to, we can go forward infinitely
        if (!fees.some(f => !f.active_to)) {
            // Otherwise, find the latest active_to
            maxPeriodStr = fees.reduce((max, f) => (f.active_to! > max ? f.active_to! : max), fees[0].active_to!);
        }
    }

    const canGoBack = !minPeriodStr || currentPeriod.substring(0, 7) > minPeriodStr.substring(0, 7);
    const canGoForward = !maxPeriodStr || currentPeriod.substring(0, 7) < maxPeriodStr.substring(0, 7);

    const isMonthActive = (y: number, mIdx: number) => {
        const periodStr = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
        const isBeforeStart = minPeriodStr && periodStr < minPeriodStr.substring(0, 7);
        const isAfterEnd = maxPeriodStr && periodStr > maxPeriodStr.substring(0, 7);
        return !isBeforeStart && !isAfterEnd;
    };

    // ====== MAIN RENDER ======

    return (
        <SafeAreaView style={s.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1B5E20" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Kelola Iuran</Text>
                <TouchableOpacity onPress={openAddForm} style={s.addBtn}>
                    <Ionicons name="add-circle" size={28} color="#1B5E20" />
                </TouchableOpacity>
            </View>

            {/* Tab Switcher */}
            <View style={s.tabRow}>
                <TouchableOpacity style={[s.tab, activeTab === 'overview' && s.tabActive]} onPress={() => setActiveTab('overview')}>
                    <Ionicons name="analytics-outline" size={16} color={activeTab === 'overview' ? '#FFF' : '#1B5E20'} />
                    <Text style={[s.tabText, activeTab === 'overview' && s.tabTextActive]}>Ringkasan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.tab, activeTab === 'manage' && s.tabActive]} onPress={() => setActiveTab('manage')}>
                    <Ionicons name="settings-outline" size={16} color={activeTab === 'manage' ? '#FFF' : '#1B5E20'} />
                    <Text style={[s.tabText, activeTab === 'manage' && s.tabTextActive]}>Kelola</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={s.center}><ActivityIndicator size="large" color="#1B5E20" /></View>
            ) : (
                <ScrollView
                    contentContainerStyle={s.content}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={loadAllData} colors={['#1B5E20']} />}
                >
                    {activeTab === 'overview' ? renderOverviewTab() : renderManageTab()}
                </ScrollView>
            )}

            {/* Payer Modal */}
            {renderPayerModal()}

            {/* CRUD Modal */}
            {renderFormModal()}

            {/* Date Picker Modal */}
            {renderDatePickerModal()}

            <CustomAlertModal visible={alertVisible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} buttons={alertConfig.buttons} onClose={() => setAlertVisible(false)} />
        </SafeAreaView>
    );

    // ====== OVERVIEW TAB ======

    function renderOverviewTab() {
        return (
            <>
                {/* Month Selector */}
                <View style={s.monthSelector}>
                    <View style={s.monthArrow}>
                        {canGoBack && (
                            <TouchableOpacity onPress={() => shiftMonth(-1)} style={s.monthArrowBtn}>
                                <Ionicons name="chevron-back" size={20} color="#1B5E20" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={s.monthLabel}
                        onPress={() => {
                            setPickerTempYear(parseInt(currentPeriod.split('-')[0]));
                            setDatePickerVisible('nav');
                        }}
                    >
                        <Ionicons name="calendar-outline" size={16} color="#1B5E20" />
                        <Text style={s.monthText}>{formatPeriodLabel(currentPeriod)}</Text>
                    </TouchableOpacity>
                    <View style={s.monthArrow}>
                        {canGoForward && (
                            <TouchableOpacity onPress={() => shiftMonth(1)} style={s.monthArrowBtn}>
                                <Ionicons name="chevron-forward" size={20} color="#1B5E20" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Overall Revenue Card */}
                {overallRevenue && (
                    <View style={[s.revenueCard, { backgroundColor: '#E8F5E9', borderLeftWidth: 4, borderLeftColor: '#1B5E20', marginBottom: 16 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={[s.revenueTitle, { color: '#2E7D32', fontWeight: 'bold' }]}>Total Pemasukan Keseluruhan</Text>
                            <View style={{ backgroundColor: '#1B5E20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>AKUMULASI</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                            <Text style={[s.revenueAmount, { color: '#1B5E20' }]}>{formatCurrency(overallRevenue.totalCollected)}</Text>
                            <Text style={{ fontSize: 16, color: '#666', fontWeight: '600' }}>/</Text>
                            <Text style={{ fontSize: 16, color: '#666', fontWeight: '600' }}>{formatCurrency(overallRevenue.totalExpected)}</Text>
                        </View>

                        <View style={[s.revenueMeta, { borderTopColor: 'rgba(27,94,32,0.1)', marginTop: 10 }]}>
                            <Text style={[s.revenueMetaText, { color: '#558B2F' }]}>
                                💸 Piutang Tertunda: {formatCurrency(overallRevenue.totalPending)}
                            </Text>
                            <Text style={[s.revenueMetaText, { color: '#1B5E20', marginTop: 4, fontWeight: '700' }]}>
                                🎯 Total yang akan didapatkan: {formatCurrency(overallRevenue.totalExpected)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Revenue Summary Card */}
                {revenue && (
                    <View style={s.revenueCard}>
                        <Text style={s.revenueTitle}>Total Pemasukan Bulan ini</Text>
                        <Text style={s.revenueAmount}>{formatCurrency(revenue.totalCollected)}</Text>
                        <View style={s.revenueBar}>
                            <View style={[s.revenueBarFill, { width: `${Math.min(revenue.collectionRate, 100)}%` }]} />
                        </View>
                        <View style={s.revenueDetails}>
                            <View style={s.revDetailItem}>
                                <View style={[s.revDot, { backgroundColor: '#4CAF50' }]} />
                                <Text style={s.revDetailLabel}>Terkumpul</Text>
                                <Text style={s.revDetailValue}>{revenue.collectionRate}%</Text>
                            </View>
                            <View style={s.revDetailItem}>
                                <View style={[s.revDot, { backgroundColor: '#FF9800' }]} />
                                <Text style={s.revDetailLabel}>Pending</Text>
                                <Text style={s.revDetailValue}>{formatCurrency(revenue.totalPending)}</Text>
                            </View>
                            <View style={s.revDetailItem}>
                                <View style={[s.revDot, { backgroundColor: '#EEE' }]} />
                                <Text style={s.revDetailLabel}>Target</Text>
                                <Text style={s.revDetailValue}>{formatCurrency(revenue.totalExpected)}</Text>
                            </View>
                        </View>
                        <View style={s.revenueMeta}>
                            <Text style={s.revenueMetaText}>👥 {revenue.paidWargaCount}/{revenue.totalWarga} warga sudah bayar</Text>
                        </View>
                    </View>
                )}

                {/* Per-Fee Stats */}
                <Text style={s.sectionTitle}>Rincian Per Iuran</Text>
                {feeStats.length === 0 ? (
                    <View style={s.emptyBox}>
                        <Ionicons name="receipt-outline" size={40} color="#CCC" />
                        <Text style={s.emptyText}>Belum ada iuran aktif</Text>
                    </View>
                ) : (
                    feeStats.map(stat => (
                        <TouchableOpacity key={stat.fee.id} style={s.statCard} onPress={() => openPayerList(stat.fee)} activeOpacity={0.7}>
                            <View style={s.statHeader}>
                                <View style={s.statIconBox}>
                                    <Ionicons name="receipt" size={20} color="#1B5E20" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.statName}>{stat.fee.name}</Text>
                                    <Text style={s.statAmount}>{formatCurrency(stat.fee.amount)}/warga</Text>
                                </View>
                                <View style={s.statRate}>
                                    <Text style={[s.statRateText, { color: stat.collectionRate >= 70 ? '#2E7D32' : stat.collectionRate >= 40 ? '#F57F17' : '#C62828' }]}>
                                        {stat.collectionRate}%
                                    </Text>
                                </View>
                            </View>

                            {/* Mini progress */}
                            <View style={s.miniBar}>
                                <View style={[s.miniBarPaid, { flex: stat.paidCount || 0.001 }]} />
                                <View style={[s.miniBarPending, { flex: stat.pendingCount || 0.001 }]} />
                                <View style={[s.miniBarUnpaid, { flex: stat.unpaidCount || 0.001 }]} />
                            </View>

                            <View style={s.statFooter}>
                                <View style={s.statFooterItem}>
                                    <View style={[s.footerDot, { backgroundColor: '#4CAF50' }]} />
                                    <Text style={s.footerLabel}>Lunas {stat.paidCount}</Text>
                                </View>
                                <View style={s.statFooterItem}>
                                    <View style={[s.footerDot, { backgroundColor: '#FF9800' }]} />
                                    <Text style={s.footerLabel}>Pending {stat.pendingCount}</Text>
                                </View>
                                <View style={s.statFooterItem}>
                                    <View style={[s.footerDot, { backgroundColor: '#E0E0E0' }]} />
                                    <Text style={s.footerLabel}>Belum {stat.unpaidCount}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#CCC" />
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </>
        );
    }

    // ====== MANAGE TAB ======

    function renderManageTab() {
        return (
            <>
                {fees.length === 0 ? (
                    <View style={s.emptyBox}>
                        <Ionicons name="receipt-outline" size={64} color="#CCC" />
                        <Text style={s.emptyTitle}>Belum Ada Iuran</Text>
                        <Text style={s.emptySubtext}>Buat iuran pertama, contoh: Iuran Bulanan, Sampah, Keamanan.</Text>
                        <CustomButton title="Tambah Iuran" onPress={openAddForm} style={{ marginTop: 16 }} />
                    </View>
                ) : (
                    <>
                        {activeFees.length > 0 && <Text style={s.sectionTitle}>Iuran Aktif ({activeFees.length})</Text>}
                        {activeFees.map(fee => renderFeeCard(fee))}
                        {inactiveFees.length > 0 && <Text style={[s.sectionTitle, { color: '#999', marginTop: 20 }]}>Nonaktif ({inactiveFees.length})</Text>}
                        {inactiveFees.map(fee => renderFeeCard(fee))}
                    </>
                )}
            </>
        );
    }

    function renderFeeCard(fee: AdminFee) {
        return (
            <View key={fee.id} style={[s.feeCard, !fee.is_active && { opacity: 0.55 }]}>
                <View style={s.feeHeader}>
                    <View style={s.feeIcon}><Ionicons name="receipt" size={20} color={fee.is_active ? '#1B5E20' : '#999'} /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.feeName}>{fee.name}</Text>
                        <Text style={s.feeAmount}>{formatCurrency(fee.amount)}</Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: fee.is_active ? '#E8F5E9' : '#F5F5F5' }]}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: fee.is_active ? '#2E7D32' : '#999' }}>{fee.is_active ? 'Aktif' : 'Nonaktif'}</Text>
                    </View>
                </View>
                <View style={s.feeDetails}>
                    <Ionicons name="calendar-outline" size={13} color="#888" />
                    <Text style={s.feeDetailText}>Jatuh tempo tgl {fee.due_date_day}/bulan</Text>
                </View>
                {(fee.active_from || fee.active_to) && (
                    <View style={[s.feeDetails, { marginTop: 4, paddingTop: 0, borderTopWidth: 0 }]}>
                        <Ionicons name="time-outline" size={13} color="#1B5E20" />
                        <Text style={[s.feeDetailText, { color: '#1B5E20' }]}>
                            Aktif: {fee.active_from ? formatPeriodLabel(fee.active_from) : 'Awal'}
                            {' - '}
                            {fee.active_to ? formatPeriodLabel(fee.active_to) : 'Seterusnya'}
                        </Text>
                    </View>
                )}
                <View style={s.feeActions}>
                    <TouchableOpacity style={s.actionBtn} onPress={() => handleToggle(fee)}>
                        <Ionicons name={fee.is_active ? 'pause-circle-outline' : 'play-circle-outline'} size={18} color="#1B5E20" />
                        <Text style={s.actionText}>{fee.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.actionBtn} onPress={() => openEditForm(fee)}>
                        <Ionicons name="create-outline" size={18} color="#1B5E20" />
                        <Text style={s.actionText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ====== PAYER MODAL ======

    function renderPayerModal() {
        return (
            <Modal visible={payerModalVisible} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={[s.modalSheet, { maxHeight: '90%' }]}>
                        {/* Header */}
                        <View style={s.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.modalTitle}>{payerFee?.name}</Text>
                                <Text style={s.modalSubtitle}>{formatPeriodLabel(currentPeriod)} • {formatCurrency(payerFee?.amount || 0)}/warga</Text>
                            </View>
                            <TouchableOpacity onPress={() => setPayerModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1B5E20" />
                            </TouchableOpacity>
                        </View>

                        {/* Filter Tabs */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
                            {(['all', 'paid', 'pending', 'unpaid'] as const).map(f => (
                                <TouchableOpacity key={f} style={[s.filterChip, payerFilter === f && s.filterChipActive]} onPress={() => applyPayerFilter(f)}>
                                    <Text style={[s.filterChipText, payerFilter === f && s.filterChipTextActive]}>
                                        {f === 'all' ? 'Semua' : getStatusLabel(f)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* List */}
                        {payerLoading ? (
                            <View style={s.center}><ActivityIndicator size="large" color="#1B5E20" /></View>
                        ) : payerList.length === 0 ? (
                            <View style={[s.emptyBox, { marginHorizontal: 20 }]}>
                                <Ionicons name="people-outline" size={40} color="#CCC" />
                                <Text style={s.emptyText}>Tidak ada data</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={payerList}
                                keyExtractor={item => item.userId}
                                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
                                renderItem={({ item }) => (
                                    <View style={s.payerCard}>
                                        {item.avatarUrl ? (
                                            <Image source={{ uri: item.avatarUrl }} style={s.payerAvatar} />
                                        ) : (
                                            <View style={[s.payerAvatar, s.payerAvatarPlaceholder]}>
                                                <Ionicons name="person" size={16} color="#FFF" />
                                            </View>
                                        )}
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={s.payerName} numberOfLines={1}>{item.fullName}</Text>
                                            {item.address && <Text style={s.payerAddress} numberOfLines={1}>{item.address}</Text>}
                                            {item.paymentMethod && <Text style={s.payerMethod}>via {item.paymentMethod}</Text>}
                                        </View>
                                        <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + '18' }]}>
                                            <Text style={[s.statusBadgeText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        );
    }

    // ====== CRUD FORM MODAL ======

    function renderFormModal() {
        return (
            <Modal visible={isFormVisible} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={s.modalSheet}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>{editingFee ? 'Edit Iuran' : 'Tambah Iuran Baru'}</Text>
                            <TouchableOpacity onPress={() => setFormVisible(false)}><Ionicons name="close" size={24} color="#1B5E20" /></TouchableOpacity>
                        </View>
                        <ScrollView style={{ padding: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
                            <Text style={s.formLabel}>Nama Iuran *</Text>
                            <TextInput style={s.input} value={form.name} onChangeText={t => setForm({ ...form, name: t })} placeholder="Iuran Bulanan, Sampah, Keamanan" placeholderTextColor="#999" />
                            <Text style={s.formLabel}>Jumlah (Rp) *</Text>
                            <TextInput style={s.input} value={form.amount} onChangeText={t => setForm({ ...form, amount: t.replace(/[^0-9]/g, '') })} placeholder="100000" placeholderTextColor="#999" keyboardType="numeric" />
                            {form.amount && Number(form.amount) > 0 && <Text style={s.preview}>{formatCurrency(Number(form.amount))}</Text>}
                            <Text style={s.formLabel}>Jatuh Tempo (tanggal)</Text>
                            <TextInput style={s.input} value={form.due_date_day} onChangeText={t => { const n = t.replace(/[^0-9]/g, ''); if (Number(n) <= 31) setForm({ ...form, due_date_day: n }); }} placeholder="10" placeholderTextColor="#999" keyboardType="numeric" />
                            <Text style={s.helper}>Warga melihat jatuh tempo pada tanggal ini setiap bulan.</Text>

                            <Text style={s.formLabel}>Mulai Berlaku (Bulan/Tahun) Opsional</Text>
                            <TouchableOpacity
                                style={s.inputBtn}
                                onPress={() => { setPickerTempYear(form.active_from ? parseInt(form.active_from.split('-')[0]) : new Date().getFullYear()); setDatePickerVisible('from'); }}
                            >
                                <Text style={form.active_from ? s.inputText : s.inputPlaceholder}>
                                    {form.active_from ? formatPeriodLabel(form.active_from) : 'Pilih... (Abaikan jika sejak awal)'}
                                </Text>
                                {form.active_from ? (
                                    <TouchableOpacity onPress={() => setForm({ ...form, active_from: '' })} style={{ padding: 4 }}>
                                        <Ionicons name="close-circle" size={18} color="#999" />
                                    </TouchableOpacity>
                                ) : (
                                    <Ionicons name="calendar-outline" size={18} color="#999" />
                                )}
                            </TouchableOpacity>

                            <Text style={s.formLabel}>Berakhir Pada (Bulan/Tahun) Opsional</Text>
                            <TouchableOpacity
                                style={s.inputBtn}
                                onPress={() => { setPickerTempYear(form.active_to ? parseInt(form.active_to.split('-')[0]) : new Date().getFullYear()); setDatePickerVisible('to'); }}
                            >
                                <Text style={form.active_to ? s.inputText : s.inputPlaceholder}>
                                    {form.active_to ? formatPeriodLabel(form.active_to) : 'Pilih... (Abaikan jika seterusnya)'}
                                </Text>
                                {form.active_to ? (
                                    <TouchableOpacity onPress={() => setForm({ ...form, active_to: '' })} style={{ padding: 4 }}>
                                        <Ionicons name="close-circle" size={18} color="#999" />
                                    </TouchableOpacity>
                                ) : (
                                    <Ionicons name="calendar-outline" size={18} color="#999" />
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                        <View style={s.modalFooter}>
                            <CustomButton title="Batal" onPress={() => setFormVisible(false)} variant="outline" style={{ flex: 1 }} />
                            <CustomButton title={editingFee ? 'Simpan' : 'Tambah'} onPress={handleSave} loading={isSaving} style={{ flex: 1, marginLeft: 10 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    // ====== DATE PICKER MODAL ======

    function renderDatePickerModal() {
        const handleSelectMonth = (monthIdx: number) => {
            if (datePickerVisible === 'from') {
                const val = `${pickerTempYear}-${String(monthIdx + 1).padStart(2, '0')}-01`;
                setForm({ ...form, active_from: val });
            } else if (datePickerVisible === 'to') {
                // Set to last day of month
                const lastDay = new Date(pickerTempYear, monthIdx + 1, 0).getDate();
                const val = `${pickerTempYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                setForm({ ...form, active_to: val });
            } else if (datePickerVisible === 'nav') {
                if (!isMonthActive(pickerTempYear, monthIdx)) return;
                const val = `${pickerTempYear}-${String(monthIdx + 1).padStart(2, '0')}-01`;
                setCurrentPeriod(val);
            }
            setDatePickerVisible(null);
        };

        const currentSelected = datePickerVisible === 'from' ? form.active_from : datePickerVisible === 'to' ? form.active_to : '';
        const currentM = currentSelected ? parseInt(currentSelected.split('-')[1]) - 1 : -1;
        const currentY = currentSelected ? parseInt(currentSelected.split('-')[0]) : -1;

        return (
            <Modal visible={!!datePickerVisible} transparent animationType="fade">
                <View style={[s.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={s.datePickerContainer}>
                        <View style={s.datePickerHeader}>
                            <TouchableOpacity onPress={() => setPickerTempYear(y => y - 1)} style={{ padding: 10 }}>
                                <Ionicons name="chevron-back" size={24} color="#1B5E20" />
                            </TouchableOpacity>
                            <Text style={s.datePickerYear}>{pickerTempYear}</Text>
                            <TouchableOpacity onPress={() => setPickerTempYear(y => y + 1)} style={{ padding: 10 }}>
                                <Ionicons name="chevron-forward" size={24} color="#1B5E20" />
                            </TouchableOpacity>
                        </View>
                        <View style={s.datePickerGrid}>
                            {MONTHS.map((m, idx) => {
                                const isSelected = currentM === idx && currentY === pickerTempYear;
                                const isActive = datePickerVisible === 'nav' ? isMonthActive(pickerTempYear, idx) : true;
                                return (
                                    <TouchableOpacity
                                        key={m}
                                        style={[
                                            s.monthBox,
                                            isSelected && s.monthBoxSelected,
                                            !isActive && s.monthBoxDisabled
                                        ]}
                                        onPress={() => handleSelectMonth(idx)}
                                        disabled={!isActive}
                                    >
                                        <Text style={[
                                            s.monthBoxText,
                                            isSelected && s.monthBoxTextSelected,
                                            !isActive && { color: '#CCC' }
                                        ]}>{m}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={{ padding: 16 }}>
                            <CustomButton title="Batal" onPress={() => setDatePickerVisible(null)} variant="outline" />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

// ====== STYLES ======

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7F5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 48 : 16, paddingBottom: 12, backgroundColor: '#FFF',
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20', flex: 1, marginLeft: 10 },
    addBtn: { padding: 5 },

    // Tabs
    tabRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FFF', gap: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F8E9' },
    tabActive: { backgroundColor: '#1B5E20' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#1B5E20' },
    tabTextActive: { color: '#FFF' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    content: { padding: 16, paddingBottom: 40 },

    // Month selector
    monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#FFF', borderRadius: 14, padding: 8, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 }, android: { elevation: 2 } }) },
    monthArrow: { width: 40, alignItems: 'center', justifyContent: 'center' },
    monthArrowBtn: { padding: 6 },
    monthLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    monthText: { fontSize: 16, fontWeight: '700', color: '#1B5E20' },

    // Revenue card
    revenueCard: { backgroundColor: '#1B5E20', borderRadius: 20, padding: 20, marginBottom: 20 },
    revenueTitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
    revenueAmount: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginTop: 4 },
    revenueBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginTop: 16 },
    revenueBarFill: { height: 8, backgroundColor: '#81C784', borderRadius: 4 },
    revenueDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
    revDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    revDot: { width: 8, height: 8, borderRadius: 4 },
    revDetailLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
    revDetailValue: { fontSize: 11, color: '#FFF', fontWeight: '600' },
    revenueMeta: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
    revenueMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

    // Sections
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10, marginTop: 4 },

    // Stat card
    statCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }) },
    statHeader: { flexDirection: 'row', alignItems: 'center' },
    statIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    statName: { fontSize: 15, fontWeight: '700', color: '#333' },
    statAmount: { fontSize: 12, color: '#888', marginTop: 1 },
    statRate: { backgroundColor: '#F1F8E9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    statRateText: { fontSize: 15, fontWeight: 'bold' },
    miniBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 12 },
    miniBarPaid: { backgroundColor: '#4CAF50' },
    miniBarPending: { backgroundColor: '#FF9800' },
    miniBarUnpaid: { backgroundColor: '#E0E0E0' },
    statFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
    statFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerDot: { width: 6, height: 6, borderRadius: 3 },
    footerLabel: { fontSize: 11, color: '#888' },

    // Empty
    emptyBox: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
    emptyText: { fontSize: 14, color: '#999', marginTop: 10 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 16 },
    emptySubtext: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8, lineHeight: 20 },

    // Fee card (manage tab)
    feeCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }) },
    feeHeader: { flexDirection: 'row', alignItems: 'center' },
    feeIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    feeName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    feeAmount: { fontSize: 14, fontWeight: '600', color: '#1B5E20', marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    feeDetails: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    feeDetailText: { fontSize: 12, color: '#888' },
    feeActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 14, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 12, fontWeight: '600', color: '#1B5E20' },

    // Payer modal
    filterRow: { maxHeight: 50, marginBottom: 10 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F8E9' },
    filterChipActive: { backgroundColor: '#1B5E20' },
    filterChipText: { fontSize: 13, fontWeight: '600', color: '#1B5E20' },
    filterChipTextActive: { color: '#FFF' },
    payerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 }, android: { elevation: 1 } }) },
    payerAvatar: { width: 40, height: 40, borderRadius: 20 },
    payerAvatarPlaceholder: { backgroundColor: '#1B5E20', alignItems: 'center', justifyContent: 'center' },
    payerName: { fontSize: 14, fontWeight: '600', color: '#333' },
    payerAddress: { fontSize: 11, color: '#888', marginTop: 2 },
    payerMethod: { fontSize: 11, color: '#1B5E20', marginTop: 2, fontWeight: '500' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusBadgeText: { fontSize: 11, fontWeight: '700' },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#F5F7F5', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },
    modalSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 10 },
    formLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#E0E0E0' },
    inputBtn: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E0E0E0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    inputText: { fontSize: 14, color: '#333', flex: 1 },
    inputPlaceholder: { fontSize: 14, color: '#999', flex: 1 },
    preview: { fontSize: 13, fontWeight: '600', color: '#1B5E20', marginTop: 6 },
    helper: { fontSize: 12, color: '#888', marginTop: 6, fontStyle: 'italic' },

    // Date Picker specific
    datePickerContainer: { width: '85%', backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }, android: { elevation: 6 } }) },
    datePickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: '#F1F8E9' },
    datePickerYear: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20' },
    datePickerGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, justifyContent: 'space-between' },
    monthBox: { width: '30%', paddingVertical: 14, alignItems: 'center', borderRadius: 12, marginBottom: 12, backgroundColor: '#F5F5F5' },
    monthBoxSelected: { backgroundColor: '#1B5E20' },
    monthBoxDisabled: { opacity: 0.4, backgroundColor: '#FAFAFA' },
    monthBoxText: { fontSize: 15, fontWeight: '600', color: '#555' },
    monthBoxTextSelected: { color: '#FFF' },
});
