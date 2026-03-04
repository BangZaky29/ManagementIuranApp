import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { IuranReportRow, IuranSummary } from './types';

const formatCurrency = (amount: number): string => {
    return 'Rp ' + amount.toLocaleString('id-ID');
};

const buildHtmlReport = (
    rows: IuranReportRow[],
    summary: IuranSummary,
    complexName: string,
    filterLabel: string
): string => {
    const tableRows = rows.map(r => `
        <tr>
            <td style="text-align:center">${r.no}</td>
            <td>${r.nama_warga}</td>
            <td>${r.nik || '-'}</td>
            <td>${r.nama_iuran}</td>
            <td style="text-align:right">${formatCurrency(r.jumlah)}</td>
            <td>${r.periode}</td>
            <td>
                <span class="status-${r.status.toLowerCase()}">${r.status}</span>
            </td>
            <td>${r.metode_bayar || '-'}</td>
            <td>${r.tanggal_bayar || '-'}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 30px; color: #333; font-size: 11px; }
            
            .header { text-align: center; margin-bottom: 24px; border-bottom: 3px solid #1B5E20; padding-bottom: 16px; }
            .header h1 { font-size: 20px; color: #1B5E20; margin-bottom: 4px; }
            .header h2 { font-size: 14px; color: #555; font-weight: normal; }
            .header .meta { font-size: 11px; color: #888; margin-top: 8px; }

            .summary { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 12px; }
            .summary-card { flex: 1; background: #F8FAF8; border: 1px solid #E8F5E9; border-radius: 8px; padding: 12px; text-align: center; }
            .summary-card .value { font-size: 20px; font-weight: bold; color: #1B5E20; }
            .summary-card .label { font-size: 10px; color: #666; margin-top: 2px; }

            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { background-color: #1B5E20; color: white; padding: 8px 6px; text-align: left; font-size: 10px; font-weight: 600; }
            td { padding: 7px 6px; border-bottom: 1px solid #EEE; font-size: 10px; }
            tr:nth-child(even) { background-color: #FAFAFA; }
            tr:hover { background-color: #F1F8E9; }

            .status-lunas { color: #2E7D32; font-weight: bold; }
            .status-menunggu { color: #F57F17; font-weight: bold; }
            .status-ditolak { color: #C62828; font-weight: bold; }
            .status-terlambat { color: #E65100; font-weight: bold; }

            .footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #EEE; font-size: 9px; color: #999; }

            @media print {
                body { padding: 15px; }
                .summary { display: table; width: 100%; }
                .summary-card { display: table-cell; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Laporan Iuran Warga</h1>
            <h2>${complexName}</h2>
            <div class="meta">${filterLabel} • Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </div>

        <div class="summary" style="display:flex;">
            <div class="summary-card">
                <div class="value">${summary.totalTransaksi}</div>
                <div class="label">Total Transaksi</div>
            </div>
            <div class="summary-card">
                <div class="value">${formatCurrency(summary.totalNominal)}</div>
                <div class="label">Total Nominal</div>
            </div>
            <div class="summary-card">
                <div class="value" style="color:#2E7D32">${summary.lunas}</div>
                <div class="label">Lunas</div>
            </div>
            <div class="summary-card">
                <div class="value" style="color:#F57F17">${summary.pending}</div>
                <div class="label">Menunggu</div>
            </div>
            <div class="summary-card">
                <div class="value" style="color:#C62828">${summary.ditolak}</div>
                <div class="label">Ditolak</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:30px">No</th>
                    <th>Nama Warga</th>
                    <th>NIK</th>
                    <th>Iuran</th>
                    <th style="text-align:right">Jumlah</th>
                    <th>Periode</th>
                    <th>Status</th>
                    <th>Metode</th>
                    <th>Tgl Bayar</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        ${rows.length === 0 ? '<p style="text-align:center;padding:40px;color:#999;">Tidak ada data untuk filter yang dipilih.</p>' : ''}

        <div class="footer">
            Dokumen ini digenerate secara otomatis oleh aplikasi Warga Pintar • ${complexName}
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate and share a PDF report of iuran data.
 */
export const generateIuranPdf = async (
    rows: IuranReportRow[],
    summary: IuranSummary,
    complexName: string,
    filterLabel: string
): Promise<void> => {
    const html = buildHtmlReport(rows, summary, complexName, filterLabel);

    const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
    });

    await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Simpan Laporan Iuran PDF',
        UTI: 'com.adobe.pdf',
    });
};
