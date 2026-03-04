import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator, Alert, Platform, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemeColors } from '../../theme/AppTheme';

interface CustomButtonProps {
    title: string;
    onPress?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    style?: ViewStyle;
    textStyle?: TextStyle;
    loading?: boolean;
    isComingSoon?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    colors?: ThemeColors;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    loading = false,
    isComingSoon = false,
    icon,
    iconPosition = 'left',
    disabled = false,
    colors
}) => {
    // Determine colors to use: provided prop OR global Colors fallback
    const btnPrimary = colors?.primary || Colors.primary;
    const btnSecondary = colors?.primarySubtle || Colors.green2;
    const btnDanger = colors?.danger || Colors.danger;
    const btnTextPrimary = colors?.textPrimary || Colors.textPrimary;
    const btnWhite = colors?.textWhite || Colors.white;


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
        if (variant === 'primary') return btnPrimary;
        if (variant === 'danger') return btnDanger;
        if (variant === 'outline' || variant === 'ghost') return 'transparent';
        if (variant === 'secondary') return btnSecondary;
        return btnPrimary;
    };

    const getTextColor = () => {
        if (variant === 'outline') return btnPrimary;
        if (variant === 'ghost') return colors?.textSecondary || Colors.textSecondary;
        if (variant === 'secondary') return btnTextPrimary;
        return btnWhite;
    };

    const getSpinnerColor = () => {
        // @ts-ignore
        if (textStyle?.color) return textStyle.color;
        return getTextColor();
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                variant === 'outline' && styles.outlineButton,
                variant === 'outline' && { borderColor: btnPrimary },
                // Soft Shadow
                Platform.OS === 'ios' && {
                    shadowColor: btnPrimary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                },
                Platform.OS === 'android' && {
                    elevation: 4,
                },
                style,
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
            disabled={loading || disabled}
        >
            {loading ? (
                <ActivityIndicator color={getSpinnerColor()} />
            ) : (
                <View style={styles.contentContainer}>
                    {icon && iconPosition === 'left' && (
                        <View style={{ marginRight: 8 }}>{icon}</View>
                    )}

                    <Text style={[styles.text, { color: getTextColor(), textAlign: 'center' }, textStyle]}>
                        {title}
                    </Text>

                    {icon && iconPosition === 'right' && (
                        <View style={{ marginLeft: 8 }}>{icon}</View>
                    )}
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
    },
    outlineButton: {
        borderWidth: 1.5,
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
