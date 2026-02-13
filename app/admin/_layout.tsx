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
                name="laporan"
                options={{
                    title: 'Laporan',
                }}
            />
            <MaterialTopTabs.Screen
                name="users"
                options={{
                    title: 'Kelola User',
                }}
            />
            <MaterialTopTabs.Screen
                name="news-management"
                options={{
                    title: 'Berita',
                }}
            />
            {/* Explicitly hide the phantom 'news' route */}
            <MaterialTopTabs.Screen
                name="news"
                options={{
                    title: '',
                    href: null,
                    tabBarItemStyle: { display: 'none' }
                }}
            />
            <MaterialTopTabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                }}
            />
        </MaterialTopTabs>
    );
}
