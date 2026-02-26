import { useState, useEffect, useCallback } from 'react';
import { fetchNewsDetail, NewsItem } from '../../../services/newsService';
import { toUserMessage } from '../../../utils/AppError';

/**
 * Shared ViewModel for NewsDetail — used by both Warga and Admin screens.
 * Extracts the common data-fetching logic so screens only handle UI.
 */
export function useNewsDetailViewModel(id: string | string[]) {
    const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const newsId = typeof id === 'string' ? parseInt(id, 10) : 0;

    const loadNews = useCallback(async () => {
        if (!newsId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchNewsDetail(newsId);
            setNewsItem(data);
        } catch (err) {
            const msg = toUserMessage(err);
            setError(msg);
            console.error('Failed to load news detail:', err);
        } finally {
            setIsLoading(false);
        }
    }, [newsId]);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    return {
        newsItem,
        isLoading,
        setIsLoading,
        error,
        refresh: loadNews,
    };
}
