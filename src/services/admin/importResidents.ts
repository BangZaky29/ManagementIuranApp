import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { readAsStringAsync } from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';

export const importResidents = async (
    role: 'warga' | 'security',
    complexId: number | null
): Promise<{ success: number; failed: number; errors: string[] }> => {
    const result = await DocumentPicker.getDocumentAsync({
        type: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            'text/comma-separated-values',
            'application/csv'
        ],
        copyToCacheDirectory: true
    });

    if (result.canceled) throw new AppError('Import dibatalkan', 'IMPORT_CANCELLED', 'Import dibatalkan.');

    const fileUri = result.assets[0].uri;
    const fileContent = await readAsStringAsync(fileUri, {
        encoding: 'base64'
    });

    const wb = XLSX.read(fileContent, { type: 'base64' });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json(ws) as any[];

    if (!data || data.length === 0) {
        throw new AppError('File kosong', 'IMPORT_EMPTY', 'File yang diupload tidak berisi data.');
    }

    const validRows: { nik: string; full_name: string; role: string; housing_complex_id: number | null; is_claimed: boolean }[] = [];
    const errors: string[] = [];
    let failed = 0;

    for (const row of data) {
        const nik = row['nik'] || row['NIK'];
        const fullName = row['Nama Lengkap'] || row['full_name'];

        if (!nik || !fullName) {
            failed++;
            errors.push(`Baris tanpa NIK atau Nama Lengkap dilewati.`);
            continue;
        }

        validRows.push({
            nik: String(nik),
            full_name: fullName,
            role: role,
            housing_complex_id: complexId,
            is_claimed: false
        });
    }

    if (validRows.length === 0) {
        return { success: 0, failed, errors };
    }

    const BATCH_SIZE = 100;
    let success = 0;

    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
        const batch = validRows.slice(i, i + BATCH_SIZE);

        const { data: inserted, error } = await supabase
            .from('verified_residents')
            .insert(batch)
            .select('nik');

        if (error) {
            if (error.code === '23505') {
                for (const row of batch) {
                    const { error: singleError } = await supabase
                        .from('verified_residents')
                        .insert(row);

                    if (singleError) {
                        failed++;
                        if (singleError.code === '23505') {
                            errors.push(`NIK ${row.nik} sudah terdaftar.`);
                        } else {
                            errors.push(`Gagal import ${row.full_name}: ${singleError.message}`);
                        }
                    } else {
                        success++;
                    }
                }
            } else {
                failed += batch.length;
                errors.push(`Batch gagal: ${error.message}`);
            }
        } else {
            success += inserted?.length || batch.length;
        }
    }

    return { success, failed, errors };
};
