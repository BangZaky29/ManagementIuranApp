import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchMyReports, Report } from '../../../services/laporan';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDateSafe } from '../../../utils/dateUtils';

export interface ReportItem {
    id: string;
    title: string;
    status: 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak';
    date: string;
    category: 'Fasilitas' | 'Kebersihan' | 'Keamanan' | 'Lainnya';
    description?: string;
}

export const useLaporanViewModel = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedFilter, setSelectedFilter] = useState<'Semua' | 'Menunggu' | 'Diproses' | 'Selesai' | 'Ditolak'>('Semua');
    const [visibleCount, setVisibleCount] = useState(10);

    const {
        data: reports = [],
        isLoading,
        refetch
    } = useQuery({
        queryKey: ['myReports', user?.id],
        queryFn: async () => {
            const data = await fetchMyReports();
            return data.map(r => ({
                id: r.id,
                title: r.title,
                status: r.status,
                date: formatDateSafe(r.created_at),
                category: r.category,
                description: r.description
            })) as ReportItem[];
        },
        enabled: !!user?.id,
    });

    const allFilteredReports = reports.filter(item => {
        if (selectedFilter === 'Semua') return true;
        return item.status === selectedFilter;
    });

    const filteredReports = allFilteredReports.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    const handleShowLess = () => {
        setVisibleCount(prev => Math.max(10, prev - 10));
    };

    const canLoadMore = visibleCount < allFilteredReports.length;
    const canShowLess = visibleCount > 10;

    const handleFilterChange = (filter: 'Semua' | 'Menunggu' | 'Diproses' | 'Selesai' | 'Ditolak') => {
        setSelectedFilter(filter);
        setVisibleCount(10);
    };

    const handleCreateReport = () => {
        router.push('/laporan/create');
    };

    const handleReportClick = (id: string) => {
        router.push({
            pathname: '/laporan/[id]',
            params: { id }
        });
    };

    return {
        selectedFilter,
        setSelectedFilter: handleFilterChange,
        filteredReports,
        handleCreateReport,
        handleReportClick,
        isLoading,
        refresh: refetch,
        handleLoadMore,
        handleShowLess,
        canLoadMore,
        canShowLess
    };
};
