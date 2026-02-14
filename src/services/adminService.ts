import { supabase } from '../lib/supabaseConfig';
import { documentDirectory, writeAsStringAsync, readAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';

export interface VerifiedResident {
    id: string;
    nik: string;
    full_name: string;
    role: 'warga' | 'security';
    description?: string;
    access_token: string;
    is_claimed: boolean;
    claimed_at?: string;
    created_at: string;
    housing_complex_id?: number | null;
    housing_complexes?: {
        name: string;
    } | null;
    user?: {
        avatar_url: string | null;
    } | {
        avatar_url: string | null;
    }[] | null;
}

export const fetchVerifiedResidents = async (page = 0, limit = 20) => {
    const from = page * limit;
    const to = from + limit - 1;

    // 1. Fetch Verified Residents
    const { data: residentsData, error: residentsError } = await supabase
        .from('verified_residents')
        .select(`
    *,
    housing_complexes(
        name
    )
        `)
        .order('created_at', { ascending: false })
        .range(from, to)
        .limit(limit);

    if (residentsError) throw residentsError;

    if (!residentsData || residentsData.length === 0) {
        return [] as VerifiedResident[];
    }

    // 2. Fetch Profiles for these residents (matching by NIK)
    // We filter out null NIKs just in case, though schema implies importance
    const niks = residentsData.map(r => r.nik).filter(n => n !== null);

    let profilesMap: Record<string, string | null> = {};

    if (niks.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('nik, avatar_url')
            .in('nik', niks);

        if (!profilesError && profilesData) {
            profilesData.forEach(p => {
                if (p.nik) {
                    profilesMap[p.nik] = p.avatar_url;
                }
            });
        }
    }

    // 3. Merge avatar_url into the result
    const mergedData = residentsData.map(resident => ({
        ...resident,
        user: {
            avatar_url: resident.nik ? profilesMap[resident.nik] || null : null
        }
    }));

    return mergedData as VerifiedResident[];
};

export const createVerifiedResident = async (
    data: Omit<VerifiedResident, 'id' | 'access_token' | 'is_claimed' | 'created_at' | 'housing_complexes'>
) => {
    const { data: newResident, error } = await supabase
        .from('verified_residents')
        .insert([data])
        .select()
        .single();

    if (error) throw error;
    return newResident as VerifiedResident;
};

export const updateVerifiedResident = async (
    id: string,
    updates: Partial<Omit<VerifiedResident, 'id' | 'created_at' | 'housing_complexes'>>
) => {
    const { data, error } = await supabase
        .from('verified_residents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as VerifiedResident;
};

export const deleteVerifiedResident = async (id: string) => {
    const { error } = await supabase
        .from('verified_residents')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const getDashboardStats = async () => {
    const { count: wargaCount, error: wargaError } = await supabase
        .from('verified_residents')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'warga');

    const { count: securityCount, error: securityError } = await supabase
        .from('verified_residents')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'security');

    const { count: claimedCount, error: claimedError } = await supabase
        .from('verified_residents')
        .select('*', { count: 'exact', head: true })
        .eq('is_claimed', true);

    if (wargaError) throw wargaError;
    if (securityError) throw securityError;
    if (claimedError) throw claimedError;

    return {
        warga: wargaCount || 0,
        security: securityCount || 0,
        activeUsers: claimedCount || 0,
    };
};

export const fetchHousingComplexes = async () => {
    const { data, error } = await supabase
        .from('housing_complexes')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
};

// --- Import / Export Logic ---

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

        // Format Data
        const exportData = data.map(item => ({
            nik: item.nik ? `'${item.nik}` : '', // Force string for Excel to prevent scientific notation
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
            // Convert string to base64
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
            // For "Download", mostly implies Saving to Files. 
            // On Android, Sharing.shareAsync is often used too but we can try StorageAccessFramework if we want proper "Save As".
            // However, sticking to shareAsync is safest for Expo Go. 
            // But we can enable UTI for iOS to "Save to Files".
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

export const importResidents = async (
    role: 'warga' | 'security',
    complexId: number | null
): Promise<{ success: number; failed: number; errors: string[] }> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
                'text/csv', // .csv
                'text/comma-separated-values',
                'application/csv'
            ],
            copyToCacheDirectory: true
        });

        if (result.canceled) throw new Error('Import dibatalkan');

        const fileUri = result.assets[0].uri;
        const fileContent = await readAsStringAsync(fileUri, {
            encoding: 'base64'
        });

        const wb = XLSX.read(fileContent, { type: 'base64' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (!data || data.length === 0) throw new Error('File kosong');

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const row of data) {
            // Validate headers (case insensitive check usually safer, but sticking to plan)
            const nik = row['nik'] || row['NIK']; // handle some variation
            const fullName = row['Nama Lengkap'] || row['full_name'];

            if (!nik || !fullName) {
                failed++;
                errors.push(`Baris tanpa NIK atau Nama Lengkap dilewati.`);
                continue;
            }

            try {
                // Ensure unique access token logic is handled by DB default (or generated if needed)
                // DB has default: upper(SUBSTRING(md5((random())::text) from 0 for 7))
                // We just insert the minimal fields

                const { error } = await supabase
                    .from('verified_residents')
                    .insert({
                        nik: String(nik), // Ensure string
                        full_name: fullName,
                        role: role,
                        housing_complex_id: complexId,
                        is_claimed: false
                    });

                if (error) {
                    // Check for unique constraint (NIK already exists)
                    if (error.code === '23505') { // Postgres unique_violation
                        failed++;
                        errors.push(`NIK ${nik} sudah terdaftar.`);
                    } else {
                        throw error;
                    }
                } else {
                    success++;
                }
            } catch (err: any) {
                failed++;
                errors.push(`Gagal import ${fullName}: ${err.message}`);
            }
        }

        return { success, failed, errors };

    } catch (error: any) {
        throw error;
    }
};
