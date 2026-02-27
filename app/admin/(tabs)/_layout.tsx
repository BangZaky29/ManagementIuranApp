import React from 'react';
import { MaterialTopTabs } from '../../../src/components/navigation/SwipeableTabLayout';
import { AdminTabBar } from '../../../src/components/navigation/AdminTabBar';

export default function AdminTabsLayout() {
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
                options={{ title: 'Dashboard' }}
            />
            <MaterialTopTabs.Screen
                name="panic-logs"
                options={{ title: 'Darurat' }}
            />
            <MaterialTopTabs.Screen
                name="profile"
                options={{ title: 'Profil' }}
            />
        </MaterialTopTabs>
    );
}
