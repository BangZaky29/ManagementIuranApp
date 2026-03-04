import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme/AppTheme';

interface CustomHeaderProps {
    title: string;
    showBack?: boolean;
    rightIcon?: React.ReactNode;
    onBack?: () => void;
    colors?: ThemeColors;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
    title,
    showBack = false,
    rightIcon,
    onBack,
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

                <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

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
        fontSize: 20,
        fontWeight: 'bold',
    },
});

