import React, { useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    FadeIn,
    SlideInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ─────────────────────────────────────────────────

export type SosStep = 'idle' | 'permission' | 'gps' | 'sending' | 'success' | 'error';

export interface SosLoadingOverlayProps {
    visible: boolean;
    step: SosStep;
    onSmsFallback?: () => void;
    onDismiss?: () => void;
}

// ─── Step Config ────────────────────────────────────────────

const STEPS: { key: SosStep; label: string; icon: string }[] = [
    { key: 'permission', label: 'Mendapatkan izin lokasi', icon: 'shield-checkmark-outline' },
    { key: 'gps', label: 'Mendeteksi sinyal GPS', icon: 'navigate-outline' },
    { key: 'sending', label: 'Mengirim sinyal ke petugas', icon: 'send-outline' },
];

const STEP_ORDER: SosStep[] = ['permission', 'gps', 'sending', 'success', 'error'];

function getStepStatus(currentStep: SosStep, stepKey: SosStep): 'done' | 'active' | 'pending' {
    if (currentStep === 'success') return 'done';
    const currentIdx = STEP_ORDER.indexOf(currentStep);
    const stepIdx = STEP_ORDER.indexOf(stepKey);
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
}

// ─── Pulse Animation Component ───────────────────────────────

function PulseIcon() {
    const scale1 = useSharedValue(1);
    const scale2 = useSharedValue(1);
    const opacity1 = useSharedValue(0.6);
    const opacity2 = useSharedValue(0.3);

    useEffect(() => {
        scale1.value = withRepeat(
            withSequence(
                withTiming(1.6, { duration: 800, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 800, easing: Easing.in(Easing.ease) })
            ), -1, false
        );
        opacity1.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 800 }),
                withTiming(0.5, { duration: 800 })
            ), -1, false
        );
        scale2.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 400 }),
                withTiming(2.2, { duration: 1200, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 0 })
            ), -1, false
        );
        opacity2.value = withRepeat(
            withSequence(
                withTiming(0.25, { duration: 400 }),
                withTiming(0, { duration: 1200 })
            ), -1, false
        );
    }, []);

    const ring1Style = useAnimatedStyle(() => ({
        transform: [{ scale: scale1.value }],
        opacity: opacity1.value,
    }));
    const ring2Style = useAnimatedStyle(() => ({
        transform: [{ scale: scale2.value }],
        opacity: opacity2.value,
    }));

    return (
        <View style={styles.pulseContainer}>
            <Animated.View style={[styles.pulseRing, styles.pulseRing2, ring2Style]} />
            <Animated.View style={[styles.pulseRing, styles.pulseRing1, ring1Style]} />
            <View style={styles.iconCircle}>
                <Ionicons name="warning" size={42} color="#fff" />
            </View>
        </View>
    );
}

// ─── Success Icon Component ──────────────────────────────────

function SuccessIcon() {
    const scale = useSharedValue(0);
    useEffect(() => {
        scale.value = withSequence(
            withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(2)) }),
            withTiming(1, { duration: 150 })
        );
    }, []);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
        <Animated.View style={[styles.successCircle, style]}>
            <Ionicons name="checkmark" size={48} color="#fff" />
        </Animated.View>
    );
}

// ─── Main Component ──────────────────────────────────────────

export function SosLoadingOverlay({ visible, step, onSmsFallback, onDismiss }: SosLoadingOverlayProps) {
    const isSuccess = step === 'success';
    const isError = step === 'error';
    const isActive = !isSuccess && !isError && step !== 'idle';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            {/* Dark overlay background — cross platform, no expo-blur needed */}
            <View style={styles.androidBlur} />

            <View style={styles.overlay}>
                <Animated.View
                    entering={SlideInUp.duration(400).springify()}
                    style={styles.card}
                >
                    {/* Header Label */}
                    <View style={styles.headerBadge}>
                        <View style={styles.headerDot} />
                        <Text style={styles.headerBadgeText}>
                            {isSuccess ? 'BERHASIL' : isError ? 'GAGAL' : 'DARURAT AKTIF'}
                        </Text>
                    </View>

                    {/* Icon Area */}
                    <View style={styles.iconArea}>
                        {isSuccess ? (
                            <Animated.View entering={FadeIn.duration(300)}>
                                <SuccessIcon />
                            </Animated.View>
                        ) : isError ? (
                            <Animated.View entering={FadeIn.duration(300)} style={styles.errorCircle}>
                                <Ionicons name="close" size={48} color="#fff" />
                            </Animated.View>
                        ) : (
                            <PulseIcon />
                        )}
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, isSuccess && styles.titleSuccess, isError && styles.titleError]}>
                        {isSuccess ? 'SOS Terkirim!' : isError ? 'Gagal Mengirim' : 'SINYAL DARURAT'}
                    </Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        {isSuccess
                            ? 'Sinyal dan lokasi GPS Anda telah dikirim ke petugas keamanan.'
                            : isError
                                ? 'Tidak ada koneksi internet. Gunakan SMS darurat sebagai alternatif.'
                                : 'Harap tunggu, jangan tutup aplikasi...'}
                    </Text>

                    {/* Steps Indicator */}
                    {!isSuccess && !isError && (
                        <View style={styles.stepsContainer}>
                            {STEPS.map((s) => {
                                const status = getStepStatus(step, s.key);
                                return (
                                    <View key={s.key} style={styles.stepRow}>
                                        <View style={[
                                            styles.stepIconWrap,
                                            status === 'done' && styles.stepIconDone,
                                            status === 'active' && styles.stepIconActive,
                                            status === 'pending' && styles.stepIconPending,
                                        ]}>
                                            {status === 'done' ? (
                                                <Ionicons name="checkmark" size={14} color="#fff" />
                                            ) : status === 'active' ? (
                                                <ActivityDot />
                                            ) : (
                                                <Ionicons name={s.icon as any} size={14} color="#ffffff40" />
                                            )}
                                        </View>
                                        <Text style={[
                                            styles.stepText,
                                            status === 'done' && styles.stepTextDone,
                                            status === 'active' && styles.stepTextActive,
                                            status === 'pending' && styles.stepTextPending,
                                        ]}>
                                            {s.label}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Action buttons */}
                    {isSuccess && (
                        <Animated.View entering={FadeIn.delay(500).duration(400)} style={{ width: '100%' }}>
                            <TouchableOpacity style={styles.btnSuccess} onPress={onDismiss}>
                                <Text style={styles.btnText}>Tutup</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {isError && (
                        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.errorButtons}>
                            <TouchableOpacity style={styles.btnCancel} onPress={onDismiss}>
                                <Text style={styles.btnCancelText}>Tutup</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnSms} onPress={onSmsFallback}>
                                <Ionicons name="chatbox-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={styles.btnText}>Kirim SMS Darurat</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

// ─── Blinking Activity Dot ───────────────────────────────────

function ActivityDot() {
    const opacity = useSharedValue(1);
    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.2, { duration: 400 }),
                withTiming(1, { duration: 400 })
            ), -1, false
        );
    }, []);
    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6F00' }, style]} />
    );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    androidBlur: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 0, 0, 0.93)',
    },
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#1A0505',
        borderRadius: 28,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF1A1A30',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF1A1A20',
        borderRadius: 100,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FF1A1A40',
    },
    headerDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#FF4444',
        marginRight: 8,
    },
    headerBadgeText: {
        color: '#FF6666',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
    },
    iconArea: {
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
    },
    // Pulse
    pulseContainer: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#CC0000',
    },
    pulseRing1: { backgroundColor: '#CC0000' },
    pulseRing2: { backgroundColor: '#880000' },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#CC0000',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FF4444',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 12,
        elevation: 10,
    },
    // Success / Error
    successCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#1B5E20',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
    },
    errorCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#4A0000',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FF5252',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 8,
        textAlign: 'center',
    },
    titleSuccess: { color: '#66BB6A' },
    titleError: { color: '#EF5350' },
    subtitle: {
        color: '#FFFFFF80',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    // Steps
    stepsContainer: {
        width: '100%',
        gap: 12,
        marginBottom: 8,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIconDone: { backgroundColor: '#2E7D32' },
    stepIconActive: { backgroundColor: '#E65100', borderWidth: 2, borderColor: '#FF6F00' },
    stepIconPending: { backgroundColor: '#FFFFFF10', borderWidth: 1, borderColor: '#ffffff20' },
    stepText: { fontSize: 13, flex: 1 },
    stepTextDone: { color: '#81C784' },
    stepTextActive: { color: '#FFB74D', fontWeight: '700' },
    stepTextPending: { color: '#FFFFFF30' },
    // Buttons
    btnSuccess: {
        marginTop: 20,
        backgroundColor: '#2E7D32',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        width: '100%',
    },
    errorButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
        width: '100%',
    },
    btnCancel: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF20',
    },
    btnCancelText: { color: '#FFFFFF60', fontWeight: '600', fontSize: 14 },
    btnSms: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#B71C1C',
    },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
