import * as Location from 'expo-location';

export const getDeviceLocation = async (): Promise<string> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return 'Izin lokasi ditolak';
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        return `https://maps.google.com/?q=${latitude},${longitude}`;
    } catch (error) {
        console.warn('Failed to get location:', error);
        return 'Gagal mendapatkan lokasi';
    }
};
