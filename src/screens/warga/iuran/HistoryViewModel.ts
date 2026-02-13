import { useState, useMemo } from 'react';
import { PaymentHistoryItem } from './IuranViewModel'; // Reuse interface

export const useHistoryViewModel = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<'All' | 'Lunas' | 'Terlambat'>('All');
    const [isCalendarVisible, setCalendarVisible] = useState(false);

    // Mock Data - Expanded for testing filters
    const allHistory: PaymentHistoryItem[] = [
        {
            id: '1', period: 'Januari 2026', amount: 'Rp 150.000', status: 'Lunas', date: '05 Jan 2026',
            details: [{ label: 'Keamanan', value: 'Rp 100.000' }, { label: 'Sampah', value: 'Rp 50.000' }]
        },
        {
            id: '2', period: 'Desember 2025', amount: 'Rp 150.000', status: 'Lunas', date: '02 Dec 2025',
            details: [{ label: 'Keamanan', value: 'Rp 100.000' }, { label: 'Sampah', value: 'Rp 50.000' }]
        },
        {
            id: '3', period: 'November 2025', amount: 'Rp 150.000', status: 'Terlambat', date: '10 Nov 2025',
            details: [{ label: 'Keamanan', value: 'Rp 100.000' }, { label: 'Sampah', value: 'Rp 50.000' }, { label: 'Denda', value: 'Rp 15.000' }]
        },
        {
            id: '4', period: 'Oktober 2025', amount: 'Rp 150.000', status: 'Lunas', date: '01 Oct 2025',
            details: [{ label: 'Keamanan', value: 'Rp 100.000' }, { label: 'Sampah', value: 'Rp 50.000' }]
        },
        {
            id: '5', period: 'September 2025', amount: 'Rp 150.000', status: 'Lunas', date: '05 Sep 2025',
            details: [{ label: 'Keamanan', value: 'Rp 100.000' }, { label: 'Sampah', value: 'Rp 50.000' }]
        },
        {
            id: '6', period: 'Agustus 2025', amount: 'Rp 150.000', status: 'Lunas', date: '02 Aug 2025',
            details: [{ label: 'Keamanan', value: 'Rp 100.000' }, { label: 'Sampah', value: 'Rp 50.000' }]
        },
    ];

    const filteredHistory = useMemo(() => {
        return allHistory.filter(item => {
            // Filter by Search Query (Period)
            const matchesSearch = item.period.toLowerCase().includes(searchQuery.toLowerCase());

            // Filter by Date (Match Month and Year)
            const matchesDate = selectedDate ? (
                // Assuming date string format like "05 Jan 2026" or similar
                // We'll compare month index and full year
                // Note: This relies on parsed dates or consistent string formatting.
                // Let's assume the 'period' field (e.g. "Januari 2026") holds the source of truth for Month/Year

                // Helper to map month names to index
                (() => {
                    const months = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
                    const itemPeriodLower = item.period.toLowerCase();
                    const selectedMonthName = months[selectedDate.getMonth()];
                    const selectedYear = selectedDate.getFullYear().toString();

                    return itemPeriodLower.includes(selectedMonthName) && itemPeriodLower.includes(selectedYear);
                })()
            ) : true;

            const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [searchQuery, selectedDate, selectedStatus, allHistory]); // Added allHistory dependency

    const statuses = ['All', 'Lunas', 'Terlambat'];

    // State for expanded items (handled locally here since allHistory is static in this mock)
    // In a real app, this might be part of the data fetching or a separate state map
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const isExpanded = (id: string) => expandedIds.has(id);

    const handleDateSelect = () => {
        setCalendarVisible(true);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedDate(null);
        setSelectedStatus('All');
    };

    const handleDownloadReceipt = (period: string) => {
        // Mock download logic
        alert(`Mengunduh kuitansi periode ${period}`);
    };

    return {
        searchQuery,
        setSearchQuery,
        selectedDate,
        setSelectedDate,
        selectedStatus,
        setSelectedStatus,
        filteredHistory,
        statuses,
        handleDateSelect,
        isCalendarVisible,
        setCalendarVisible,
        resetFilters,
        toggleExpand,
        isExpanded,
        handleDownloadReceipt
    };
};
