import { supabase } from '../../lib/supabaseConfig';
import { documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

export const exportResidents = async (
    complexId?: number | null,
    format: 'xlsx' | 'csv' = 'xlsx',
    action: 'share' | 'download' = 'share'
) => {
    try {
        let query = supabase
            .from('verified_residents')
            .select(`
                nik,
                full_name,
                role,
                housing_complexes(name)
            `)
            .order('full_name');

        if (complexId) {
            query = query.eq('housing_complex_id', complexId);
        }

        const { data, error } = await query;

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Tidak ada data untuk diekspor');

        const exportData = data.map(item => ({
            nik: item.nik ? `'${item.nik}` : '',
            "Nama Lengkap": item.full_name,
            role: item.role,
            cluster: (item.housing_complexes as any)?.name || '-'
        }));

        let filename = (documentDirectory || '') + `Data_Warga_Export_${new Date().getTime()}`;
        let base64 = '';

        if (format === 'xlsx') {
            filename += '.xlsx';
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Warga");
            base64 = XLSX.write(wb, { type: "base64" });
        } else {
            filename += '.csv';
            const ws = XLSX.utils.json_to_sheet(exportData);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const utf8 = unescape(encodeURIComponent(csv));
            base64 = btoa(utf8);
        }

        await writeAsStringAsync(filename, base64, {
            encoding: 'base64'
        });

        if (action === 'share') {
            await Sharing.shareAsync(filename, {
                mimeType: format === 'xlsx'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'text/csv',
                dialogTitle: 'Bagikan Data Warga'
            });
        } else {
            await Sharing.shareAsync(filename, {
                UTI: format === 'xlsx' ? 'com.microsoft.excel.xls' : 'public.comma-separated-values-text',
                mimeType: format === 'xlsx'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'text/csv',
                dialogTitle: 'Simpan Data Warga'
            });
        }

    } catch (error: any) {
        throw error;
    }
};
