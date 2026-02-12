import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

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

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
    visible,
    title,
    message,
    buttons = [{ text: 'OK', style: 'default' }],
    onClose,
    type = 'info'
}) => {
    // If no buttons provided (shouldn't happen due to default), fallback
    const actionButtons = buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default', onPress: onClose }];

    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: Colors.success };
            case 'error': return { name: 'alert-circle', color: Colors.danger };
            case 'warning': return { name: 'warning', color: Colors.warning };
            default: return { name: 'information-circle', color: Colors.green3 };
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

const styles = StyleSheet.create({
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
        backgroundColor: Colors.white,
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
        color: Colors.green5,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: Colors.textSecondary,
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
        backgroundColor: Colors.green1, // Light green background for primary
    },
    buttonDestructive: {
        backgroundColor: '#FFEBEE', // Light red
    },
    buttonCancel: {
        backgroundColor: '#F5F5F5', // Light grey
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    textDefault: {
        color: Colors.green5,
        fontWeight: 'bold',
        fontSize: 16,
    },
    textDestructive: {
        color: Colors.danger,
        fontWeight: 'bold',
        fontSize: 16,
    },
    textCancel: {
        color: Colors.textSecondary,
        fontWeight: '600',
        fontSize: 16,
    }
});
