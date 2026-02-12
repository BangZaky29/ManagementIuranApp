export interface NewsItem {
    id: number;
    title: string;
    date: string;
    content: string;
    image?: any; // Placeholder for image require or URL
    category: string;
}

export const NEWS_ITEMS: NewsItem[] = [
    {
        id: 1,
        title: 'Kerja Bakti Rutin - Minggu ini',
        date: '10 Feb 2026',
        category: 'KEGIATAN',
        content: `Diharapkan seluruh warga hadir untuk membersihkan selokan utama di lingkungan RT 01/RW 05. 

Kegiatan ini bertujuan untuk mencegah banjir mengingat curah hujan yang tinggi belakangan ini. Silakan membawa peralatan kebersihan masing-masing seperti sapu lidi, cangkul, dan sarung tangan.

Waktu: 07:00 WIB - Selesai
Titik Kumpul: Pos Ronda Utama

Konsumsi ringan akan disediakan oleh ibu-ibu PKK. Mari kita jaga kebersihan lingkungan kita bersama!`
    },
    {
        id: 2,
        title: 'Jadwal Ronda Malam - Pekan Ini',
        date: '09 Feb 2026',
        category: 'KEAMANAN',
        content: `Berikut adalah jadwal ronda untuk pekan ke-2 bulan Februari 2026.

Senin: Bapak A, Bapak B, Bapak C
Selasa: Bapak D, Bapak E, Bapak F
Rabu: Bapak G, Bapak H, Bapak I
Kamis: Bapak J, Bapak K, Bapak L
Jumat: Bapak M, Bapak N, Bapak O
Sabtu: Bapak P, Bapak Q, Bapak R
Minggu: Bapak S, Bapak T, Bapak U

Mohon bagi yang berhalangan hadir untuk melapor ke Ketua RT atau mencari pengganti. Keamanan lingkungan adalah tanggung jawab kita bersama.`
    },
    {
        id: 3,
        title: 'Laporan Keuangan Januari',
        date: '01 Feb 2026',
        category: 'TRANSPARANSI',
        content: `Transparansi dana kas RT/RW bulan Januari 2026 telah terbit.

Pemasukan:
- Iuran Warga: Rp 5.000.000
- Donasi: Rp 1.500.000

Pengeluaran:
- Kebersihan: Rp 2.000.000
- Perbaikan Lampu Jalan: Rp 500.000
- Kegiatan PKK: Rp 1.000.000

Saldo Akhir: Rp 3.000.000

Laporan lengkap dapat dilihat di papan pengumuman balai warga atau menghubungi Bendahara RT.`
    },
];
