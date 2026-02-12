import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle, TextStyle, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    style?: ViewStyle;
    inputStyle?: TextStyle;
    error?: string;
    iconName?: keyof typeof Ionicons.glyphMap;
}

export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    style,
    inputStyle,
    error,
    iconName,
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    !!error && styles.inputError,
                ]}
            >
                {iconName && (
                    <Ionicons
                        name={iconName}
                        size={20}
                        color={isFocused ? Colors.primary : Colors.textSecondary}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        inputStyle,
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!isPasswordVisible && secureTextEntry}
                    keyboardType={keyboardType}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                />
                {secureTextEntry && (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color={Colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
        paddingLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // Modern minimalist style: No heavy border, just soft background
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14, // Taller input
        // Soft shadow
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
            web: {
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            }
        }),
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputFocused: {
        borderColor: Colors.primary,
        backgroundColor: '#F9FCF5', // Very light green tint on focus
    },
    inputError: {
        borderColor: Colors.danger,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 5,
    },
    errorText: {
        color: Colors.danger,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
