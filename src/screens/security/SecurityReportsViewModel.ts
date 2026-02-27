import { useState, useCallback } from 'react';
import { fetchAllReports, updateReportStatus, Report } from '../../services/laporanService';
import { useAuth } from '../../contexts/AuthContext';

export function useSecurityReportsViewModel() {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('Semua');

    const loadReports = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setIsLoading(true);

            const data = await fetchAllReports(0, 50, filterStatus);
            setReports(data);
        } catch (error) {
            console.error('Failed to load reports for security:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [filterStatus]);

    const handleUpdateStatus = async (reportId: string, status: string) => {
        try {
            await updateReportStatus(reportId, status);
            // Refresh local state
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: status as any } : r));
        } catch (error) {
            console.error('Failed to update report status:', error);
        }
    };

    return {
        reports,
        isLoading,
        refreshing,
        filterStatus,
        setFilterStatus,
        loadReports,
        handleUpdateStatus,
    };
}
