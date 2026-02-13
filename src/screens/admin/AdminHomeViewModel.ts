import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export function useAdminHomeViewModel() {
    const { signOut, user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.replace('/login');
    };

    const navigateToManageResidents = () => {
        router.push('/admin/residents');
    };

    return {
        user,
        handleLogout,
        navigateToManageResidents
    };
}
