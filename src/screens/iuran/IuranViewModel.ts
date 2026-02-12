import { useState } from 'react';
import { Alert } from 'react-native';

export interface PaymentHistoryItem {
    id: string;
    period: string;
    amount: string;
    status: 'Lunas' | 'Terlambat' | 'Pending';
    date: string;
    details: { label: string; value: string }[];
    isExpanded?: boolean;
}

import { useRouter } from 'expo-router';

export const useIuranViewModel = () => {
    const router = useRouter();
    const [currentMonth] = useState('Februari 2026');
    const [amountDue] = useState('Rp 150.000');
    const [isPaid, setIsPaid] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'transfer' | 'ewallet'>('transfer');

    const [history, setHistory] = useState<PaymentHistoryItem[]>([
        {
            id: '1',
            period: 'Januari 2026',
            amount: 'Rp 150.000',
            status: 'Lunas',
            date: '05 Jan 2026',
            details: [
                { label: 'Keamanan', value: 'Rp 100.000' },
                { label: 'Sampah', value: 'Rp 50.000' }
            ]
        },
        {
            id: '2',
            period: 'Desember 2025',
            amount: 'Rp 150.000',
            status: 'Lunas',
            date: '02 Dec 2025',
            details: [
                { label: 'Keamanan', value: 'Rp 100.000' },
                { label: 'Sampah', value: 'Rp 50.000' }
            ]
        },
        {
            id: '3',
            period: 'November 2025',
            amount: 'Rp 150.000',
            status: 'Terlambat',
            date: '10 Nov 2025',
            details: [
                { label: 'Keamanan', value: 'Rp 100.000' },
                { label: 'Sampah', value: 'Rp 50.000' },
                { label: 'Denda', value: 'Rp 15.000' } // Example late fee
            ]
        },
        {
            id: '4',
            period: 'Oktober 2025',
            amount: 'Rp 150.000',
            status: 'Lunas',
            date: '01 Oct 2025',
            details: [
                { label: 'Keamanan', value: 'Rp 100.000' },
                { label: 'Sampah', value: 'Rp 50.000' }
            ]
        },
    ]);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    const handlePay = () => {
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
        hideAlert
    };
};
