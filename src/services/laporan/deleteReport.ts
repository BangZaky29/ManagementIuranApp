import { supabase } from '../../lib/supabaseConfig';
import { fetchReportById } from './fetchReportById';

export const deleteReport = async (reportId: string): Promise<void> => {
    const report = await fetchReportById(reportId);
    if (!report) return;

    const promises = [];

    if (report.image_url) {
        const fileName = report.image_url.split('/').pop();
        if (fileName) {
            promises.push(
                supabase.storage
                    .from('wargaPintar')
                    .remove([`reports/${fileName}`])
                    .catch(err => console.warn('Failed to delete image:', err))
            );
        }
    }

    promises.push(
        supabase
            .from('reports')
            .delete()
            .eq('id', reportId)
            .then(({ error }) => { if (error) throw error; })
    );

    await Promise.all(promises);
};
