import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme/AppTheme';

const { width } = Dimensions.get('window');

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    buttons?: AlertButton[];
    onClose: () => void;
    type?: 'success' | 'info' | 'warning' | 'error';
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    alertContainer: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    buttonDefault: {
        backgroundColor: colors.primarySubtle,
    },
    buttonDestructive: {
        backgroundColor: colors.dangerBg,
    },
    buttonCancel: {
        backgroundColor: colors.surfaceSubtle,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    textDefault: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    textDestructive: {
        color: colors.danger,
        fontWeight: 'bold',
        fontSize: 16,
    },
    textCancel: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 16,
    },
});

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
    visible,
    title,
    message,
    buttons = [{ text: 'OK', style: 'default' }],
    onClose,
    type = 'info'
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const actionButtons = buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default', onPress: onClose }];

    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: colors.success };
            case 'error': return { name: 'alert-circle', color: colors.danger };
            case 'warning': return { name: 'warning', color: colors.warning };
            default: return { name: 'information-circle', color: colors.primary };
        }
    };

    const iconData = getIcon();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={iconData.name as any} size={48} color={iconData.color} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {actionButtons.map((btn, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    btn.style === 'cancel' && styles.buttonCancel,
                                    btn.style === 'destructive' && styles.buttonDestructive,
                                    (btn.style === 'default' || !btn.style) && styles.buttonDefault,
                                    actionButtons.length > 1 && { flex: 1, marginHorizontal: 6 }
                                ]}
                                onPress={() => {
                                    if (btn.onPress) btn.onPress();
                                    else onClose();
                                }}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    btn.style === 'cancel' && styles.textCancel,
                                    btn.style === 'destructive' && styles.textDestructive,
                                    (btn.style === 'default' || !btn.style) && styles.textDefault
                                ]}>
                                    {btn.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
