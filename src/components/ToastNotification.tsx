import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
    visible: boolean;
    message: string;
    onHide: () => void;
    type?: 'success' | 'error';
}

export const ToastNotification: React.FC<ToastProps> = ({
    visible,
    message,
    onHide,
    type = 'success'
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;
    const [show, setShow] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShow(true);
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                })
            ]).start(() => {
                // Auto hide after 2 seconds
                setTimeout(() => {
                    if (visible) onHide();
                }, 2000);
            });
        } else {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -20,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setShow(false);
            });
        }
    }, [visible]);

    if (!show) return null;

    return (
        <Animated.View style={[
            styles.container,
            { opacity, transform: [{ translateY }] },
            type === 'error' && styles.errorContainer
        ]}>
            <Ionicons
                name={type === 'success' ? "checkmark-circle" : "alert-circle"}
                size={20}
                color="white"
            />
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        backgroundColor: Colors.success || '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
        zIndex: 10000, // Reduced zIndex to be safe but high enough
        gap: 8,
    },
    errorContainer: {
        backgroundColor: Colors.danger || '#F44336',
    },
    message: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    }
});
