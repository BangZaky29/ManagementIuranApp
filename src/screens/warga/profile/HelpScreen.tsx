import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchComplexInfo, ComplexInfo } from '../../../services/complexService';
import * as Linking from 'expo-linking';

export default function HelpScreen() {
    const { profile } = useAuth();
    const [info, setInfo] = useState<ComplexInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!profile?.housing_complex_id) {
            setIsLoading(false);
            return;
        }
        try {
            const data = await fetchComplexInfo(profile.housing_complex_id);
            setInfo(data);
        } catch (error) {
            console.error('HelpScreen load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleWA = (phone: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
            <CustomHeader title="Bantuan" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>
                {isLoading ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator color={Colors.primary} />
                    </View>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Hubungi Pengurus RT</Text>
                        <Text style={styles.cardText}>
                            {info?.help_note || 'Jika anda mengalami kendala teknis atau memiliki pertanyaan seputar iuran dan laporan, silahkan hubungi pengurus RT melalui kontak di bawah ini.'}
                        </Text>

                        {info?.help_phone && (
                            <TouchableOpacity style={styles.contactRow} onPress={() => handleCall(info.help_phone!)}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="call" size={20} color={Colors.white} />
                                </View>
                                <Text style={styles.contactText}>{info.help_phone} (Pak RT)</Text>
                            </TouchableOpacity>
                        )}

                        {info?.help_whatsapp && (
                            <TouchableOpacity style={styles.contactRow} onPress={() => handleWA(info.help_whatsapp!)}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
                                </View>
                                <Text style={styles.contactText}>{info.help_whatsapp} (WhatsApp)</Text>
                            </TouchableOpacity>
                        )}

                        {!info?.help_phone && !info?.help_whatsapp && (
                            <Text style={[styles.cardText, { fontStyle: 'italic', color: Colors.textSecondary }]}>
                                Belum ada kontak yang tersedia untuk komplek ini.
                            </Text>
                        )}
                    </View>
                )}

                <View style={[styles.card, { marginTop: 20 }]}>
                    <Text style={styles.cardTitle}>FAQ</Text>
                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Bagaimana cara membayar iuran?</Text>
                        <Text style={styles.faqAnswer}>Buka menu Iuran, lihat tagihan bulan ini, dan klik tombol 'Bayar Sekarang'.</Text>
                    </View>
                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Apakah bisa membayar sebagian?</Text>
                        <Text style={styles.faqAnswer}>Saat ini sistem hanya mendukung pembayaran penuh per periode bulan.</Text>
                    </View>
                </View>

                {info?.terms_conditions && (
                    <View style={[styles.card, { marginTop: 20 }]}>
                        <Text style={styles.cardTitle}>Syarat & Ketentuan Komplek</Text>
                        <Text style={styles.cardText}>{info.terms_conditions}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 12,
    },
    cardText: {
        fontSize: 14,
        color: Colors.textPrimary,
        marginBottom: 20,
        lineHeight: 20,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.green3, // Primary green
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.green5,
    },
    faqItem: {
        marginBottom: 16,
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 4,
    },
    faqAnswer: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});
