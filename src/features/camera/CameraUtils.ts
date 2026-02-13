import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export const handleCameraCapture = async (onSuccess: (uri: string) => void) => {
    // 1. Request Permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
        Alert.alert(
            "Izin Kamera Ditolak",
            "Aplikasi membutuhkan izin kamera untuk mengambil foto laporan. Silakan aktifkan di pengaturan.",
            [
                { text: "Batal", style: "cancel" },
                { text: "Buka Pengaturan", onPress: () => Linking.openSettings() }
            ]
        );
        return;
    }

    // 2. Launch Camera
    try {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            onSuccess(result.assets[0].uri);
        }
    } catch (error) {
        console.error("Camera Error:", error);
        Alert.alert("Error", "Gagal membuka kamera.");
    }
};
