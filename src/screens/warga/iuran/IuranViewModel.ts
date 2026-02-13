import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchMyPayments, fetchActiveFees, calculateBillSummary, PaymentRecord } from '../../../services/iuranService';

export interface PaymentHistoryItem {
    id: string;
    period: string; // "Januari 2026"
    amount: string;
    status: 'Lunas' | 'Terlambat' | 'Pending';
    date: string;
    details: { label: string; value: string }[];
    isExpanded?: boolean;
}

export const useIuranViewModel = () => {
    const router = useRouter();
    const { user } = useAuth();

    // State
    const [currentMonth, setCurrentMonth] = useState('');
    const [amountDue, setAmountDue] = useState('Rp 0');
    const [isPaid, setIsPaid] = useState(false);

    // Mapped history for UI
    const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const date = new Date();
        setCurrentMonth(date.toLocaleString('id-ID', { month: 'long', year: 'numeric' }));
        loadData();
    }, [user?.id]);

    const loadData = async () => {
        if (!user?.id) return;
        setIsLoading(true);

        try {
            // 1. Get Bill Summary for current month
            const bill = await calculateBillSummary(user.id);
            setAmountDue(bill.isPaid ? 'Lunas' : `Rp ${bill.total.toLocaleString('id-ID')}`);
            setIsPaid(!!bill.isPaid);

            // 2. Get Payment History
            const rawPayments = await fetchMyPayments();
            const formattedHistory: PaymentHistoryItem[] = rawPayments.map(p => {
                const dateObj = new Date(p.period);
                const periodStr = dateObj.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

                return {
                    id: p.id,
                    period: periodStr,
                    amount: `Rp ${p.amount.toLocaleString('id-ID')}`,
                    status: p.status === 'paid' ? 'Lunas' : (p.status === 'overdue' ? 'Terlambat' : 'Pending'),
                    date: p.paid_at ? new Date(p.paid_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
                    details: [
                        { label: 'Metode', value: p.payment_method || '-' },
                        { label: 'Iuran', value: `Rp ${p.amount.toLocaleString('id-ID')}` }
                    ],
                    isExpanded: false
                };
            });
            setHistory(formattedHistory);
        } catch (error) {
            console.error('Failed to load iuran data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    const handlePay = () => {
        // For now, mock payment flow or navigate to detail
        if (isPaid) {
            setAlertConfig({
                title: 'Info',
                message: 'Tagihan bulan ini sudah lunas.',
                type: 'info',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }
        router.push('/iuran/payment-detail');
    };

    const toggleExpand = (id: string) => {
        setHistory(prev => prev.map(item =>
            item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
        ));
    };

    const handleDownloadReceipt = (period: string) => {
        setAlertConfig({
            title: 'Simpan Bukti',
            message: `Mengunduh kuitansi untuk periode ${period}...`,
            type: 'info',
            buttons: [{ text: 'OK', onPress: hideAlert }]
        });
        setAlertVisible(true);
    };

    return {
        currentMonth,
        amountDue,
        isPaid,
        history,
        handlePay,
        toggleExpand,
        handleDownloadReceipt,
        alertVisible,
        alertConfig,
        hideAlert,
        isLoading,
        refresh: loadData
    };
};
