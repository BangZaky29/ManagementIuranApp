import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchMyReports, Report } from '../../../services/laporanService';
import { useAuth } from '../../../contexts/AuthContext'; // To re-fetch on auth change

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
    const [selectedFilter, setSelectedFilter] = useState<'Semua' | 'Diproses' | 'Selesai'>('Semua');
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load
    useEffect(() => {
        loadReports();
    }, [user?.id]);

    // Reload when screen is focused (e.g. returning from detail or create)
    useFocusEffect(
        useCallback(() => {
            loadReports();
        }, [])
    );

    const loadReports = async () => {
        setIsLoading(true);
        try {
            const data = await fetchMyReports();

            // Map Supabase data to UI model
            const mappedReports: ReportItem[] = data.map(r => ({
                id: r.id,
                title: r.title,
                status: r.status,
                date: new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                category: r.category,
                description: r.description
            }));

            setReports(mappedReports);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredReports = reports.filter(item => {
        if (selectedFilter === 'Semua') return true;
        return item.status === selectedFilter;
    });

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
        setSelectedFilter,
        filteredReports,
        handleCreateReport,
        handleReportClick,
        isLoading,
        refresh: loadReports
    };
};
