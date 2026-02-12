import { Stack } from 'expo-router';

export default function IuranLayout() {
    return (
        <Stack>
            <Stack.Screen name="history" options={{ headerShown: false }} />
            <Stack.Screen name="payment-detail" options={{ headerShown: false }} />
        </Stack>
    );
}
