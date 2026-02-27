import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchMyPayments, fetchBillingPeriods, SmartBillSummary, BillingPeriod, PaymentRecord } from '../../../services/iuranService';
import { generateAndShareReceipt } from '../../../services/receiptService';

export interface PaymentHistoryItem {
    id: string;
    period: string;
    amount: string;
    status: 'Lunas' | 'Terlambat' | 'Pending';
    date: string;
    feeName: string;
    methodName: string;
    isExpanded?: boolean;
}

export const useIuranViewModel = () => {
    const router = useRouter();
    const { user } = useAuth();

    const [currentMonth, setCurrentMonth] = useState('');
    const [billSummary, setBillSummary] = useState<SmartBillSummary | null>(null);
    const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedPeriodIds, setExpandedPeriodIds] = useState<Set<string>>(new Set());
    const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());
    const [isDownloadingReceiptId, setIsDownloadingReceiptId] = useState<string | null>(null);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[],
    });
    const hideAlert = () => setAlertVisible(false);

    useEffect(() => {
        const date = new Date();
        setCurrentMonth(date.toLocaleString('id-ID', { month: 'long', year: 'numeric' }));
        loadData();
    }, [user?.id]);

    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const [bill, rawPayments] = await Promise.all([
                fetchBillingPeriods(user.id),
                fetchMyPayments(),
            ]);
            setBillSummary(bill);

            // Auto-select all overdue and unpaid current month periods
            const toSelect = new Set<string>();
            bill.periods.forEach(p => {
                if (p.isOverdue || (p.isCurrentMonth && (p.status === 'unpaid' || p.status === 'partial'))) {
                    p.items.forEach(i => {
                        if (i.status === 'unpaid') toSelect.add(`${p.id}|${i.fee.id}`);
                    });
                }
            });
            setSelectedItemKeys(toSelect);

            // Format history
            const formatted: PaymentHistoryItem[] = rawPayments.slice(0, 5).map(p => {
                const dateObj = new Date(p.period);
                const periodStr = dateObj.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
                return {
                    id: p.id,
                    period: periodStr,
                    amount: `Rp ${p.amount.toLocaleString('id-ID')}`,
                    status: p.status === 'paid' ? 'Lunas' : (p.status === 'overdue' ? 'Terlambat' : 'Pending'),
                    date: p.paid_at ? new Date(p.paid_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
                    feeName: p.fees?.name || 'Iuran',
                    methodName: p.payment_method || '-',
                    isExpanded: false,
                };
            });
            setHistory(formatted);
        } catch (error) {
            console.error('Failed to load iuran data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Selection
    const toggleExpandPeriod = (periodId: string) => {
        setExpandedPeriodIds(prev => {
            const next = new Set(prev);
            if (next.has(periodId)) next.delete(periodId);
            else next.add(periodId);
            return next;
        });
    };

    const togglePeriodSelection = (periodId: string) => {
        if (!billSummary) return;
        const period = billSummary.periods.find(p => p.id === periodId);
        if (!period) return;
        
        const unpaidItems = period.items.filter(i => i.status === 'unpaid');
        const allSelected = unpaidItems.every(i => selectedItemKeys.has(`${periodId}|${i.fee.id}`));
        
        setSelectedItemKeys(prev => {
            const next = new Set(prev);
            unpaidItems.forEach(i => {
                const key = `${periodId}|${i.fee.id}`;
                if (allSelected) next.delete(key);
                else next.add(key);
            });
            return next;
        });
    };

    const toggleItemSelection = (periodId: string, feeId: number) => {
        const key = `${periodId}|${feeId}`;
        setSelectedItemKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const selectAllUnpaid = () => {
        if (!billSummary) return;
        const ids = new Set<string>();
        billSummary.periods.forEach(p => {
            p.items.forEach(i => {
                if (i.status === 'unpaid') ids.add(`${p.id}|${i.fee.id}`);
            });
        });
        setSelectedItemKeys(ids);
    };

    const deselectAll = () => setSelectedItemKeys(new Set());

    const selectedPeriods = useMemo(() => {
        if (!billSummary) return [];
        return billSummary.periods.map(p => {
            const selectedItems = p.items.filter(i => selectedItemKeys.has(`${p.id}|${i.fee.id}`));
            if (selectedItems.length === 0) return null;
            return {
                ...p,
                items: selectedItems,
                totalAmount: selectedItems.reduce((sum, i) => sum + i.amount, 0)
            };
        }).filter(Boolean) as BillingPeriod[];
    }, [billSummary, selectedItemKeys]);

    const selectedTotal = selectedPeriods.reduce((sum, p) => sum + p.totalAmount, 0);
    const selectedCount = selectedItemKeys.size;

    // Pay
    const handlePay = () => {
        if (!billSummary) return;
        if (selectedPeriods.length === 0) {
            setAlertConfig({
                title: 'Pilih Bulan',
                message: 'Pilih minimal 1 bulan tunggakan/tagihan yang ingin dibayar.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: hideAlert }],
            });
            setAlertVisible(true);
            return;
        }
        router.push({
            pathname: '/iuran/payment-detail',
            params: {
                selectedPeriods: JSON.stringify(selectedPeriods),
                totalAmount: selectedTotal.toString(),
            },
        });
    };

    const toggleExpand = (id: string) => {
        setHistory(prev => prev.map(item =>
            item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
        ));
    };

    const handleDownloadReceipt = async (item: PaymentHistoryItem) => {
        setIsDownloadingReceiptId(item.id);
        try {
            await generateAndShareReceipt({
                paymentId: item.id,
                userName: user?.user_metadata?.full_name || 'Warga',
                amount: parseInt(item.amount.replace(/[^0-9]/g, '')) || 0, // strip formatting
                period: item.period,
                paymentMethod: item.methodName,
                paidAt: item.date,
                complexName: 'Manajemen Iuran Perumahan' // Can be dynamic if complex name is needed
            });
            setAlertConfig({
                title: 'Berhasil',
                message: 'Kuitansi berhasil diunduh.',
                type: 'success',
                buttons: [{ text: 'OK', onPress: hideAlert }],
            });
            setAlertVisible(true);
        } catch (error: any) {
            setAlertConfig({
                title: 'Gagal',
                message: error.message || 'Gagal mengunduh kuitansi',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }],
            });
            setAlertVisible(true);
        } finally {
            setIsDownloadingReceiptId(null);
        }
    };

    return {
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
        handleDownloadReceipt,
        isDownloadingReceiptId,
        alertVisible,
        alertConfig,
        hideAlert,
        refresh: loadData,
    };
};
