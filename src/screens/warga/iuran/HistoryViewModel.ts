import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchMyPayments, PaymentRecord } from '../../../services/iuranService';
import { formatDateSafe } from '../../../utils/dateUtils';
import { generateAndShareReceipt } from '../../../services/receiptService';

export interface HistoryItem {
    id: string;
    feeName: string;
    amount: number;
    amountFormatted: string;
    status: string;
    date: string;
    methodName: string;
    periodRaw: string; // Internal use
}

export interface GroupedHistory {
    id: string; // YYYY-MM
    periodName: string;
    totalAmount: number;
    items: HistoryItem[];
    isExpanded: boolean;
}

export const useHistoryViewModel = () => {
    const { user } = useAuth();
    const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<'All' | 'Lunas' | 'Terlambat' | 'Pending'>('All');
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);

    // Load real payment data
    useEffect(() => {
        loadHistory();
    }, [user?.id]);

    const loadHistory = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const payments = await fetchMyPayments();
            const items: HistoryItem[] = payments.map(p => {
                return {
                    id: p.id,
                    feeName: p.fees?.name || 'Iuran',
                    amount: p.amount,
                    amountFormatted: `Rp ${p.amount.toLocaleString('id-ID')}`,
                    status: p.status === 'paid' ? 'Lunas' : (p.status === 'overdue' ? 'Terlambat' : 'Pending'),
                    date: p.paid_at
                        ? formatDateSafe(p.paid_at)
                        : '-',
                    methodName: p.payment_method || '-',
                    periodRaw: p.period, // keep original for grouping
                } as any;
            });
            setAllHistory(items as any);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Filter
    const filteredHistory = useMemo(() => {
        const filtered = allHistory.filter((item: any) => {
            const dateObj = new Date(item.periodRaw);
            const periodStr = dateObj.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
            
            const matchesSearch = periodStr.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDate = selectedDate ? (() => {
                const months = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
                const periodLower = periodStr.toLowerCase();
                const selMonthName = months[selectedDate.getMonth()];
                const selYear = selectedDate.getFullYear().toString();
                return periodLower.includes(selMonthName) && periodLower.includes(selYear);
            })() : true;

            const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

            return matchesSearch && matchesDate && matchesStatus;
        });

        // Grouping
        const historyMap = new Map<string, GroupedHistory>();
        filtered.forEach((item: any) => {
            const dateObj = new Date(item.periodRaw);
            const periodId = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
            const periodName = dateObj.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

            if (!historyMap.has(periodId)) {
                historyMap.set(periodId, {
                    id: periodId,
                    periodName,
                    totalAmount: 0,
                    items: [],
                    isExpanded: expandedIds.has(periodId)
                });
            }
            const group = historyMap.get(periodId)!;
            group.items.push(item);
            group.totalAmount += item.amount;
        });

        return Array.from(historyMap.values()).sort((a, b) => b.id.localeCompare(a.id));
    }, [searchQuery, selectedDate, selectedStatus, allHistory, expandedIds]);

    const statuses = ['All', 'Lunas', 'Pending', 'Terlambat'];

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const isExpanded = (id: string) => expandedIds.has(id);

    const handleDateSelect = () => setCalendarVisible(true);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedDate(null);
        setSelectedStatus('All');
    };

    const handleDownloadReceipt = async (item: HistoryItem, periodName: string) => {
        setIsDownloadingId(item.id);
        try {
            await generateAndShareReceipt({
                paymentId: item.id,
                userName: user?.user_metadata?.full_name || 'Warga',
                amount: item.amount,
                period: periodName,
                paymentMethod: item.methodName,
                paidAt: item.date,
                complexName: 'Manajemen Iuran Perumahan',
                items: [{ name: item.feeName, amount: item.amount }]
            });
            // Show success via alert (assuming parent or internal handles it, but since we don't have robust alert here, we can just let it finish successfully as sharing handles the UI)
        } catch (error: any) {
            console.error('Download Receipt Error:', error);
            alert('Gagal mengunduh kuitansi: ' + error.message);
        } finally {
            setIsDownloadingId(null);
        }
    };

    const handleDownloadPeriodReceipt = async (group: GroupedHistory) => {
        setIsDownloadingId(group.id);
        try {
            const paidItems = group.items.filter(i => i.status === 'Lunas');
            if (paidItems.length === 0) return;

            const itemsList = paidItems.map(i => ({ name: i.feeName, amount: i.amount }));
            
            await generateAndShareReceipt({
                paymentId: group.id + '-' + new Date().getTime(),
                userName: user?.user_metadata?.full_name || 'Warga',
                amount: paidItems.reduce((acc, curr) => acc + curr.amount, 0),
                period: group.periodName,
                paymentMethod: 'Gabungan Pembayaran Bulan ' + group.periodName,
                paidAt: paidItems[0].date, // use the first paid date as reference
                complexName: 'Manajemen Iuran Perumahan',
                items: itemsList
            });
        } catch (error: any) {
             console.error('Download Period Receipt Error:', error);
             alert('Gagal mengunduh kuitansi bulanan: ' + error.message);
        } finally {
            setIsDownloadingId(null);
        }
    };

    const handleDownloadAllReceipts = async () => {
        setIsDownloadingId('all');
        try {
            const allPaidItems = allHistory.filter(i => i.status === 'Lunas');
            if (allPaidItems.length === 0) return;

            const allItemsList = allPaidItems.map(i => ({ name: `${i.feeName} (${i.periodRaw})`, amount: i.amount }));

            await generateAndShareReceipt({
                paymentId: 'ALL-HISTORY-' + new Date().getTime(),
                userName: user?.user_metadata?.full_name || 'Warga',
                amount: allPaidItems.reduce((acc, curr) => acc + curr.amount, 0),
                period: 'Semua Riwayat (Total)',
                paymentMethod: 'Gabungan Seluruh Histori',
                paidAt: formatDateSafe(new Date().toISOString()), 
                complexName: 'Manajemen Iuran Perumahan',
                items: allItemsList
            });
        } catch (error: any) {
             console.error('Download All Receipt Error:', error);
             alert('Gagal mengunduh kuitansi keseluruhan: ' + error.message);
        } finally {
            setIsDownloadingId(null);
        }
    }

    return {
        searchQuery, setSearchQuery,
        selectedDate, setSelectedDate,
        selectedStatus, setSelectedStatus,
        filteredHistory,
        statuses,
        handleDateSelect,
        isCalendarVisible, setCalendarVisible,
        resetFilters,
        toggleExpand,
        isExpanded,
        handleDownloadReceipt,
        handleDownloadPeriodReceipt,
        handleDownloadAllReceipts,
        isDownloadingId,
        isLoading,
        refresh: loadHistory,
    };
};
