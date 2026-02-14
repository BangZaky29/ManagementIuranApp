import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Keyboard } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseConfig';

export type VerifiedData = {
    valid: boolean;
    name: string;
    address: string;
    rt_rw: string;
    role: 'warga' | 'security';
    housing_name?: string; // Added housing name
};

export function useRegisterViewModel() {
    const router = useRouter();
    const { signUp } = useAuth();

    // Steps: 1 = Verify, 2 = Register
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Step 1: Verification
    const [nik, setNik] = useState('');
    const [token, setToken] = useState('');
    const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);

    // Step 2: Registration
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Error State
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    const showAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error', buttons?: any[]) => {
        setAlertConfig({
            title,
            message,
            type,
            buttons: buttons || [{ text: 'OK', onPress: hideAlert }]
        });
        setAlertVisible(true);
    };

    const handleVerify = async () => {
        if (!nik || !token) {
            showAlert('Peringatan', 'NIK dan Kode Akses wajib diisi', 'warning');
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            const { data, error } = await supabase.rpc('verify_registration_token', {
                input_nik: nik,
                input_token: token
            });

            if (error) throw error;

            if (data && data.valid) {
                setVerifiedData({
                    valid: data.valid,
                    name: data.name,
                    address: data.address,
                    rt_rw: data.rt_rw,
                    role: data.role,
                    housing_name: data.housing_name
                });
                setStep(2);
            } else {
                showAlert('Gagal', 'NIK atau Kode Akses tidak valid, atau sudah terdaftar.', 'error');
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            showAlert('Error', 'Terjadi kesalahan saat memverifikasi data.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const validateStep2 = () => {
        let isValid = true;
        const newErrors: { [key: string]: string } = {};

        if (!username.trim()) { newErrors.username = 'Username wajib diisi'; isValid = false; }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) { newErrors.email = 'Email wajib diisi'; isValid = false; }
        else if (!emailRegex.test(email)) { newErrors.email = 'Format email tidak valid'; isValid = false; }

        const phoneRegex = /^[0-9]+$/;
        if (!phone.trim()) { newErrors.phone = 'Nomor HP wajib diisi'; isValid = false; }
        else if (!phoneRegex.test(phone)) { newErrors.phone = 'Nomor HP harus berupa angka'; isValid = false; }

        if (!password) { newErrors.password = 'Kata sandi wajib diisi'; isValid = false; }
        else if (password.length < 6) { newErrors.password = 'Kata sandi minimal 6 karakter'; isValid = false; }

        if (password !== confirmPassword) { newErrors.confirmPassword = 'Kata sandi tidak cocok'; isValid = false; }

        setErrors(newErrors);
        return isValid;
    };

    const handleRegister = async () => {
        if (!validateStep2() || !verifiedData) return;

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            // signUp throws on error, returns { needsConfirmation } on success
            const { needsConfirmation } = await signUp({
                email: email.trim(),
                password,
                fullName: verifiedData.name, // Use verified name
                phone: phone.trim(),
                role: verifiedData.role, // Use verified role
                metadata: {
                    nik: nik, // Vital for linking to verified_residents
                    username: username,
                    wa_phone: phone,
                    address: verifiedData.address,
                    rt_rw: verifiedData.rt_rw,
                    role: verifiedData.role,
                    verified: true
                }
            });

            if (needsConfirmation) {
                showAlert(
                    'Registrasi Berhasil',
                    'Silakan cek email konfirmasi yang telah kami kirim (cek juga folder spam) untuk mengaktifkan akun Anda sebelum login.',
                    'success',
                    [{ text: 'OK', onPress: () => { hideAlert(); router.replace('/login'); } }]
                );
            } else {
                // Assuming auto-login:
                showAlert(
                    'Registrasi Berhasil',
                    `Selamat datang, ${verifiedData.name}! Anda akan diarahkan ke aplikasi.`,
                    'success',
                    [{
                        text: 'Masuk',
                        onPress: () => {
                            hideAlert();
                            // Router replace to home if not auto-redirected by AuthGate
                        }
                    }]
                );
            }

        } catch (error: any) {
            console.error('Registration error:', error);
            showAlert('Gagal', error.message || 'Gagal mendaftar', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        step,
        setStep,
        alertVisible,
        alertConfig,
        hideAlert,
        isLoading,
        nik, setNik,
        token, setToken,
        verifiedData,
        username, setUsername,
        email, setEmail,
        phone, setPhone,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        errors,
        handleVerify,
        handleRegister
    };
}
