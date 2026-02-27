import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseConfig';
import {
    fetchActiveVisitors,
    fetchVisitorHistory,
    checkInWalkinVisitor,
    checkOutVisitor,
    Visitor,
    VisitorType
} from '../../../services/guestService';

export interface AlertConfig {
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    buttons: { text: string; onPress: () => void; style?: 'cancel' | 'destructive' | 'default' }[];
}

export interface Resident {
    id: string; // usually user uuid
    full_name: string;
    housing_complex_id?: number | null;
    block?: string | null;
    avatar_url?: string | null;
    is_claimed?: boolean;
}

export function useGuestBookViewModel() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeGuests, setActiveGuests] = useState<Visitor[]>([]);
    const [guestHistory, setGuestHistory] = useState<Visitor[]>([]);
    const [activeTab, setActiveTab] = useState<'Aktif' | 'Riwayat'>('Aktif');
    const [refreshing, setRefreshing] = useState(false);
    
    // Pagination state for history
    const INITIAL_HISTORY_LIMIT = 3;
    const [visibleHistoryCount, setVisibleHistoryCount] = useState(INITIAL_HISTORY_LIMIT);

    // Update tab and reset history view state
    const handleTabChange = (tab: 'Aktif' | 'Riwayat') => {
        setActiveTab(tab);
        if (tab === 'Aktif') {
            setVisibleHistoryCount(INITIAL_HISTORY_LIMIT);
        }
    };

    const handleLoadMoreHistory = () => {
        setVisibleHistoryCount(prev => prev + 3);
    };

    const handleCollapseHistory = () => {
        setVisibleHistoryCount(INITIAL_HISTORY_LIMIT);
    };

    const [addModalVisible, setAddModalVisible] = useState(false);

    // Form state
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<VisitorType>('tamu');
    const [formDestination, setFormDestination] = useState('');
    const [formPurpose, setFormPurpose] = useState('');

    // Resident selection
    const [residents, setResidents] = useState<Resident[]>([]);
    const [residentModalVisible, setResidentModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [selectedGuest, setSelectedGuest] = useState<Visitor | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        title: '', message: '', type: 'info', buttons: []
    });

    const hideAlert = () => setAlertVisible(false);

    const loadData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setIsLoading(true);

        try {
            if (activeTab === 'Aktif') {
                const data = await fetchActiveVisitors();
                setActiveGuests(data);
            } else {
                const data = await fetchVisitorHistory();
                setGuestHistory(data);
            }
        } catch (error: any) {
            console.error('Failed to load visitors:', error);
            setAlertConfig({
                title: 'Error',
                message: error.message || 'Gagal memuat daftar tamu',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    const loadResidents = useCallback(async () => {
        try {
            console.log("Fetching residents...");
            const { data, error } = await supabase
                .from('verified_residents')
                .select(`
                    id, 
                    full_name, 
                    housing_complex_id, 
                    role, 
                    is_claimed, 
                    claimed_by,
                    nik,
                    housing_complexes (
                        name
                    )
                `)
                .eq('role', 'warga');

            console.log("Residents query returned:", { error, count: data?.length });
            if (error) {
                console.error("Supabase error fetching verified_residents:", error.message, error.details, error.hint);
                return;
            }

            if (data) {
                // Fetch profiles for avatars AND address/rt_rw if needed
                const niks = data.map(r => r.nik).filter(n => n !== null);
                let profilesMap: Record<string, any> = {};

                if (niks.length > 0) {
                    const { data: profilesData, error: profilesError } = await supabase
                        .from('profiles')
                        .select('id, nik, avatar_url, rt_rw')
                        .in('nik', niks);

                    if (!profilesError && profilesData) {
                        profilesData.forEach(p => {
                            if (p.nik) profilesMap[p.nik] = p;
                        });
                    }
                }

                // Limit logging output slightly to avoid spam
                if (data.length > 0) {
                    console.log("First resident sample:", data[0]);
                }
                const formatted: Resident[] = data.map((d: any) => {
                    const profile = d.nik ? profilesMap[d.nik] : null;

                    // If not claimed yet
                    if (!d.is_claimed || !profile?.id) {
                        return {
                            id: d.id, // Keep unique UUID for React key
                            full_name: d.full_name,
                            housing_complex_id: d.housing_complex_id,
                            block: 'Warga Belum Login',
                            avatar_url: null,
                            is_claimed: false, // Use this for UI disabling
                        };
                    }

                    const complexName = d.housing_complexes?.name
                        ? d.housing_complexes.name.toUpperCase()
                        : 'UNKNOWN COMPLEX';

                    // If address is something like '5' or 'Blok 5', we use it. If not, fallback to housing_complex_id as block number.
                    const blockStr = profile?.rt_rw || d.housing_complex_id || '?';

                    return {
                        id: profile.id, // Must use profile.id for visitors table destination_user_id
                        full_name: d.full_name,
                        housing_complex_id: d.housing_complex_id,
                        block: `${complexName} | Blok ${blockStr}`,
                        avatar_url: profile?.avatar_url || null,
                        is_claimed: true,
                    };
                });
                setResidents(formatted);
                console.log("Formatted residents count:", formatted.length);
            }
        } catch (err) {
            console.error('Load residents unexpected error:', err);
        }
    }, []);

    useEffect(() => {
        loadData();
        loadResidents();
    }, [loadData, loadResidents]);

    const handleCheckOut = async (item: Visitor) => {
        setAlertConfig({
            title: 'Konfirmasi Checkout',
            message: `Apakah Anda yakin ingin checkout ${item.visitor_name}?`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Checkout',
                    style: 'default',
                    onPress: async () => {
                        hideAlert();
                        setIsLoading(true);
                        try {
                            await checkOutVisitor(item.id);
                            await loadData();
                        } catch (error: any) {
                            console.error('Checkout error:', error);
                            setAlertConfig({
                                title: 'Error',
                                message: error.message || 'Gagal checkout tamu',
                                type: 'error',
                                buttons: [{ text: 'OK', onPress: hideAlert }]
                            });
                            setAlertVisible(true);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    const handleAddWalkin = async () => {
        if (!formName || !formType || !formDestination || !formPurpose) {
            setAlertConfig({
                title: 'Input Tidak Lengkap',
                message: 'Silakan lengkapi semua field yang tersedia.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const resident = residents.find(r => r.id === formDestination);
            await checkInWalkinVisitor(
                formName,
                formType,
                formDestination, // Should be the user id from Resident
                formPurpose,
                resident?.housing_complex_id || null
            );

            setAddModalVisible(false);
            setFormName('');
            setFormType('tamu');
            setFormDestination('');
            setFormPurpose('');

            await loadData();

            setAlertConfig({
                title: 'Sukses',
                message: 'Tamu berhasil dicatat dan diizinkan masuk.',
                type: 'success',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);

        } catch (error: any) {
            console.error('Checkin error:', error);
            setAlertConfig({
                title: 'Gagal',
                message: error.message || 'Gagal mencatat tamu masuk',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckInWithPin = (item: Visitor) => {
        setSelectedGuest(item);
        setPinInput('');
        setPinModalVisible(true);
    };

    const handleVerifyPin = async () => {
        if (!selectedGuest || !selectedGuest.pin_code) return;

        if (pinInput !== selectedGuest.pin_code) {
            setAlertConfig({
                title: 'PIN Salah',
                message: 'Kode PIN yang dimasukkan tidak cocok. Silakan coba lagi.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        setIsLoading(true);
        setPinModalVisible(false);
        try {
            const { error } = await supabase
                .from('visitors')
                .update({
                    status: 'active',
                    check_in_time: new Date().toISOString(),
                    housing_complex_id: selectedGuest.profiles?.housing_complex_id || null
                })
                .eq('id', selectedGuest.id);

            if (error) throw error;
            
            await loadData();
            setAlertConfig({
                title: 'Verifikasi Berhasil',
                message: `Tamu ${selectedGuest.visitor_name} telah diverifikasi dan diizinkan masuk.`,
                type: 'success',
                buttons: [{ text: 'Selesai', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } catch (error: any) {
            console.error('Verify PIN error:', error);
            setAlertConfig({
                title: 'Gagal',
                message: 'Terjadi kesalahan saat memproses data.',
                type: 'error',
                buttons: [{ text: 'Tutup', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResidents = residents.filter(r => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const nameMatch = r.full_name?.toLowerCase().includes(query);
        const blockMatch = r.block?.toLowerCase().includes(query);

        return nameMatch || blockMatch;
    });

    return {
        isLoading,
        refreshing,
        activeGuests,
        guestHistory,
        activeTab,
        setActiveTab: handleTabChange,
        visibleHistoryCount,
        handleLoadMoreHistory,
        handleCollapseHistory,
        addModalVisible,
        setAddModalVisible,
        formName,
        setFormName,
        formType,
        setFormType,
        formDestination,
        setFormDestination,
        formPurpose,
        setFormPurpose,
        residents,
        residentModalVisible,
        setResidentModalVisible,
        searchQuery,
        setSearchQuery,
        isSubmitting,
        alertVisible,
        setAlertVisible,
        alertConfig,
        setAlertConfig,
        hideAlert,
        loadData,
        handleCheckOut,
        handleAddWalkin,
        handleCheckInWithPin,
        handleVerifyPin,
        pinModalVisible,
        setPinModalVisible,
        pinInput,
        setPinInput,
        selectedGuest,
        filteredResidents
    };
}
