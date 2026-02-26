import { Stack } from 'expo-router';

export default function SecurityRootLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            {/* Main Tabs Group */}
            <Stack.Screen name="(tabs)" />

            {/* Standalone Screens (Stand-out from swipeable tabs) */}
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="change-password" />
        </Stack>
    );
}
