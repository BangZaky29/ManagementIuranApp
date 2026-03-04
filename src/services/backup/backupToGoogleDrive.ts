import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../lib/supabaseConfig';
import { IuranReportRow } from './types';

// Convert rows to CSV string
const rowsToCsv = (rows: IuranReportRow[]): string => {
    const headers = [
        'No', 'Nama Warga', 'NIK', 'Alamat', 'RT/RW',
        'Nama Iuran', 'Jumlah (Rp)', 'Periode', 'Status',
        'Metode Bayar', 'Tgl Bayar', 'Dikonfirmasi Oleh', 'Catatan Admin'
    ];

    const csvRows = rows.map(r => [
        r.no,
        `"${r.nama_warga}"`,
        r.nik || '',
        `"${r.alamat || ''}"`,
        r.rt_rw || '',
        `"${r.nama_iuran}"`,
        r.jumlah,
        r.periode,
        r.status,
        r.metode_bayar || '',
        r.tanggal_bayar || '',
        `"${r.dikonfirmasi_oleh || ''}"`,
        `"${r.catatan_admin || ''}"`,
    ].join(','));

    return [headers.join(','), ...csvRows].join('\n');
};

interface DriveUploadResult {
    fileId: string;
    webViewLink: string;
}

/**
 * Upload CSV data to user's Google Drive using their provider_token.
 */
const uploadToDrive = async (
    csvContent: string,
    fileName: string,
    googleAccessToken: string
): Promise<DriveUploadResult> => {
    const metadata = {
        name: fileName,
        mimeType: 'text/csv',
        parents: [], // Upload to root of Drive
    };

    // Use multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/csv\r\n\r\n' +
        csvContent +
        closeDelimiter;

    const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${googleAccessToken}`,
                'Content-Type': `multipart/related; boundary="${boundary}"`,
            },
            body,
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Drive upload failed: ${errorData?.error?.message || response.statusText}`);
    }

    const result = await response.json();
    return {
        fileId: result.id,
        webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    };
};

/**
 * Backup iuran data as CSV to user's Google Drive.
 * Requires googleAccessToken from Supabase session (obtained via Google Login).
 */
export const backupToGoogleDrive = async (
    rows: IuranReportRow[],
    adminId: string,
    complexId: number,
    complexName: string,
    googleAccessToken: string
): Promise<{ success: boolean; driveLink?: string }> => {
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Iuran_${complexName.replace(/\s+/g, '_')}_${dateStr}.csv`;

    const { data: logData, error: logInsertError } = await supabase
        .from('backup_logs')
        .insert({
            admin_id: adminId,
            housing_complex_id: complexId,
            backup_type: 'google_drive',
            file_name: fileName,
            status: 'pending',
            records_count: rows.length,
        })
        .select()
        .single();

    if (logInsertError) throw logInsertError;
    const logId = logData?.id;

    try {
        const csvContent = rowsToCsv(rows);
        const { fileId, webViewLink } = await uploadToDrive(csvContent, fileName, googleAccessToken);

        await supabase
            .from('backup_logs')
            .update({ status: 'success', drive_file_id: fileId, drive_link: webViewLink })
            .eq('id', logId);

        return { success: true, driveLink: webViewLink };
    } catch (error: any) {
        await supabase
            .from('backup_logs')
            .update({ status: 'failed', error_message: error.message })
            .eq('id', logId);
        throw error;
    }
};
