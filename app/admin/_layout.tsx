import React from 'react';
import { Stack } from 'expo-router';

export default function AdminRootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="laporan" />
            <Stack.Screen name="users" />
            <Stack.Screen name="news-management" />
            <Stack.Screen name="iuran-management" />
            <Stack.Screen name="manage-fees" />
            <Stack.Screen name="payment-methods" />
            <Stack.Screen name="payment-confirmation" />
            <Stack.Screen name="activity-log" />
        </Stack>
    );
}
