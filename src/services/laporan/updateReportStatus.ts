import { supabase } from '../../lib/supabaseConfig';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const updateReportStatus = async (
    id: string,
    status: string,
    options?: {
        rejectionReason?: string;
        completionImageUri?: string;
        actorId?: string;
    }
): Promise<void> => {
    let completionImageUrl = undefined;

    if (options?.completionImageUri) {
        const fileName = `completion_${id}_${Date.now()}.jpg`;
        const base64 = await FileSystem.readAsStringAsync(options.completionImageUri, {
            encoding: 'base64',
        });

        const { error: uploadError } = await supabase.storage
            .from('konfirmasi-laporan')
            .upload(fileName, decode(base64), {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (uploadError) {
            console.error('Completion image upload error:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('konfirmasi-laporan')
            .getPublicUrl(fileName);

        completionImageUrl = publicUrl;
    }

    const updateData: any = {
        status,
        updated_at: new Date().toISOString()
    };

    if (options?.rejectionReason !== undefined) {
        updateData.rejection_reason = options.rejectionReason;
    }

    if (completionImageUrl) {
        updateData.completion_image_url = completionImageUrl;
    }

    if (options?.actorId) {
        if (status === 'Diproses') {
            updateData.processed_by_id = options.actorId;
        } else if (status === 'Selesai') {
            updateData.completed_by_id = options.actorId;
        }
    }

    const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
};
