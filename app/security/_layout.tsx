import { MaterialTopTabs } from '../../src/components/navigation/SwipeableTabLayout';
import { SecurityTabBar } from '../../src/components/navigation/SecurityTabBar';

export default function SecurityLayout() {
    return (
        <MaterialTopTabs
            tabBar={(props) => <SecurityTabBar {...props} />}
            screenOptions={{
                swipeEnabled: false, // Recommended for bottom tabs feeling
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
        </MaterialTopTabs>
    );
}
