import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SAF_KEY = '@warga_pintar_receipt_dir';

export interface ReceiptData {
    paymentId: string;
    userName: string;
    amount: number;
    period: string;
    paymentMethod: string;
    paidAt: string;
    complexName: string;
    items?: { name: string; amount: number }[];
}

export const generateAndShareReceipt = async (data: ReceiptData): Promise<void> => {
    try {
        const html = `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        body {
                            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                            padding: 40px;
                            color: #333;
                            background-color: #fff;
                        }
                        .header {
                            text-align: center;
                            padding-bottom: 20px;
                            border-bottom: 2px dashed #eee;
                            margin-bottom: 30px;
                        }
                        .title { 
                            font-size: 28px; 
                            font-weight: bold; 
                            color: #1B5E20; 
                            margin: 0;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                        }
                        .subtitle { 
                            font-size: 14px; 
                            color: #666; 
                            margin-top: 5px; 
                        }
                        .content {
                            margin-bottom: 40px;
                        }
                        table {
                            width: 100%;
                            line-height: inherit;
                            text-align: left;
                            border-collapse: collapse;
                        }
                        table td {
                            padding: 12px 0;
                            vertical-align: top;
                            font-size: 16px;
                        }
                        table tr.border-bottom td {
                            border-bottom: 1px solid #eee;
                        }
                        .label {
                            color: #666;
                            width: 40%;
                            font-weight: 500;
                        }
                        .value {
                            color: #333;
                            font-weight: bold;
                            text-align: right;
                        }
                        .amount-row td {
                            padding-top: 24px;
                            padding-bottom: 24px;
                            border-top: 2px solid #eee;
                            border-bottom: 2px solid #eee;
                            font-size: 20px;
                        }
                        .amount-value {
                            color: #4CAF50;
                            font-size: 24px;
                        }
                        .footer {
                            text-align: center;
                            color: #888;
                            font-size: 12px;
                            margin-top: 50px;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                        }
                        .badge {
                            display: inline-block;
                            padding: 6px 12px;
                            background-color: #E8F5E9;
                            color: #2E7D32;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: bold;
                            margin-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="title">KUITANSI PEMBAYARAN</h1>
                        <p class="subtitle">${data.complexName}</p>
                        <div class="badge">LUNAS</div>
                    </div>
                    
                    <div class="content">
                        <table style="margin-bottom: 20px;">
                            <tr class="border-bottom">
                                <td class="label">ID Transaksi</td>
                                <td class="value">#${data.paymentId.substring(0, 8).toUpperCase()}</td>
                            </tr>
                            <tr class="border-bottom">
                                <td class="label">Tanggal Bayar</td>
                                <td class="value">${data.paidAt}</td>
                            </tr>
                            <tr class="border-bottom">
                                <td class="label">Nama Warga</td>
                                <td class="value">${data.userName}</td>
                            </tr>
                            <tr class="border-bottom">
                                <td class="label">Periode</td>
                                <td class="value">${data.period}</td>
                            </tr>
                            <tr class="border-bottom">
                                <td class="label">Metode Pembayaran</td>
                                <td class="value">${data.paymentMethod || 'Transfer/Tunai'}</td>
                            </tr>
                        </table>

                        <h3 style="color: #1B5E20; margin-bottom: 10px; font-size: 16px;">Rincian Pembayaran</h3>
                        <table style="border: 1px solid #eee;">
                            <tr style="background-color: #F5F5F5;">
                                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; color: #555;">Keterangan</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd; color: #555;">Jumlah</th>
                            </tr>
                            ${data.items && data.items.length > 0 ? data.items.map(item => `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f0f0f0;">Rp ${item.amount.toLocaleString('id-ID')}</td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">Pembayaran Iuran ${data.period}</td>
                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f0f0f0;">Rp ${data.amount.toLocaleString('id-ID')}</td>
                                </tr>
                            `}
                            <tr class="amount-row">
                                <td class="label" style="font-weight: bold; color: #333; padding: 15px 10px;">Total Pembayaran</td>
                                <td class="value amount-value" style="padding: 15px 10px;">Rp ${data.amount.toLocaleString('id-ID')}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="footer">
                        <p>Kuitansi ini adalah bukti pembayaran yang sah dan dibuat secara otomatis oleh sistem.</p>
                        <p>Terima kasih atas pembayaran iuran Anda.</p>
                        <p style="margin-top: 20px; font-weight: bold; color: #1B5E20;">Warga Lokal App</p>
                    </div>
                </body>
            </html>
        `;

        // Generate PDF
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false
        });

        // Share/Save the PDF
        if (Platform.OS === 'web') {
            alert('Fitur download kuitansi sedang disiapkan untuk versi Web.');
            return;
        }

        const filename = `Kuitansi_WargaLokal_${data.paymentId.substring(0, 8)}.pdf`;

        if (Platform.OS === 'android') {
            // Cek apakah sebelumnya user sudah pernah memilih folder
            let directoryUri = await AsyncStorage.getItem(SAF_KEY);

            if (!directoryUri) {
                // Jika belum, minta user pilih folder (HANYA 1 KALI)
                alert('Untuk menyimpan kuitansi secara otomatis, silakan pilih folder tujuan (misal: Downloads/Documents) satu kali ini saja.');
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

                if (permissions.granted) {
                    directoryUri = permissions.directoryUri;
                    await AsyncStorage.setItem(SAF_KEY, directoryUri);
                } else {
                    throw new Error('Izin penyimpanan ditolak. Tidak dapat menyimpan kuitansi.');
                }
            }

            // Langsung simpan ke folder yang sudah diingat
            try {
                // Baca file PDF yang dihasilkan expo-print
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

                // Buat file baru di direktori yang sudah tersimpan
                const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    directoryUri,
                    filename,
                    'application/pdf'
                );

                // Tulis konten
                await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });

                // Alert sukses opsional (bisa dihapus jika ingin completely silent download)
                // alert('Kuitansi berhasil disimpan langsung ke perangkat!');
            } catch (err) {
                // Jika directoryUri sudah tidak valid (misal folder dihapus user), reset dan minta ulang nanti
                await AsyncStorage.removeItem(SAF_KEY);
                throw new Error('Folder penyimpanan sebelumnya tidak ditemukan. Silakan coba unduh lagi untuk memilih folder baru.');
            }
        } else {
            // Untuk iOS, cara terbaik menyimpan file dokumen adalah lewat Share Sheet (Save to Files)
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Simpan Kuitansi Pembayaran',
                    UTI: 'com.adobe.pdf',
                });
            }
        }

    } catch (error) {
        console.error('Error generating receipt:', error);
        throw new Error('Gagal mengunduh PDF kuitansi.');
    }
};
