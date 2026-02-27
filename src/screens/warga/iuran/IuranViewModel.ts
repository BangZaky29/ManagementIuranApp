import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchMyPayments, calculateBillSummary, BillSummary, BillItem, PaymentRecord } from '../../../services/iuranService';
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
    const [billSummary, setBillSummary] = useState<BillSummary | null>(null);
    const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFeeIds, setSelectedFeeIds] = useState<Set<number>>(new Set());
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
                calculateBillSummary(user.id),
                fetchMyPayments(),
            ]);
            setBillSummary(bill);

            // Auto-select all unpaid (not pending, not paid) fees
            const unpaidIds = new Set<number>(
                bill.items.filter(i => i.status === 'unpaid').map(i => i.fee.id)
            );
            setSelectedFeeIds(unpaidIds);

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
    const toggleFee = (feeId: number) => {
        setSelectedFeeIds(prev => {
            const next = new Set(prev);
            if (next.has(feeId)) next.delete(feeId);
            else next.add(feeId);
            return next;
        });
    };

    const selectAllUnpaid = () => {
        if (!billSummary) return;
        const ids = new Set<number>(
            billSummary.items.filter(i => i.status === 'unpaid').map(i => i.fee.id)
        );
        setSelectedFeeIds(ids);
    };

    const deselectAll = () => setSelectedFeeIds(new Set());

    const selectedItems = billSummary?.items.filter(i => selectedFeeIds.has(i.fee.id) && i.status === 'unpaid') || [];
    const selectedTotal = selectedItems.reduce((sum, i) => sum + i.amount, 0);

    // Pay
    const handlePay = () => {
        if (!billSummary) return;
        if (billSummary.allPaid) {
            setAlertConfig({
                title: 'Info',
                message: 'Semua tagihan bulan ini sudah lunas.',
                type: 'info',
                buttons: [{ text: 'OK', onPress: hideAlert }],
            });
            setAlertVisible(true);
            return;
        }
        if (selectedItems.length === 0) {
            setAlertConfig({
                title: 'Pilih Iuran',
                message: 'Pilih minimal 1 iuran yang ingin dibayar.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: hideAlert }],
            });
            setAlertVisible(true);
            return;
        }
        router.push({
            pathname: '/iuran/payment-detail',
            params: {
                selectedFees: JSON.stringify(
                    selectedItems.map(i => ({ feeId: i.fee.id, amount: i.amount, name: i.fee.name }))
                ),
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
            // Show success toast (or alert, let's just alert since it's already there)
            setAlertConfig({
                title: 'Berhasil',
                message: 'Kuitansi berhasil diunduh/dibagikan.',
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
        selectedFeeIds,
        selectedTotal,
        selectedCount: selectedItems.length,
        toggleFee,
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
