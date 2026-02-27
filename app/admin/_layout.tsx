import React from 'react';
import { MaterialTopTabs } from '../../src/components/navigation/SwipeableTabLayout';
import { AdminTabBar } from '../../src/components/navigation/AdminTabBar';

export default function AdminLayout() {
    return (
        <MaterialTopTabs
            tabBar={(props) => <AdminTabBar {...props} />}
            tabBarPosition="bottom"
            initialRouteName="index"
            screenOptions={{
                swipeEnabled: true,
                animationEnabled: true,
            }}
        >
            <MaterialTopTabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                }}
            />
            <MaterialTopTabs.Screen
                name="panic-logs"
                options={{
                    title: 'Darurat',
                }}
            />
            <MaterialTopTabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                }}
            />

            {/* Hidden screens — accessed via sidebar router.push, not shown in tab bar */}
            <MaterialTopTabs.Screen
                name="laporan"
                options={{ title: 'Laporan' }}
            />
            <MaterialTopTabs.Screen
                name="users"
                options={{ title: 'Kelola User' }}
            />
            <MaterialTopTabs.Screen
                name="news-management"
                options={{ title: 'Berita' }}
            />
            <MaterialTopTabs.Screen
                name="iuran-management"
                options={{ title: 'Iuran' }}
            />
            <MaterialTopTabs.Screen
                name="manage-fees"
                options={{ title: 'Kelola Iuran' }}
            />
            <MaterialTopTabs.Screen
                name="payment-methods"
                options={{ title: 'Metode' }}
            />
            <MaterialTopTabs.Screen
                name="payment-confirmation"
                options={{ title: 'Konfirmasi' }}
            />
        </MaterialTopTabs>
    );
}
