import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { IuranReportRow, IuranSummary } from './types';

/**
 * Generate and share an Excel report of iuran data.
 */
export const generateIuranExcel = async (
    rows: IuranReportRow[],
    summary: IuranSummary,
    complexName: string,
    filterLabel: string
): Promise<void> => {
    // Build summary sheet data
    const summaryData = [
        ['LAPORAN IURAN WARGA'],
        [complexName],
        [filterLabel],
        [`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`],
        [],
        ['Ringkasan'],
        ['Total Transaksi', summary.totalTransaksi],
        ['Total Nominal', summary.totalNominal],
        ['Lunas', summary.lunas],
        ['Menunggu', summary.pending],
        ['Ditolak', summary.ditolak],
        ['Terlambat', summary.overdue],
    ];

    // Build data sheet
    const headers = [
        'No', 'Nama Warga', 'NIK', 'Alamat', 'RT/RW',
        'Nama Iuran', 'Jumlah', 'Periode', 'Status',
        'Metode Bayar', 'Tgl Bayar', 'Dikonfirmasi Oleh', 'Catatan Admin'
    ];

    const dataRows = rows.map(r => [
        r.no,
        r.nama_warga,
        r.nik || '-',
        r.alamat || '-',
        r.rt_rw || '-',
        r.nama_iuran,
        r.jumlah,
        r.periode,
        r.status,
        r.metode_bayar || '-',
        r.tanggal_bayar || '-',
        r.dikonfirmasi_oleh || '-',
        r.catatan_admin || '-',
    ]);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

    // Data sheet
    const wsData = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // Set column widths
    wsData['!cols'] = [
        { wch: 5 },   // No
        { wch: 25 },  // Nama
        { wch: 18 },  // NIK
        { wch: 30 },  // Alamat
        { wch: 10 },  // RT/RW
        { wch: 20 },  // Iuran
        { wch: 15 },  // Jumlah
        { wch: 18 },  // Periode
        { wch: 12 },  // Status
        { wch: 15 },  // Metode
        { wch: 15 },  // Tgl Bayar
        { wch: 20 },  // Konfirmasi
        { wch: 25 },  // Catatan
    ];

    XLSX.utils.book_append_sheet(wb, wsData, 'Data Iuran');

    // Write to file
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `Laporan_Iuran_${new Date().toISOString().split('T')[0]}.xlsx`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Simpan Laporan Iuran Excel',
    });
};
