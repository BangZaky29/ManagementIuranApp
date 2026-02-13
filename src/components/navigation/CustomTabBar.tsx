import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { handleCameraCapture } from '../../features/camera/CameraUtils';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

const ScanButton = ({ onPress, colors }: { onPress: () => void; colors: any }) => (
    <TouchableOpacity
        style={styles.scanButtonContainer}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={[styles.scanButton, { backgroundColor: colors.backgroundCard }]}>
            <Ionicons name="camera" size={28} color={colors.green5} />
        </View>
    </TouchableOpacity>
);

export const CustomTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    const router = useRouter();
    const { colors } = useTheme();

    const handleScan = () => {
        handleCameraCapture((uri) => {
            router.push({ pathname: '/laporan/create', params: { imageUri: uri } });
        });
    };

    return (
        <View style={[styles.tabBarContainer, { backgroundColor: colors.green5 }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';
                if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
                else if (route.name === 'iuran') iconName = isFocused ? 'leaf' : 'leaf-outline';
                else if (route.name === 'laporan') iconName = isFocused ? 'heart' : 'heart-outline';
                else if (route.name === 'profil') iconName = isFocused ? 'person' : 'person-outline';

                if (['sitemap', '+not-found', 'explore', 'scan'].includes(route.name)) return null;

                const tabItem = (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        activeOpacity={0.6}
                        style={styles.tabItem}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                    >
                        <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                            <Ionicons name={iconName} size={24} color={isFocused ? colors.accent : colors.green4} />
                            {isFocused && <View style={[styles.activeDot, { backgroundColor: colors.accent }]} />}
                        </View>
                    </TouchableOpacity>
                );

                if (route.name === 'laporan') {
                    return (
                        <React.Fragment key="scan-fragment">
                            <ScanButton onPress={handleScan} colors={colors} />
                            {tabItem}
                        </React.Fragment>
                    );
                }

                return tabItem;
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        elevation: 10,
        height: 60,
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        borderRadius: 30,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'space-around',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0px 4px 10px rgba(4, 63, 46, 0.3)',
            }
        }),
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    activeIconContainer: {},
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
    scanButtonContainer: {
        top: -24,
        zIndex: 10,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
    },
    scanButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
            }
        }),
    },
});

