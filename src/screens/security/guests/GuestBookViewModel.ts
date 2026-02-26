import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseConfig';
import {
    fetchActiveVisitors,
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
}

export function useGuestBookViewModel() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeGuests, setActiveGuests] = useState<Visitor[]>([]);

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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        title: '', message: '', type: 'info', buttons: []
    });

    const hideAlert = () => setAlertVisible(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchActiveVisitors();
            setActiveGuests(data);
        } catch (error: any) {
            console.error('Failed to load active visitors:', error);
            setAlertConfig({
                title: 'Error',
                message: error.message || 'Gagal memuat daftar tamu',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
                        .select('nik, avatar_url, address, rt_rw')
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
                    if (!d.is_claimed) {
                        return {
                            id: d.id,
                            full_name: d.full_name,
                            housing_complex_id: d.housing_complex_id,
                            block: 'Warga Belum Login',
                            avatar_url: null,
                        };
                    }

                    const complexName = d.housing_complexes?.name
                        ? d.housing_complexes.name.toUpperCase()
                        : 'UNKNOWN COMPLEX';

                    // If address is something like '5' or 'Blok 5', we use it. If not, fallback to housing_complex_id as block number.
                    const blockStr = profile?.rt_rw || d.housing_complex_id || '?';

                    return {
                        id: d.id,
                        full_name: d.full_name,
                        housing_complex_id: d.housing_complex_id,
                        block: `${complexName} | Blok ${blockStr}`,
                        avatar_url: profile?.avatar_url || null,
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
            await checkInWalkinVisitor(
                formName,
                formType,
                formDestination, // Should be the user id from Resident
                formPurpose
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

    const filteredResidents = residents.filter(r => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const nameMatch = r.full_name?.toLowerCase().includes(query);
        const blockMatch = r.block?.toLowerCase().includes(query);

        return nameMatch || blockMatch;
    });

    return {
        isLoading,
        activeGuests,
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
        alertConfig,
        hideAlert,
        loadData,
        handleCheckOut,
        handleAddWalkin,
        filteredResidents
    };
}
