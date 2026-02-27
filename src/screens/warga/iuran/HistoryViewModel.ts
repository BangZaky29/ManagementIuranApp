import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchMyPayments, PaymentRecord } from '../../../services/iuranService';
import { generateAndShareReceipt } from '../../../services/receiptService';

interface HistoryItem {
    id: string;
    period: string;
    periodRaw: string; // YYYY-MM-DD for filtering
    amount: string;
    amountNum: number;
    status: 'Lunas' | 'Terlambat' | 'Pending';
    date: string;
    feeName: string;
    methodName: string;
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
                const dateObj = new Date(p.period);
                const periodStr = dateObj.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
                const statusMap: Record<string, 'Lunas' | 'Terlambat' | 'Pending'> = {
                    paid: 'Lunas',
                    overdue: 'Terlambat',
                    pending: 'Pending',
                    rejected: 'Terlambat',
                };
                return {
                    id: p.id,
                    period: periodStr,
                    periodRaw: p.period,
                    amount: `Rp ${p.amount.toLocaleString('id-ID')}`,
                    amountNum: p.amount,
                    status: statusMap[p.status] || 'Pending',
                    date: p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-',
                    feeName: p.fees?.name || 'Iuran',
                    methodName: p.payment_method || '-',
                };
            });
            setAllHistory(items);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Filter
    const filteredHistory = useMemo(() => {
        return allHistory.filter(item => {
            const matchesSearch = item.period.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDate = selectedDate ? (() => {
                const months = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
                const periodLower = item.period.toLowerCase();
                const selMonthName = months[selectedDate.getMonth()];
                const selYear = selectedDate.getFullYear().toString();
                return periodLower.includes(selMonthName) && periodLower.includes(selYear);
            })() : true;

            const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [searchQuery, selectedDate, selectedStatus, allHistory]);

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

    const handleDownloadReceipt = async (item: HistoryItem) => {
        setIsDownloadingId(item.id);
        try {
            await generateAndShareReceipt({
                paymentId: item.id,
                userName: user?.user_metadata?.full_name || 'Warga',
                amount: item.amountNum,
                period: item.period,
                paymentMethod: item.methodName,
                paidAt: item.date,
                complexName: 'Manajemen Iuran Perumahan'
            });
            // Show success via alert (assuming parent or internal handles it, but since we don't have robust alert here, we can just let it finish successfully as sharing handles the UI)
        } catch (error: any) {
            console.error('Download Receipt Error:', error);
            alert('Gagal mengunduh kuitansi: ' + error.message);
        } finally {
            setIsDownloadingId(null);
        }
    };

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
        isDownloadingId,
        isLoading,
        refresh: loadHistory,
    };
};
