import { MaterialTopTabs } from '../../../src/components/navigation/SwipeableTabLayout';
import { SecurityTabBar } from '../../../src/components/navigation/SecurityTabBar';

export default function SecurityTabsLayout() {
    return (
        <MaterialTopTabs
            tabBarPosition="bottom"
            tabBar={(props) => <SecurityTabBar {...props} />}
            screenOptions={{
                swipeEnabled: true,
                animationEnabled: true,
            }}
            initialRouteName="index"
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
                name="guests"
                options={{
                    title: 'Buku Tamu',
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
