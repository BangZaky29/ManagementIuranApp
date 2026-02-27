import { useState, useCallback } from 'react';
import { fetchAllReports, updateReportStatus, Report } from '../../services/laporanService';
import { useAuth } from '../../contexts/AuthContext';

export function useSecurityReportsViewModel() {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Semua');

    const loadReports = useCallback(async (isRefresh = false, loadMore = false) => {
        try {
            const limit = 3;
            const currentPage = isRefresh ? 0 : (loadMore ? page + 1 : 0);

            if (isRefresh) setRefreshing(true);
            else if (!loadMore) setIsLoading(true);

            const data = await fetchAllReports(currentPage, limit, filterStatus);
            
            if (isRefresh || !loadMore) {
                setReports(data);
                setPage(0);
            } else {
                setReports(prev => [...prev, ...data]);
                setPage(currentPage);
            }

            setHasMore(data.length === limit);
        } catch (error) {
            console.error('Failed to load reports for security:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [filterStatus, page]);

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
        hasMore,
        filterStatus,
        setFilterStatus,
        loadReports,
        handleUpdateStatus,
    };
}
