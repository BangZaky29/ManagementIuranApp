const fs = require('fs');

export default ({ config }) => {
    // Cari path google-services.json secara dinamis
    // 1. Cek dari Cloud Secret (EAS)
    // 2. Cek dari file lokal (jika ada)
    const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || (fs.existsSync('./google-services.json') ? './google-services.json' : null);

    return {
        ...config,
        // Tambahkan plugins di level utama
        plugins: [
            ...(config.plugins || []),
            "@react-native-community/datetimepicker"
        ],
        android: {
            ...config.android,
            // Hanya pasang field ini jika path ditemukan, untuk menghindari warning EAS
            ...(googleServicesFile ? { googleServicesFile } : {}),
            config: {
                ...(config.android?.config || {}),
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
                }
            }
        }
    };
};