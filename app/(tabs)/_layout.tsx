import React from 'react';
import { MaterialTopTabs } from '../../src/components/navigation/SwipeableTabLayout';
import { CustomTabBar } from '../../src/components/navigation/CustomTabBar';

export default function TabLayout() {
  return (
    <MaterialTopTabs
      tabBar={(props) => <CustomTabBar {...props} />}
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
          title: 'Home',
        }}
      />
      <MaterialTopTabs.Screen
        name="iuran"
        options={{
          title: 'Iuran',
        }}
      />
      <MaterialTopTabs.Screen
        name="laporan"
        options={{
          title: 'Laporan',
        }}
      />
      <MaterialTopTabs.Screen
        name="profil"
        options={{
          title: 'Profil',
        }}
      />
    </MaterialTopTabs>
  );
}
