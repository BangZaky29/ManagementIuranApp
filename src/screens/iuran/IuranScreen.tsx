import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomButton } from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIuranViewModel } from './IuranViewModel';
import { IuranStyles as styles } from './IuranStyles';

import { CustomAlertModal } from '../../components/CustomAlertModal';

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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
            <CustomHeader title="Manajemen Iuran" showBack={false} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Billing Card */}
                <View style={styles.billingCard}>
                    <View style={styles.billingHeader}>
                        <View>
                            <Text style={styles.monthText}>{currentMonth}</Text>
                            <Text style={styles.amountText}>{amountDue}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: isPaid ? '#E8F5E9' : '#FFEBEE' }]}>
                            <Text style={[styles.statusText, { color: isPaid ? Colors.success : Colors.danger }]}>
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
                            style={{ flex: 1, marginRight: 10 }}
                        />
                        <TouchableOpacity style={styles.secondaryButton}>
                            <Ionicons name="download-outline" size={20} color={Colors.green5} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* History Section */}
                <View style={styles.historyHeader}>
                    <Text style={styles.sectionTitle}>Riwayat Pembayaran</Text>
                    <TouchableOpacity onPress={() => router.push('/iuran/history')}>
                        <Text style={{ color: Colors.green3, fontSize: 13, fontWeight: '600' }}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    {history.map((item) => (
                        <View key={item.id} style={styles.historyItem}>
                            <TouchableOpacity
                                style={styles.historyMain}
                                onPress={() => toggleExpand(item.id)}
                                activeOpacity={0.7}
                            >
                                <View>
                                    <Text style={styles.historyPeriod}>{item.period}</Text>
                                    <Text style={styles.historyDate}>{item.date}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.historyAmount}>{item.amount}</Text>
                                    <Text style={[styles.historyStatus, { color: item.status === 'Lunas' ? Colors.success : (item.status === 'Terlambat' ? Colors.danger : Colors.warning) }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Expandable Details */}
                            {item.isExpanded && (
                                <View style={styles.expandedContainer}>
                                    {item.details.map((detail, index) => (
                                        <View key={index} style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>{detail.label}</Text>
                                            <Text style={styles.detailValue}>{detail.value}</Text>
                                        </View>
                                    ))}

                                    {item.status === 'Lunas' && (
                                        <TouchableOpacity
                                            style={styles.downloadButton}
                                            onPress={() => handleDownloadReceipt(item.period)}
                                        >
                                            <Ionicons name="download-outline" size={16} color={Colors.green5} />
                                            <Text style={styles.downloadText}>Unduh Kuitansi</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                </View>

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
