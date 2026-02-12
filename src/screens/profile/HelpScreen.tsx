import React from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { CustomHeader } from '../../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
            <CustomHeader title="Bantuan" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Hubungi Pengurus RT</Text>
                    <Text style={styles.cardText}>
                        Jika anda mengalami kendala teknis atau memiliki pertanyaan seputar iuran dan laporan, silahkan hubungi pengurus RT melalui kontak di bawah ini.
                    </Text>

                    <TouchableOpacity style={styles.contactRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="call" size={20} color={Colors.white} />
                        </View>
                        <Text style={styles.contactText}>+62 812 3456 7890 (Pak RT)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
                        </View>
                        <Text style={styles.contactText}>+62 812 3456 7890 (WhatsApp)</Text>
                    </TouchableOpacity>
                </View>

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
