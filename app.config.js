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
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
            config: {
                ...(config.android?.config || {}),
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
                }
            }
        }
    };
};