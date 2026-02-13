import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../contexts/ThemeContext';
import { CustomHeader } from '../../../components/CustomHeader';
import { CustomButton } from '../../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIuranViewModel } from './IuranViewModel';
import { IuranStyles as styles } from './IuranStyles';

import { CustomAlertModal } from '../../../components/CustomAlertModal';

export default function IuranScreen() {
    const router = useRouter();
    const {
        currentMonth,
        amountDue,
        isPaid,
        history,
        handlePay,
        toggleExpand,
        handleDownloadReceipt,
        alertVisible,
        alertConfig,
        hideAlert
    } = useIuranViewModel();
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.green1} />
            <CustomHeader title="Manajemen Iuran" showBack={false} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Billing Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.billingCard, { backgroundColor: colors.backgroundCard }]}>
                    <View style={styles.billingHeader}>
                        <View>
                            <Text style={[styles.monthText, { color: colors.textSecondary }]}>{currentMonth}</Text>
                            <Text style={[styles.amountText, { color: colors.green5 }]}>{amountDue}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: isPaid ? '#E8F5E9' : '#FFEBEE' }]}>
                            <Text style={[styles.statusText, { color: isPaid ? colors.success : colors.danger }]}>
                                {isPaid ? 'Lunas' : 'Belum Dibayar'}
                            </Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <CustomButton
                            title="Bayar Sekarang"
                            onPress={handlePay}
                            variant="primary"
                            style={{ flex: 1 }}
                        />
                    </View>
                </Animated.View>

                {/* History Section */}
                <View style={styles.historyHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.green5 }]}>Riwayat Pembayaran</Text>
                    <TouchableOpacity onPress={() => router.push('/iuran/history')}>
                        <Text style={{ color: colors.green3, fontSize: 13, fontWeight: '600' }}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>

                <Animated.View entering={FadeInDown.delay(250).duration(500)}>
                    {history.map((item) => (
                        <View key={item.id} style={[styles.historyItem, { backgroundColor: colors.backgroundCard }]}>
                            <TouchableOpacity
                                style={styles.historyMain}
                                onPress={() => toggleExpand(item.id)}
                                activeOpacity={0.7}
                            >
                                <View>
                                    <Text style={[styles.historyPeriod, { color: colors.textPrimary }]}>{item.period}</Text>
                                    <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{item.date}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.historyAmount, { color: colors.green5 }]}>{item.amount}</Text>
                                    <Text style={[styles.historyStatus, { color: item.status === 'Lunas' ? colors.success : (item.status === 'Terlambat' ? colors.danger : colors.warning) }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Expandable Details */}
                            {item.isExpanded && (
                                <View style={[styles.expandedContainer, { borderTopColor: colors.border }]}>
                                    {item.details.map((detail, index) => (
                                        <View key={index} style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{detail.label}</Text>
                                            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{detail.value}</Text>
                                        </View>
                                    ))}

                                    {item.status === 'Lunas' && (
                                        <TouchableOpacity
                                            style={styles.downloadButton}
                                            onPress={() => handleDownloadReceipt(item.period)}
                                        >
                                            <Ionicons name="download-outline" size={16} color={colors.green5} />
                                            <Text style={styles.downloadText}>Unduh Kuitansi</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                </Animated.View>

            </ScrollView>

            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />
        </SafeAreaView>
    );
}
