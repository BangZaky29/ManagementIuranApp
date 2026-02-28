export default ({ config }) => {
    return {
        ...config,
        // Tambahkan plugins di level utama
        plugins: [
            ...(config.plugins || []),
            "@react-native-community/datetimepicker"
        ],
        android: {
            ...config.android,
            config: {
                ...(config.android?.config || {}),
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
                }
            }
        }
    };
};