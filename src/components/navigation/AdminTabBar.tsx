import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export const AdminTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.tabBarContainer, { backgroundColor: '#FFFFFF' }]}>
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
                // Admin Route Mapping
                switch (route.name) {
                    case 'index':
                        iconName = isFocused ? 'grid' : 'grid-outline';
                        break;
                    case 'users':
                        iconName = isFocused ? 'people' : 'people-outline';
                        break;
                    case 'laporan':
                        iconName = isFocused ? 'document-text' : 'document-text-outline';
                        break;
                    case 'news':
                        iconName = isFocused ? 'newspaper' : 'newspaper-outline';
                        break;
                    case 'profile':
                        iconName = isFocused ? 'person' : 'person-outline';
                        break;
                    default:
                        iconName = 'alert-circle-outline';
                }

                // Filter out any route that is not explicitly handled to avoid '?' icon
                if (!['index', 'users', 'laporan', 'profile', 'news'].includes(route.name)) return null;

                if (['sitemap', '+not-found', 'explore'].includes(route.name)) return null;

                return (
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
                            <Ionicons
                                name={iconName}
                                size={24}
                                // Use Primary Color (Green) for active, Gray for inactive
                                color={isFocused ? '#2E7D32' : '#9E9E9E'}
                            />
                            {isFocused && <View style={[styles.activeDot, { backgroundColor: '#2E7D32' }]} />}
                        </View>
                    </TouchableOpacity>
                );
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
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
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
});
