import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator, Alert, Platform, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface CustomButtonProps {
    title: string;
    onPress?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    style?: ViewStyle;
    textStyle?: TextStyle;
    loading?: boolean;
    isComingSoon?: boolean;
    icon?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    loading = false,
    isComingSoon = false,
    icon
}) => {

    const handlePress = () => {
        if (isComingSoon) {
            if (Platform.OS === 'web') {
                window.alert('Fitur ini akan segera hadir!');
            } else {
                Alert.alert('Coming Soon', 'Fitur ini akan segera hadir!');
            }
            return;
        }
        onPress?.();
    };

    const getBackgroundColor = () => {
        if (variant === 'primary') return Colors.primary;
        if (variant === 'danger') return Colors.danger;
        if (variant === 'outline' || variant === 'ghost') return 'transparent';
        if (variant === 'secondary') return Colors.green2;
        return Colors.primary;
    };

    const getTextColor = () => {
        if (variant === 'outline') return Colors.primary;
        if (variant === 'ghost') return Colors.textSecondary;
        if (variant === 'secondary') return Colors.textPrimary;
        return Colors.white;
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                variant === 'outline' && styles.outlineButton,
                style,
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <View style={styles.contentContainer}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 30, // Pill shape for modern look
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        // Soft Shadow
        ...Platform.select({
            ios: {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 4px 10px rgba(120, 197, 28, 0.3)',
            }
        }),
    },
    outlineButton: {
        borderWidth: 1.5,
        borderColor: Colors.primary,
        shadowColor: 'transparent',
        elevation: 0,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
