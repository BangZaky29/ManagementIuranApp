import { useState, useEffect, useCallback } from 'react';
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
    const [selectedPeriodIds, setSelectedPeriodIds] = useState<Set<string>>(new Set());
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
                    toSelect.add(p.id);
                }
            });
            setSelectedPeriodIds(toSelect);

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
                    feeName: '',
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
    const togglePeriod = (periodId: string) => {
        setSelectedPeriodIds(prev => {
            const next = new Set(prev);
            if (next.has(periodId)) next.delete(periodId);
            else next.add(periodId);
            return next;
        });
    };

    const selectAllUnpaid = () => {
        if (!billSummary) return;
        const ids = new Set<string>();
        billSummary.periods.forEach(p => {
            if (p.status === 'unpaid' || p.status === 'partial' || p.status === 'overdue') {
                ids.add(p.id);
            }
        });
        setSelectedPeriodIds(ids);
    };

    const deselectAll = () => setSelectedPeriodIds(new Set());

    const selectedPeriods = billSummary?.periods.filter(p => selectedPeriodIds.has(p.id) && p.status !== 'paid') || [];
    const selectedTotal = selectedPeriods.reduce((sum, p) => sum + p.totalAmount, 0);

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
        selectedPeriodIds,
        selectedTotal,
        selectedCount: selectedPeriods.length,
        togglePeriod,
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
