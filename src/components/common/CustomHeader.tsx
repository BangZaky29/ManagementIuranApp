import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme/AppTheme';

interface CustomHeaderProps {
    title: string;
    subtitle?: string | null;
    showBack?: boolean;
    rightIcon?: React.ReactNode;
    onBack?: () => void;
    avatarUrl?: string | null;
    showAvatar?: boolean;
    colors?: ThemeColors;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
    title,
    subtitle,
    showBack = false,
    rightIcon,
    onBack,
    avatarUrl,
    showAvatar = false,
    colors: overrideColors,
}) => {
    const router = useRouter();
    const { colors: defaultColors } = useTheme();
    const colors = overrideColors || defaultColors;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.green1 }]}>
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    {showBack && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.green5} />
                        </TouchableOpacity>
                    )}
                </View>

                {showAvatar && (
                    <View style={styles.avatarContainer}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: colors.surfaceSubtle, justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="person" size={16} color={colors.textSecondary} />
                            </View>
                        )}
                    </View>
                )}

                <View style={{ flex: 1, marginLeft: showAvatar ? 12 : 0, justifyContent: 'center' }}>
                    <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: colors.primary }]} numberOfLines={1}>{subtitle}</Text>
                    )}
                </View>

                <View style={styles.rightContainer}>
                    {rightIcon}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
    },
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 2,
    },
    avatarContainer: {
        marginLeft: 4,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
});

