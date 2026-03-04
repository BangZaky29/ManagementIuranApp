import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface PanicCountdownProps {
    visible: boolean;
    timeLeft: number; // 10 to 0
    clicksRemaining: number;
}

const { width } = Dimensions.get('window');

export const PanicCountdown: React.FC<PanicCountdownProps> = ({ visible, timeLeft, clicksRemaining }) => {
    const insets = useSafeAreaInsets();
    const progressAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            // Slide in animation
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 40,
                friction: 7
            }).start();

            // Animate progress bar
            Animated.timing(progressAnim, {
                toValue: timeLeft / 10,
                duration: 1000,
                useNativeDriver: false,
            }).start();
        } else {
            // Slide out animation
            Animated.timing(slideAnim, {
                toValue: -200,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                progressAnim.setValue(1);
            });
        }
    }, [visible, timeLeft]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    paddingTop: Math.max(insets.top, 10),
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="warning" size={22} color={Colors.white} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Mode Darurat Aktif</Text>
                    <Text style={styles.subtitle}>
                        Tekan {clicksRemaining}x lagi untuk kirim SOS
                    </Text>
                </View>
                <View style={styles.timerBadge}>
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                </View>
            </View>
            <View style={styles.progressTrack}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%']
                            })
                        }
                    ]}
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#D32F2F', // Stronger Red
        zIndex: 9999,
        paddingBottom: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        marginTop: 1,
    },
    timerBadge: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        minWidth: 45,
        alignItems: 'center',
    },
    timerText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
        fontVariant: ['tabular-nums'],
    },
    progressTrack: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFEBEE',
    },
});
