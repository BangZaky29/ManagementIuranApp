export interface BackupLog {
    id: string;
    admin_id: string;
    housing_complex_id: number;
    backup_type: 'google_drive' | 'local';
    file_name: string | null;
    drive_file_id: string | null;
    drive_link: string | null;
    status: 'pending' | 'success' | 'failed';
    error_message: string | null;
    records_count: number | null;
    created_at: string;
}

export interface IuranReportRow {
    no: number;
    nama_warga: string;
    nik: string | null;
    alamat: string | null;
    rt_rw: string | null;
    nama_iuran: string;
    jumlah: number;
    periode: string;
    status: string;
    metode_bayar: string | null;
    tanggal_bayar: string | null;
    dikonfirmasi_oleh: string | null;
    catatan_admin: string | null;
}

export interface IuranSummary {
    totalTransaksi: number;
    totalNominal: number;
    lunas: number;
    pending: number;
    ditolak: number;
    overdue: number;
}

export interface BackupFilter {
    period?: string; // 'YYYY-MM'
    status?: 'all' | 'paid' | 'pending' | 'rejected' | 'overdue';
    feeId?: number;
}
