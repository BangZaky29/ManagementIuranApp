import { useState } from 'react';
import { useRouter } from 'expo-router';

export interface ReportItem {
    id: string;
    title: string;
    status: 'Diproses' | 'Selesai' | 'Menunggu';
    date: string;
    category: 'Fasilitas' | 'Kebersihan' | 'Keamanan' | 'Lainnya';
    description?: string;
}

export const useLaporanViewModel = () => {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState<'Semua' | 'Diproses' | 'Selesai'>('Semua');

    const [reports] = useState<ReportItem[]>([
        { id: '1', title: 'Lampu Jalan Mati', status: 'Selesai', date: '08 Feb 2026', category: 'Fasilitas' },
        { id: '2', title: 'Sampah Menumpuk', status: 'Diproses', date: '10 Feb 2026', category: 'Kebersihan' },
        { id: '3', title: 'Pos Kamling Rusak', status: 'Menunggu', date: '11 Feb 2026', category: 'Keamanan' },
    ]);

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
        handleReportClick
    };
};
